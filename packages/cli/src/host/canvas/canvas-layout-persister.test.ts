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
      layoutPath: "agent-html/canvases/demo.layout.json",
      nodes: { a: store.getLayout().nodes.a },
      removedNodeIds: [],
      storage: "monolithic" as const,
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

  it("reconciles removed authored Nodes as tombstones", async () => {
    vi.useFakeTimers()
    const store = createCanvasStore("agent-html/canvases/demo.canvas.tsx")
    store.hydrateLayout({
      nodes: {
        active: { height: 100, width: 200, x: 0, y: 0 },
        removed: { height: 100, width: 200, x: 20, y: 20 },
      },
      version: 1,
    })
    store.runtime.upsertNode({ id: "active" })
    const save = vi.fn(async ({ nodes, removedNodeIds }) => ({
      layoutPath: "agent-html/canvases/demo.layout.json",
      nodes,
      removedNodeIds: [...(removedNodeIds ?? [])],
      storage: "monolithic" as const,
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
