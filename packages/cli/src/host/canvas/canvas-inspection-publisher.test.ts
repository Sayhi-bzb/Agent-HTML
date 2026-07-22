import { describe, expect, it, vi } from "vitest"

import { createCanvasInspectionPublisher } from "./canvas-inspection-publisher"
import { createCanvasStore } from "./canvas-store"

describe("Canvas inspection publisher", () => {
  it("debounces Store publications and sends the latest document", async () => {
    vi.useFakeTimers()
    const store = createCanvasStore("agent-html/canvases/demo.canvas.tsx")
    const publish = vi.fn(async () => ({
      ok: true as const,
      sourceFilePath: store.sourceFilePath,
    }))
    const publisher = createCanvasInspectionPublisher({ publish, store })

    store.runtime.setCanvasActive(true)
    store.runtime.upsertNode({ id: "first" })
    publisher.request()
    store.runtime.upsertNode({ id: "second" })
    publisher.request()

    await vi.advanceTimersByTimeAsync(80)
    expect(publish).toHaveBeenCalledOnce()
    expect(publish.mock.calls[0]?.[0]).toMatchObject({
      active: true,
      nodes: [{ id: "first" }, { id: "second" }],
      sourceFilePath: store.sourceFilePath,
      version: 2,
    })
    vi.useRealTimers()
  })

  it("cancels a pending publication when disposed", async () => {
    vi.useFakeTimers()
    const store = createCanvasStore("agent-html/canvases/demo.canvas.tsx")
    const publish = vi.fn(async () => ({
      ok: true as const,
      sourceFilePath: store.sourceFilePath,
    }))
    const publisher = createCanvasInspectionPublisher({ publish, store })
    publisher.request()
    publisher.dispose()

    await vi.advanceTimersByTimeAsync(80)
    expect(publish).not.toHaveBeenCalled()
    vi.useRealTimers()
  })
})
