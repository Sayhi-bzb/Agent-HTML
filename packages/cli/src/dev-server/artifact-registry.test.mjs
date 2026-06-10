import EventEmitter from "node:events"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { describe, expect, it, vi } from "vitest"

import {
  artifactsUpdatedEventName,
  createArtifactRegistry,
} from "./artifact-registry.mjs"

function createViteMock() {
  const watcher = new EventEmitter()
  watcher.add = vi.fn()
  watcher.off = watcher.removeListener.bind(watcher)

  return {
    watcher,
    ws: {
      send: vi.fn(),
    },
  }
}

async function createArtifactWorkspace() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-registry-"))
  const artifactsRoot = path.join(root, "agent-html", "artifacts")
  await fs.mkdir(artifactsRoot, { recursive: true })

  return {
    artifactsRoot,
    root,
  }
}

function artifactSource({ blockId = "summary", title = "Summary" } = {}) {
  return [
    'import { Artifact, Block } from "@agent-html/react"',
    "",
    "export default function DemoArtifact() {",
    "  return (",
    '    <Artifact title="Demo">',
    `      <Block id="${blockId}" title="${title}">Content</Block>`,
    "    </Artifact>",
    "  )",
    "}",
    "",
  ].join("\n")
}

describe("artifact registry", () => {
  it("builds an initial artifact snapshot", async () => {
    const { artifactsRoot, root } = await createArtifactWorkspace()
    await fs.writeFile(
      path.join(artifactsRoot, "demo.artifact.tsx"),
      artifactSource()
    )
    const vite = createViteMock()
    const registry = createArtifactRegistry({ root, vite })

    await registry.start()

    expect(registry.getSnapshot()).toMatchObject({
      artifacts: [
        {
          blocks: [{ id: "summary", title: "Summary" }],
          filePath: "agent-html/artifacts/demo.artifact.tsx",
        },
      ],
      guardIssues: [],
      status: "ready",
      version: 1,
    })
    expect(vite.watcher.add).toHaveBeenCalled()
    expect(vite.ws.send).toHaveBeenCalledWith({
      data: {
        reason: "initial",
        version: 1,
      },
      event: artifactsUpdatedEventName,
      type: "custom",
    })

    await registry.close()
  })

  it("updates a changed artifact without rebuilding from route requests", async () => {
    const { artifactsRoot, root } = await createArtifactWorkspace()
    const artifactPath = path.join(artifactsRoot, "demo.artifact.tsx")
    await fs.writeFile(artifactPath, artifactSource())
    const vite = createViteMock()
    const registry = createArtifactRegistry({ root, vite })
    await registry.start()

    await fs.writeFile(
      artifactPath,
      artifactSource({ blockId: "details", title: "Details" })
    )
    vite.watcher.emit("change", artifactPath)
    await new Promise((resolve) => setTimeout(resolve, 80))

    expect(registry.getSnapshot().artifacts).toEqual([
      {
        blocks: [{ id: "details", title: "Details" }],
        filePath: "agent-html/artifacts/demo.artifact.tsx",
      },
    ])
    expect(registry.getSnapshot().version).toBe(2)
    expect(vite.ws.send).toHaveBeenLastCalledWith({
      data: {
        reason: "file-change",
        version: 2,
      },
      event: artifactsUpdatedEventName,
      type: "custom",
    })

    await registry.close()
  })

  it("refreshes route polling snapshots without broadcasting HMR updates", async () => {
    const { artifactsRoot, root } = await createArtifactWorkspace()
    await fs.writeFile(
      path.join(artifactsRoot, "demo.artifact.tsx"),
      artifactSource()
    )
    const vite = createViteMock()
    const registry = createArtifactRegistry({ root, vite })
    await registry.start()
    vite.ws.send.mockClear()

    await registry.refresh({
      broadcast: false,
      reason: "artifact-poll",
    })

    expect(registry.getSnapshot()).toMatchObject({
      artifacts: [
        {
          filePath: "agent-html/artifacts/demo.artifact.tsx",
        },
      ],
      status: "ready",
      version: 1,
    })
    expect(vite.ws.send).not.toHaveBeenCalled()

    await registry.close()
  })

  it("advances silent polling snapshots when discovery finds new artifacts", async () => {
    const { artifactsRoot, root } = await createArtifactWorkspace()
    await fs.writeFile(
      path.join(artifactsRoot, "demo.artifact.tsx"),
      artifactSource()
    )
    const vite = createViteMock()
    const registry = createArtifactRegistry({ root, vite })
    await registry.start()
    vite.ws.send.mockClear()

    await fs.writeFile(
      path.join(artifactsRoot, "new-demo.artifact.tsx"),
      artifactSource({ blockId: "new", title: "New" })
    )
    await registry.refresh({
      broadcast: false,
      reason: "artifact-poll",
    })

    expect(registry.getSnapshot().artifacts).toHaveLength(2)
    expect(registry.getSnapshot().version).toBe(2)
    expect(vite.ws.send).not.toHaveBeenCalled()

    await registry.close()
  })

  it("removes deleted artifacts from the snapshot", async () => {
    const { artifactsRoot, root } = await createArtifactWorkspace()
    const artifactPath = path.join(artifactsRoot, "demo.artifact.tsx")
    await fs.writeFile(artifactPath, artifactSource())
    const vite = createViteMock()
    const registry = createArtifactRegistry({ root, vite })
    await registry.start()

    await fs.rm(artifactPath)
    vite.watcher.emit("unlink", artifactPath)
    await new Promise((resolve) => setTimeout(resolve, 80))

    expect(registry.getSnapshot().artifacts).toEqual([])
    expect(registry.getSnapshot().version).toBe(2)

    await registry.close()
  })
})
