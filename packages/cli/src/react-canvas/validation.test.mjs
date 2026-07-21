import fs from "node:fs/promises"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { canvasRuntimeCatalog } from "@agent-html/kernel"
import { createTestTempDir } from "../../../../config/test-temp.mjs"
import {
  validateCanvasSources,
  validateRuntimeCatalog
} from "./validation.mjs"

describe("React Canvas validation adapter", () => {
  it("discovers sources and returns the Kernel diagnostic contract", async () => {
    const root = await createTestTempDir("validation")
    await fs.mkdir(path.join(root, "agent-html", "artifacts", "demo"), {
      recursive: true
    })
    await fs.writeFile(
      path.join(root, "agent-html", "artifacts", "demo.artifact.tsx"),
      `
        import { defineArtifact } from "@agent-html/react"
        export default defineArtifact({ title: "Demo", blocks: ["summary"] })
      `
    )
    await fs.writeFile(
      path.join(root, "agent-html", "artifacts", "demo", "summary.block.tsx"),
      `export default function Summary() { return <section className="bg-purple-900">Bad</section> }`
    )

    const report = await validateCanvasSources({ root })

    expect(report.artifacts).toHaveLength(1)
    expect(report.implementationSources).toHaveLength(1)
    expect(report.diagnostics).toContainEqual(
      expect.objectContaining({
        category: "style",
        code: "canvas/style/unsafe-class",
        filePath: "agent-html/artifacts/demo/summary.block.tsx"
      })
    )
  })

  it("requires the workspace manifest to match the Kernel catalog", async () => {
    const root = await createTestTempDir("validation-catalog")
    await fs.mkdir(path.join(root, "agent-html"), { recursive: true })
    await fs.writeFile(
      path.join(root, "agent-html", "package.json"),
      `${JSON.stringify({ dependencies: canvasRuntimeCatalog }, null, 2)}\n`
    )

    expect(await validateRuntimeCatalog({ root })).toEqual([])

    await fs.writeFile(
      path.join(root, "agent-html", "package.json"),
      `${JSON.stringify({ dependencies: { ...canvasRuntimeCatalog, obsolete: "1.0.0" } }, null, 2)}\n`
    )
    expect(await validateRuntimeCatalog({ root })).toContainEqual(
      expect.objectContaining({
        code: "canvas/manifest/catalog-drift",
        filePath: "agent-html/package.json"
      })
    )
  })
})
