import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { buildDemoHost } from "./demo-build.mjs"

describe("demo-build", () => {
  it("writes an example pipeline manifest from artifact content", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-demo-"))
    const outDir = path.join(root, "dist-demo")
    const artifactsRoot = path.join(root, "agent-html", "artifacts")
    await fs.mkdir(artifactsRoot, { recursive: true })
    await fs.writeFile(
      path.join(artifactsRoot, "demo.artifact.tsx"),
      [
        'import { Block } from "@agent-html/react"',
        "export default function Demo() {",
        '  return <Block id="summary" title="Summary" />',
        "}",
        "",
      ].join("\n")
    )

    const result = await buildDemoHost({
      args: ["--root", root, "--out-dir", outDir],
      cwd: process.cwd(),
    })

    expect(result.artifactCount).toBe(1)
    const html = await fs.readFile(path.join(outDir, "index.html"), "utf8")
    expect(html).toContain('"pipeline":"example"')
    expect(html).toContain("data-agent-html-demo-root")
    expect(html).toContain("renderArtifacts")

    const manifest = JSON.parse(
      await fs.readFile(path.join(outDir, "artifacts.json"), "utf8")
    )
    expect(manifest).toMatchObject({
      contentSource: "artifacts",
      pipeline: "example",
      artifacts: [
        {
          blocks: [{ id: "summary", title: "Summary" }],
          filePath: "agent-html/artifacts/demo.artifact.tsx",
        },
      ],
    })
    await expect(
      fs.readFile(path.join(outDir, "styles.css"), "utf8")
    ).resolves.toContain(".agent-html-demo")
  })
})
