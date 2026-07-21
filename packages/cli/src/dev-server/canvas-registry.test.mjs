import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it, vi } from "vitest"

import {
  canvasLayoutPathForEntry,
  canvasesUpdatedEventName,
  createCanvasRegistry,
} from "./canvas-registry.mjs"

const roots = []

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => fs.rm(root, { force: true, recursive: true }))
  )
})

async function createRoot() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-canvases-"))
  roots.push(root)
  return root
}

function createViteMock() {
  const listeners = new Map()
  return {
    emit(event, filePath) {
      listeners.get(event)?.(filePath)
    },
    watcher: {
      add: vi.fn(),
      off: vi.fn(),
      on: vi.fn((event, listener) => listeners.set(event, listener)),
    },
    ws: { send: vi.fn() },
  }
}

describe("Canvas registry", () => {
  it("discovers nested canvas entries without touching artifacts", async () => {
    const root = await createRoot()
    const canvasDir = path.join(root, "agent-html", "canvases", "dashboard")
    await fs.mkdir(canvasDir, { recursive: true })
    await fs.writeFile(
      path.join(canvasDir, "team-health.canvas.tsx"),
      "export default null"
    )
    const vite = createViteMock()
    const registry = createCanvasRegistry({ root, vite })

    await registry.start()

    expect(registry.getSnapshot()).toMatchObject({
      canvases: [
        {
          filePath: "agent-html/canvases/dashboard/team-health.canvas.tsx",
          layoutPath: "agent-html/canvases/dashboard/team-health.layout.json",
          title: "Team Health",
        },
      ],
      status: "ready",
    })
    expect(vite.ws.send).toHaveBeenCalledWith(
      expect.objectContaining({ event: canvasesUpdatedEventName })
    )
    await registry.close()
  })

  it("derives a colocated layout path", () => {
    expect(canvasLayoutPathForEntry("x/dashboard.canvas.tsx")).toBe(
      "x/dashboard.layout.json"
    )
  })

  it("publishes a new registry version when Canvas source changes", async () => {
    const root = await createRoot()
    const canvasDir = path.join(root, "agent-html", "canvases")
    const entryPath = path.join(canvasDir, "live.canvas.tsx")
    await fs.mkdir(canvasDir, { recursive: true })
    await fs.writeFile(entryPath, "export default null")
    const vite = createViteMock()
    const registry = createCanvasRegistry({ root, vite })

    await registry.start()
    const initialVersion = registry.getSnapshot().version
    vite.emit("change", entryPath)

    await vi.waitFor(() => {
      expect(registry.getSnapshot().version).toBe(initialVersion + 1)
    })
    expect(vite.ws.send).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ reason: "file-change" }),
        event: canvasesUpdatedEventName,
      })
    )
    await registry.close()
  })
})
