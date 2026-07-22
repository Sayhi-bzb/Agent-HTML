import { afterEach, describe, expect, it, vi } from "vitest"

import { createLayoutPersister } from "./canvas-layout-persister"
import { createCanvasStore } from "./canvas-store"

describe("Canvas layout persister", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("debounces and persists only dirty Node geometry", async () => {
    vi.useFakeTimers()
    const store = createCanvasStore("agent-html/canvases/demo.canvas.tsx")
    store.runtime.upsertNode({ id: "a" })
    store.runtime.upsertNode({ id: "b" })
    store.setNodeGeometry("a", {
      height: 100,
      width: 200,
      x: 40,
      y: 60,
    })
    const save = vi.fn(async () => ({
      nodes: { a: store.getLayout().nodes.a },
      removedNodeIds: [],
    }))
    const persister = createLayoutPersister({
      delay: 20,
      filePath: store.sourceFilePath,
      onPersistError: vi.fn(),
      save,
      store,
    })

    persister.request(["a"])
    persister.request(["a"])
    await vi.advanceTimersByTimeAsync(20)

    expect(save).toHaveBeenCalledOnce()
    expect(save.mock.calls[0]?.[0].nodes).toEqual({
      a: { height: 100, width: 200, x: 40, y: 60 },
    })
  })

  it("flushes geometry before an exclusive hierarchy operation", async () => {
    const store = createCanvasStore("agent-html/canvases/demo.canvas.tsx")
    store.runtime.upsertNode({ id: "a" })
    const calls: string[] = []
    const persister = createLayoutPersister({
      filePath: store.sourceFilePath,
      onPersistError: vi.fn(),
      save: vi.fn(async () => {
        calls.push("save")
        return { nodes: {}, removedNodeIds: [] }
      }),
      store,
    })
    persister.request(["a"])

    await persister.runExclusive(async () => {
      calls.push("operation")
      persister.reconcile()
    })

    expect(calls).toEqual(["save", "operation"])
    persister.dispose()
  })

  it("commits immediately and reports failures", async () => {
    const store = createCanvasStore("agent-html/canvases/demo.canvas.tsx")
    store.runtime.upsertNode({ id: "a" })
    const onPersistError = vi.fn()
    const persister = createLayoutPersister({
      filePath: store.sourceFilePath,
      onPersistError,
      save: vi.fn(async () => {
        throw new Error("disk full")
      }),
      store,
    })

    persister.commit(["a"])
    await vi.waitFor(() =>
      expect(onPersistError).toHaveBeenCalledWith("disk full")
    )
  })

  it("keeps viewport changes local without writing shared layout", async () => {
    const store = createCanvasStore("agent-html/canvases/demo.canvas.tsx")
    const save = vi.fn()
    const persister = createLayoutPersister({
      filePath: store.sourceFilePath,
      onPersistError: vi.fn(),
      save,
      store,
    })
    const viewport = { x: 40, y: -20, zoom: 0.8 }

    persister.commitViewport(viewport)
    expect(save).not.toHaveBeenCalled()
    expect(store.getSnapshot().viewport).toEqual(viewport)
    expect(store.getLayout()).not.toHaveProperty("viewport")
  })

  it("reconciles removed authored Nodes as tombstones", async () => {
    vi.useFakeTimers()
    const store = createCanvasStore("agent-html/canvases/demo.canvas.tsx")
    store.hydrateLayout({
      nodes: {
        active: { height: 100, width: 200, x: 0, y: 0 },
        removed: { height: 100, width: 200, x: 20, y: 20 },
      },
      version: 3,
    })
    store.runtime.upsertNode({ id: "active" })
    const save = vi.fn(async ({ nodes, removedNodeIds }) => ({
      nodes,
      removedNodeIds: [...(removedNodeIds ?? [])],
    }))
    const persister = createLayoutPersister({
      delay: 20,
      filePath: store.sourceFilePath,
      onPersistError: vi.fn(),
      save,
      store,
    })

    persister.reconcile()
    await vi.advanceTimersByTimeAsync(20)

    expect(save).toHaveBeenCalledWith({
      filePath: store.sourceFilePath,
      nodes: {},
      removedNodeIds: ["removed"],
    })
    expect(store.getLayoutNodeIds()).toEqual(["active"])
  })
})
