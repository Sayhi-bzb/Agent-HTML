import path from "node:path"

import { describe, expect, it } from "vitest"

import { createCanvasEntryModule, toViteFsPath } from "./vite.mjs"

describe("Canvas Vite entry", () => {
  it("re-exports the selected source with a version query", () => {
    const root = path.resolve("workspace")
    const filePath = "agent-html/canvases/maps/overview.canvas.tsx"
    const source = createCanvasEntryModule({ filePath, root, version: 9 })

    expect(source).toBe(
      `export { default } from ${JSON.stringify(
        `${toViteFsPath(path.join(root, filePath))}?v=9`
      )}\n`
    )
  })

  it("rejects files outside the Canvas source root", () => {
    const root = path.resolve("workspace")
    expect(() =>
      createCanvasEntryModule({
        filePath: "agent-html/artifacts/demo.canvas.tsx",
        root,
      })
    ).toThrow("agent-html/canvases/**/*.canvas.tsx")
  })
})
