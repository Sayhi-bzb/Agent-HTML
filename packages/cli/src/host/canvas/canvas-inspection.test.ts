import { describe, expect, it } from "vitest"

import { createCanvasStore } from "./canvas-store"

const canvasFilePath = "agent-html/canvases/dashboard/dashboard.canvas.tsx"

describe("Canvas inspection", () => {
  it("summarizes absolute bounds across parent-local geometry", () => {
    const store = createCanvasStore(canvasFilePath)
    store.runtime.setCanvasActive(true)
    store.runtime.upsertNode({ id: "group" })
    store.runtime.upsertNode({ id: "child", parentId: "group" })
    store.setNodeGeometry("group", {
      height: 300,
      width: 400,
      x: -100,
      y: 50,
    })
    store.setNodeGeometry("child", {
      height: 80,
      width: 120,
      x: 40,
      y: 30,
    })

    expect(store.inspectOverview()).toEqual({
      nodeCount: 2,
      rootNodeIds: ["group"],
      sourceFilePath: canvasFilePath,
    })
    expect(store.inspectNode("child")?.node.absoluteGeometry).toEqual({
      height: 80,
      width: 120,
      x: -60,
      y: 80,
    })
  })

  it("returns visible nodes for a viewport", () => {
    const store = createCanvasStore(canvasFilePath)
    store.runtime.upsertNode({ id: "left" })
    store.runtime.upsertNode({ id: "center" })
    store.runtime.upsertNode({ id: "right" })
    store.setNodeGeometry("left", {
      height: 40,
      width: 40,
      x: -100,
      y: 0,
    })
    store.setNodeGeometry("center", {
      height: 40,
      width: 40,
      x: 20,
      y: 20,
    })
    store.setNodeGeometry("right", {
      height: 40,
      width: 40,
      x: 200,
      y: 0,
    })

    const inspection = store.inspectViewport({
      height: 100,
      width: 100,
      x: 0,
      y: 0,
    })
    expect(inspection.nodes.map((node) => node.id)).toEqual(["center"])
    expect(inspection.totalNodeCount).toBe(3)
  })

  it("returns Node hierarchy and authored content source", () => {
    const store = createCanvasStore(canvasFilePath)
    store.runtime.upsertNode({ id: "parent" })
    store.runtime.upsertNode({
      id: "profile",
      parentId: "parent",
    })
    store.runtime.upsertNode({ id: "child", parentId: "profile" })

    const detail = store.inspectNode("profile")
    expect(detail).toMatchObject({
      childIds: ["child"],
      parentId: "parent",
    })
    expect(store.resolveNodeSource("profile")).toEqual({
      canvasFilePath,
      nodeId: "profile",
      sources: [canvasFilePath],
    })
    expect(store.resolveNodeSource("missing")).toBeNull()
  })

  it("queries a bounded region without returning all 1000 Nodes", () => {
    const store = createCanvasStore(canvasFilePath)
    for (let index = 0; index < 1_000; index += 1) {
      const id = `node-${index}`
      store.runtime.upsertNode({ id })
      store.setNodeGeometry(id, {
        height: 8,
        width: 8,
        x: (index % 100) * 10,
        y: Math.floor(index / 100) * 10,
      })
    }

    const inspection = store.inspectViewport({
      height: 100,
      width: 100,
      x: 0,
      y: 0,
    })
    expect(inspection.totalNodeCount).toBe(1_000)
    expect(inspection.nodes).toHaveLength(100)
  })

  it("rejects invalid viewport geometry", () => {
    const store = createCanvasStore(canvasFilePath)
    expect(() =>
      store.inspectViewport({
        height: 0,
        width: 100,
        x: 0,
        y: 0,
      })
    ).toThrow("positive")
  })
})
