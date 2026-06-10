import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

import { buildDemoHost } from "./demo-build.mjs"

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  ".."
)

async function builtJavascriptIncludes(outDir, pattern) {
  const assets = await fs.readdir(path.join(outDir, "assets"))

  for (const asset of assets) {
    if (!asset.endsWith(".js")) {
      continue
    }

    const source = await fs.readFile(path.join(outDir, "assets", asset), "utf8")
    if (source.includes(pattern)) {
      return true
    }
  }

  return false
}

describe("demo-build", () => {
  it("writes an example pipeline manifest from artifact content", async () => {
    const outRoot = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-demo-"))
    const outDir = path.join(outRoot, "dist-demo")

    const result = await buildDemoHost({
      args: ["--root", repoRoot, "--out-dir", outDir],
      cwd: process.cwd(),
    })

    expect(result.artifactCount).toBeGreaterThan(0)
    const html = await fs.readFile(path.join(outDir, "index.html"), "utf8")
    expect(html).toContain("<title>Agent-HTML</title>")
    expect(html).toContain(
      '<link rel="icon" href="./__agent-html/public/ghost.svg" type="image/svg+xml" />'
    )
    expect(html).toContain('src="./assets/')

    const manifest = JSON.parse(
      await fs.readFile(path.join(outDir, "artifacts.json"), "utf8")
    )
    expect(manifest).toMatchObject({
      contentSource: "artifacts",
      description:
        "A canvas with AI for building, previewing, and refining React artifacts.",
      pipeline: "example",
      thumbnailUrl: "/__agent-html/public/assets/blocks.png",
      title: "Agent-HTML",
    })
    expect(manifest.artifacts.length).toBe(result.artifactCount)
    expect(manifest.artifacts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          blocks: expect.any(Array),
          filePath: expect.stringMatching(
            /^agent-html\/artifacts\/.+\.artifact\.tsx$/
          ),
          thumbnailUrl: "/__agent-html/public/assets/blocks.png",
        }),
      ])
    )
    const assets = await fs.readdir(path.join(outDir, "assets"))
    const css = (
      await Promise.all(
        assets
          .filter((asset) => asset.endsWith(".css"))
          .map((asset) => fs.readFile(path.join(outDir, "assets", asset), "utf8"))
      )
    ).join("\n")

    await expect(
      builtJavascriptIncludes(outDir, "__AGENT_HTML_HOST_CONFIG__")
    ).resolves.toBe(true)
    await expect(
      builtJavascriptIncludes(outDir, "__AGENT_HTML_STATIC_ARTIFACTS__")
    ).resolves.toBe(true)
    await expect(
      builtJavascriptIncludes(outDir, "The example demo is read-only.")
    ).resolves.toBe(true)
    await expect(
      builtJavascriptIncludes(outDir, "/__agent-html/artifact/create")
    ).resolves.toBe(true)
    await expect(
      fs.readFile(
        path.join(outDir, "__agent-html", "public", "ghost.svg"),
        "utf8"
      )
    ).resolves.toContain("<svg")
    await expect(
      fs.stat(path.join(outDir, "__agent-html", "public", "assets", "blocks.png"))
    ).resolves.toMatchObject({
      size: expect.any(Number),
    })
    expect(css).toContain(".canvas-host-shell")
  }, 120000)
})
