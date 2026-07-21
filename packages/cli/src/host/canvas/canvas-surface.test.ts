import { describe, expect, it } from "vitest"

import {
  applyCanvasNodeChanges,
  getOrCreateCanvasStore,
  projectCanvasSnapshot,
  shouldCullCanvasElements,
} from "./canvas-flow-model"
import { createCanvasStore } from "./canvas-store"

describe("React Flow Canvas adapter", () => {
  it("keeps parent-local geometry and parent-first projection", () => {
    const store = createCanvasStore()
    store.runtime.upsertNode({ id: "child", parentId: "parent" })
    store.runtime.upsertNode({ id: "parent" })
    store.setNodeGeometry("parent", {
      height: 600,
      width: 800,
      x: 400,
      y: 300,
    })
    store.setNodeGeometry("child", {
      height: 120,
      width: 240,
      x: 32,
      y: 48,
    })

    const projection = projectCanvasSnapshot(
      store.getSnapshot(),
      store,
      new Set()
    )
    expect(projection.nodes.map((node) => node.id)).toEqual(["parent", "child"])
    expect(projection.nodes[1]).toMatchObject({
      parentId: "parent",
      position: { x: 32, y: 48 },
    })
  })

  it("injects the layout commit boundary into private React Flow Node data", () => {
    const store = createCanvasStore()
    const persistLayout = () => {}
    const requestPersistLayout = () => {}
    store.runtime.upsertNode({ id: "card" })

    const projection = projectCanvasSnapshot(
      store.getSnapshot(),
      store,
      new Set(),
      persistLayout,
      requestPersistLayout
    )

    expect(projection.nodes[0]?.data.persistLayout).toBe(persistLayout)
    expect(projection.nodes[0]?.data.requestPersistLayout).toBe(
      requestPersistLayout
    )
  })

  it("preserves a Store across source module versions", () => {
    const stores = new Map()
    const first = getOrCreateCanvasStore(stores, "demo.canvas.tsx")
    first.runtime.upsertNode({ id: "card" })
    first.setNodeGeometry("card", {
      height: 200,
      width: 320,
      x: 60,
      y: 80,
    })

    const afterHmr = getOrCreateCanvasStore(stores, "demo.canvas.tsx")
    expect(afterHmr).toBe(first)
    expect(afterHmr.getLayout().nodes.card).toEqual({
      height: 200,
      width: 320,
      x: 60,
      y: 80,
    })
  })

  it("translates controlled move and resize changes into one resolved geometry", () => {
    const store = createCanvasStore()
    store.runtime.upsertNode({ id: "card" })

    applyCanvasNodeChanges({
      changes: [
        {
          dragging: true,
          id: "card",
          position: { x: -24, y: 96 },
          type: "position",
        },
        {
          dimensions: { height: 260, width: 440 },
          id: "card",
          resizing: true,
          type: "dimensions",
        },
      ],
      snapshot: store.getSnapshot(),
      store,
    })

    expect(store.getLayout().nodes.card).toEqual({
      height: 260,
      width: 440,
      x: -24,
      y: 96,
    })
  })

  it("projects 1000 Nodes while delegating offscreen culling to React Flow", () => {
    const store = createCanvasStore()
    for (let index = 0; index < 1_000; index += 1) {
      store.runtime.upsertNode({ id: `node-${index}` })
    }

    const projection = projectCanvasSnapshot(
      store.getSnapshot(),
      store,
      new Set()
    )
    expect(projection.nodes).toHaveLength(1_000)
    expect(shouldCullCanvasElements(projection.nodes.length)).toBe(true)
    expect(shouldCullCanvasElements(100)).toBe(false)
  })
})
