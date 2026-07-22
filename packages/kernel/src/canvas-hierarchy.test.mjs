import { describe, expect, it } from "vitest"

import { resolveCanvasReparenting } from "./canvas-hierarchy.mjs"

const nodes = [
  { id: "parent" },
  { id: "child", parentId: "parent" },
  { id: "target" },
  { id: "target-child", parentId: "target" },
]
const layout = {
  nodes: {
    parent: { height: 200, width: 300, x: 100, y: 80 },
    child: { height: 50, width: 60, x: 20, y: 30 },
    target: { height: 200, width: 300, x: 500, y: 200 },
    "target-child": { height: 30, width: 40, x: 10, y: 10 },
  },
  version: 3,
}

describe("Canvas hierarchy geometry", () => {
  it("preserves absolute geometry while moving a Node into a parent", () => {
    expect(
      resolveCanvasReparenting({
        layout,
        nodeIds: ["child"],
        nodes,
        parentId: "target",
      })
    ).toEqual({
      geometries: {
        child: { height: 50, width: 60, x: -380, y: -90 },
      },
      movedNodeIds: ["child"],
      parentId: "target",
    })
  })

  it("moves only highest selected ancestors in source order", () => {
    expect(
      resolveCanvasReparenting({
        layout,
        nodeIds: ["target-child", "child", "target"],
        nodes,
        parentId: null,
      }).movedNodeIds
    ).toEqual(["child", "target"])
  })

  it("rejects a moved Node or descendant as the new parent", () => {
    expect(() =>
      resolveCanvasReparenting({
        layout,
        nodeIds: ["target"],
        nodes,
        parentId: "target-child",
      })
    ).toThrow(/must not be a moved Node or its descendant/)
  })
})
