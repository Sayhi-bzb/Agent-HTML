// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest"

import {
  createCanvasWheelPanController,
  isCanvasSpaceKey,
  isCanvasWheelPanBlocked,
  shouldActivateCanvasSpacePan,
} from "./canvas-pan"

const wheelDeltaPixel = 0
const wheelDeltaLine = 1

afterEach(() => {
  vi.useRealTimers()
})

function createWheelPanHarness() {
  let viewport = { x: 100, y: 80, zoom: 1 }
  let nextFrame = 1
  const frames = new Map<number, FrameRequestCallback>()
  const applyViewport = vi.fn((next) => {
    viewport = next
  })
  const onGestureEnd = vi.fn()
  const controller = createCanvasWheelPanController({
    applyViewport,
    cancelFrame: (handle) => frames.delete(handle),
    cancelGestureEnd: clearTimeout,
    getViewport: () => viewport,
    onGestureEnd,
    requestFrame: (callback) => {
      const handle = nextFrame++
      frames.set(handle, callback)
      return handle
    },
    scheduleGestureEnd: setTimeout,
  })
  const flushFrame = () => {
    const pending = [...frames.values()]
    frames.clear()
    for (const callback of pending) callback(0)
  }
  return {
    applyViewport,
    controller,
    flushFrame,
    getViewport: () => viewport,
    onGestureEnd,
  }
}

describe("Canvas pan interactions", () => {
  it("keeps both wheel axes responsive during one gesture", () => {
    vi.useFakeTimers()
    const harness = createWheelPanHarness()

    harness.controller.pan(20, 0, wheelDeltaPixel)
    harness.flushFrame()
    expect(harness.getViewport()).toEqual({ x: 90, y: 80, zoom: 1 })

    harness.controller.pan(0, 12, wheelDeltaPixel)
    harness.flushFrame()
    expect(harness.getViewport()).toEqual({ x: 90, y: 74, zoom: 1 })

    vi.runAllTimers()
    expect(harness.onGestureEnd).toHaveBeenCalledWith({
      x: 90,
      y: 74,
      zoom: 1,
    })
  })

  it("batches wheel deltas into one viewport update per frame", () => {
    vi.useFakeTimers()
    const harness = createWheelPanHarness()

    harness.controller.pan(8, 4, wheelDeltaPixel)
    harness.controller.pan(12, 6, wheelDeltaPixel)
    harness.flushFrame()

    expect(harness.applyViewport).toHaveBeenCalledOnce()
    expect(harness.getViewport()).toEqual({ x: 90, y: 75, zoom: 1 })
    harness.controller.dispose()
  })

  it("normalizes line deltas and commits once when finished", () => {
    vi.useFakeTimers()
    const harness = createWheelPanHarness()

    harness.controller.pan(1, -2, wheelDeltaLine)
    vi.advanceTimersByTime(150)

    expect(harness.getViewport()).toEqual({ x: 90, y: 100, zoom: 1 })
    expect(harness.onGestureEnd).toHaveBeenCalledOnce()
    expect(harness.controller.isActive()).toBe(false)
  })

  it("cancels pending work without committing when disposed", () => {
    vi.useFakeTimers()
    const harness = createWheelPanHarness()

    harness.controller.pan(20, 12, wheelDeltaPixel)
    harness.controller.dispose()
    harness.flushFrame()
    vi.runAllTimers()

    expect(harness.applyViewport).not.toHaveBeenCalled()
    expect(harness.onGestureEnd).not.toHaveBeenCalled()
    expect(harness.controller.isActive()).toBe(false)
  })

  it("preserves native Node scrolling and interactive Space keys", () => {
    const content = document.createElement("div")
    content.className = "nowheel"
    const child = document.createElement("span")
    content.append(child)
    expect(isCanvasWheelPanBlocked(child)).toBe(true)

    const canvas = document.createElement("div")
    expect(
      shouldActivateCanvasSpacePan({
        altKey: false,
        code: "Space",
        ctrlKey: false,
        isComposing: false,
        key: " ",
        metaKey: false,
        target: canvas,
      })
    ).toBe(true)

    const input = document.createElement("input")
    expect(
      shouldActivateCanvasSpacePan({
        altKey: false,
        code: "Space",
        ctrlKey: false,
        isComposing: false,
        key: " ",
        metaKey: false,
        target: input,
      })
    ).toBe(false)
    expect(isCanvasSpaceKey({ code: "Space", key: " " })).toBe(true)
  })
})
