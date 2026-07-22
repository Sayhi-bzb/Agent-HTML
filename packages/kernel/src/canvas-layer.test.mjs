import { describe, expect, it } from "vitest"

import { resolveCanvasLayerOrder } from "./canvas-layer.mjs"

const nodes = [
  { id: "a", siblingOrder: 0 },
  { id: "b", siblingOrder: 1 },
  { id: "c", siblingOrder: 2 },
  { id: "d", siblingOrder: 3 },
  { id: "b-1", parentId: "b", siblingOrder: 0 },
  { id: "b-2", parentId: "b", siblingOrder: 1 },
]

describe("Canvas layer order", () => {
  it.each([
    ["bring-to-front", ["a", "c"], ["b", "d", "a", "c"]],
    ["bring-forward", ["a", "c"], ["b", "a", "d", "c"]],
    ["send-backward", ["b", "d"], ["b", "a", "d", "c"]],
    ["send-to-back", ["b", "d"], ["b", "d", "a", "c"]],
  ])(
    "applies %s while preserving selected order",
    (action, selected, expected) => {
      expect(
        resolveCanvasLayerOrder({ action, nodeIds: selected, nodes }).groups[0]
          .nodeIds
      ).toEqual(expected)
    }
  )

  it("reorders selections independently within each parent", () => {
    expect(
      resolveCanvasLayerOrder({
        action: "bring-to-front",
        nodeIds: ["a", "b-1"],
        nodes,
      }).groups
    ).toEqual([
      { nodeIds: ["b", "c", "d", "a"], parentId: null },
      { nodeIds: ["b-2", "b-1"], parentId: "b" },
    ])
  })

  it("returns no groups when every selection is already at the boundary", () => {
    expect(
      resolveCanvasLayerOrder({
        action: "bring-to-front",
        nodeIds: ["d", "b-2"],
        nodes,
      }).groups
    ).toEqual([])
  })

  it("rejects unavailable Nodes and invalid actions", () => {
    expect(() =>
      resolveCanvasLayerOrder({
        action: "bring-forward",
        nodeIds: ["missing"],
        nodes,
      })
    ).toThrow("Canvas layer Node missing was not found")
    expect(() =>
      resolveCanvasLayerOrder({ action: "raise", nodeIds: ["a"], nodes })
    ).toThrow("Unsupported Canvas layer action")
  })
})
