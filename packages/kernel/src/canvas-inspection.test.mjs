import { describe, expect, it } from "vitest"

import {
  CANVAS_INSPECTION_VERSION,
  createCanvasInspectionDocument,
  inspectCanvasNode,
  inspectCanvasOverview,
  inspectCanvasViewport,
  normalizeCanvasInspectionDocument,
  resolveCanvasNodeSource,
} from "./index.mjs"

function createDocument() {
  return createCanvasInspectionDocument({
    active: true,
    nodes: [
      {
        height: 300,
        id: "group",
        siblingOrder: 0,
        sources: ["agent-html/canvases/dashboard.canvas.tsx"],
        width: 400,
        x: -100,
        y: 50,
      },
      {
        height: 80,
        id: "card",
        parentId: "group",
        siblingOrder: 0,
        sources: ["agent-html/canvases/content/card.tsx"],
        width: 120,
        x: 40,
        y: 30,
      },
      {
        height: 100,
        id: "chart",
        siblingOrder: 1,
        sources: ["agent-html/canvases/dashboard.canvas.tsx"],
        width: 160,
        x: 500,
        y: 80,
      },
    ],
    sourceFilePath: "agent-html/canvases/dashboard.canvas.tsx",
  })
}

describe("Canvas inspection contract", () => {
  it("normalizes versioned framework-neutral records", () => {
    const document = createDocument()
    expect(document.version).toBe(CANVAS_INSPECTION_VERSION)
    expect(document.nodes[1]).toEqual({
      height: 80,
      id: "card",
      parentId: "group",
      siblingOrder: 0,
      sources: ["agent-html/canvases/content/card.tsx"],
      width: 120,
      x: 40,
      y: 30,
    })
    expect(normalizeCanvasInspectionDocument(document)).toEqual(document)
  })

  it("provides overview, viewport, Node detail, and source queries", () => {
    const document = createDocument()
    expect(inspectCanvasOverview(document)).toMatchObject({
      nodeCount: 3,
      rootNodeIds: ["group", "chart"],
    })
    expect(
      inspectCanvasViewport(document, {
        height: 100,
        width: 100,
        x: -80,
        y: 70,
      }).nodes.map((node) => node.id)
    ).toEqual(["group", "card"])
    expect(inspectCanvasNode(document, "card")).toMatchObject({
      node: { absoluteGeometry: { height: 80, width: 120, x: -60, y: 80 } },
      parentId: "group",
    })
    expect(resolveCanvasNodeSource(document, "card")).toEqual({
      canvasFilePath: "agent-html/canvases/dashboard.canvas.tsx",
      nodeId: "card",
      sources: ["agent-html/canvases/content/card.tsx"],
    })
  })

  it("rejects invalid versions, duplicate ids, and invalid geometry", () => {
    expect(() =>
      normalizeCanvasInspectionDocument({ ...createDocument(), version: 3 })
    ).toThrow("version")
    expect(() =>
      createCanvasInspectionDocument({
        ...createDocument(),
        nodes: [createDocument().nodes[0], createDocument().nodes[0]],
      })
    ).toThrow("duplicated")
    expect(() =>
      inspectCanvasViewport(createDocument(), {
        height: 0,
        width: 100,
        x: 0,
        y: 0,
      })
    ).toThrow("positive")
  })
})
