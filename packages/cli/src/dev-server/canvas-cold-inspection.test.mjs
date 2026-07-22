import fs from "node:fs/promises"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { createTestTempDir } from "../../../../config/test-temp.mjs"
import { readColdCanvasInspectionDocument } from "./canvas-cold-inspection.mjs"

describe("cold Canvas inspection", () => {
  it("combines static intent, persisted layout, and Kernel defaults", async () => {
    const root = await createTestTempDir("cold-canvas-inspection")
    const entryPath = path.join(
      root,
      "agent-html",
      "canvases",
      "demo.canvas.tsx"
    )
    await fs.mkdir(path.dirname(entryPath), { recursive: true })
    await fs.writeFile(
      entryPath,
      `
        import { Canvas, Node } from "@agent-html/react"
        export default function Demo() {
          return (
            <Canvas>
              <Node id="authored" />
              <Node id="persisted" />
            </Canvas>
          )
        }
      `
    )
    await fs.writeFile(
      entryPath.replace(/\.canvas\.tsx$/, ".layout.json"),
      JSON.stringify({
        nodes: {
          persisted: { height: 240, width: 400, x: -30, y: 80 },
        },
        version: 1,
      })
    )

    const document = await readColdCanvasInspectionDocument({
      entryPath,
      root,
      sourceFilePath: "agent-html/canvases/demo.canvas.tsx",
    })

    expect(document.nodes).toEqual([
      {
        height: 180,
        id: "authored",
        siblingOrder: 0,
        sources: ["agent-html/canvases/demo.canvas.tsx"],
        width: 320,
        x: 0,
        y: 0,
      },
      {
        height: 240,
        id: "persisted",
        siblingOrder: 1,
        sources: ["agent-html/canvases/demo.canvas.tsx"],
        width: 400,
        x: -30,
        y: 80,
      },
    ])
  })

  it("expands static intent components beside the Canvas", async () => {
    const root = await createTestTempDir("cold-canvas-components")
    const entryPath = path.join(
      root,
      "agent-html",
      "canvases",
      "demo",
      "demo.canvas.tsx"
    )
    await fs.mkdir(path.dirname(entryPath), { recursive: true })
    await fs.writeFile(
      entryPath,
      `
        import { Canvas, Node } from "@agent-html/react"
        import Region from "./region"
        export default function Demo() {
          return <Canvas><Node id="start" /><Region /></Canvas>
        }
      `
    )
    await fs.writeFile(
      path.join(path.dirname(entryPath), "region.tsx"),
      `
        import { Node } from "@agent-html/react"
        export default function Region() {
          return <><Node id="region-a" /><Node id="region-b" /></>
        }
      `
    )

    const document = await readColdCanvasInspectionDocument({
      entryPath,
      root,
      sourceFilePath: "agent-html/canvases/demo/demo.canvas.tsx",
    })
    expect(document.nodes.map((node) => node.id)).toEqual([
      "start",
      "region-a",
      "region-b",
    ])
    expect(document.nodes[1]).toMatchObject({ x: 368, y: 0 })
  })
})
