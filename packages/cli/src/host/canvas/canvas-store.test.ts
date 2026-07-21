// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest"

import { createCanvasStore } from "./canvas-store"

describe("Canonical Canvas Store", () => {
  it("merges authored intent with persisted geometry", () => {
    const store = createCanvasStore("demo.canvas.tsx")
    store.hydrateLayout({
      nodes: {
        child: { height: 240, width: 420, x: 36, y: 48 },
      },
      version: 1,
    })
    store.runtime.upsertNode({
      height: 100,
      id: "child",
      parentId: "parent",
      width: 200,
      x: 0,
      y: 0,
    })
    store.runtime.upsertNode({ id: "parent", x: 100, y: 100 })

    expect(store.getSnapshot().nodes.map((node) => node.id)).toEqual([
      "parent",
      "child",
    ])
    expect(store.getSnapshot().nodes[1]).toMatchObject({
      height: 240,
      parentId: "parent",
      width: 420,
      x: 36,
      y: 48,
    })
  })

  it("persists resolved geometry for active nodes", () => {
    const store = createCanvasStore("demo.canvas.tsx")
    store.runtime.upsertNode({ id: "profile" })
    store.setNodeGeometry("profile", {
      height: 200,
      width: 360,
      x: -40,
      y: 80,
    })
    expect(store.getLayout()).toEqual({
      nodes: {
        profile: { height: 200, width: 360, x: -40, y: 80 },
      },
      version: 1,
    })
  })

  it("removes stale layout records without changing active intent", () => {
    const store = createCanvasStore("demo.canvas.tsx")
    store.hydrateLayout({
      nodes: {
        active: { height: 100, width: 200, x: 0, y: 0 },
        removed: { height: 100, width: 200, x: 20, y: 20 },
      },
      version: 1,
    })
    store.runtime.upsertNode({ id: "active" })

    store.removeLayoutNodes(["removed"])

    expect(store.getLayoutNodeIds()).toEqual(["active"])
    expect(store.getSnapshot().nodes.map((node) => node.id)).toEqual(["active"])
  })

  it("publishes portal targets independently of record snapshots", () => {
    const store = createCanvasStore("demo.canvas.tsx")
    const listener = vi.fn()
    store.runtime.subscribeTargets(listener)
    const target = document.createElement("div")
    store.setNodeTarget("profile", target)
    expect(store.runtime.getNodeTarget("profile")).toBe(target)
    expect(listener).toHaveBeenCalledOnce()
  })

  it("keeps persisted geometry when HMR cleanup and remount cross a microtask", async () => {
    const store = createCanvasStore("demo.canvas.tsx")
    store.runtime.upsertNode({ id: "profile", title: "Before" })
    store.setNodeGeometry("profile", {
      height: 240,
      width: 420,
      x: 64,
      y: -32,
    })

    store.runtime.removeNode("profile")
    store.runtime.upsertNode({ id: "profile", title: "After", x: 999 })
    await Promise.resolve()

    expect(store.getSnapshot().nodes).toEqual([
      expect.objectContaining({
        height: 240,
        id: "profile",
        title: "After",
        width: 420,
        x: 64,
        y: -32,
      }),
    ])
  })
})
