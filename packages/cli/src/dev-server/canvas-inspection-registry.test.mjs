import { describe, expect, it } from "vitest"

import { createCanvasInspectionRegistry } from "./canvas-inspection-registry.mjs"

const filePath = "agent-html/canvases/demo.canvas.tsx"

function document() {
  return {
    active: true,
    nodes: [
      {
        height: 80,
        id: "a",
        siblingOrder: 0,
        sources: [filePath],
        width: 100,
        x: 0,
        y: 0,
      },
      {
        height: 80,
        id: "b",
        siblingOrder: 1,
        sources: ["agent-html/canvases/content/b.tsx"],
        width: 100,
        x: 200,
        y: 0,
      },
    ],
    sourceFilePath: filePath,
    version: 2,
  }
}

describe("Canvas inspection registry", () => {
  it("publishes and queries a validated inspection document", () => {
    const registry = createCanvasInspectionRegistry()
    registry.publish(document())

    expect(registry.inspectOverview(filePath)).toMatchObject({
      nodeCount: 2,
    })
    expect(
      registry
        .inspectViewport(filePath, {
          height: 100,
          width: 120,
          x: 0,
          y: 0,
        })
        .nodes.map((node) => node.id)
    ).toEqual(["a"])
    expect(registry.inspectNode(filePath, "b")?.node.id).toBe("b")
    expect(registry.resolveNodeSource(filePath, "b")?.sources).toEqual([
      "agent-html/canvases/content/b.tsx",
    ])
  })

  it("clears stale documents and rejects invalid publications", () => {
    const registry = createCanvasInspectionRegistry()
    expect(() => registry.publish({ ...document(), nodes: [] })).not.toThrow()
    registry.clear(filePath)
    expect(registry.getDocument(filePath)).toBeNull()
    expect(() => registry.publish({ ...document(), version: 3 })).toThrow(
      "version"
    )
  })
})
