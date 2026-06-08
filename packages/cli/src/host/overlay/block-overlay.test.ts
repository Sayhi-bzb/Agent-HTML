import { afterEach, describe, expect, it, vi } from "vitest"

import {
  createAnimationFrameScheduler,
  findHoveredBlockOverlay,
  measureBlockOverlays,
  parseCssLengthInPixels,
  resolveBlockHandleHoverState,
} from "./block-overlay"
import type { BlockOverlay } from "../host-contracts"

const summaryElement = {} as HTMLElement
const detailsElement = {} as HTMLElement

const overlays: BlockOverlay[] = [
  {
    element: summaryElement,
    height: 120,
    id: "summary",
    title: "Summary",
    width: 240,
    x: 20,
    y: 20,
  },
  {
    element: detailsElement,
    height: 80,
    id: "details",
    title: "Details",
    width: 160,
    x: 80,
    y: 60,
  },
]

describe("findHoveredBlockOverlay", () => {
  it("returns the topmost overlay under the pointer", () => {
    expect(findHoveredBlockOverlay({ overlays, x: 100, y: 80 })?.id).toBe(
      "details"
    )
  })

  it("returns null when the pointer is outside every overlay", () => {
    expect(findHoveredBlockOverlay({ overlays, x: 400, y: 300 })).toBeNull()
  })

  it("treats the left handle gutter as part of the overlay hit target", () => {
    expect(
      findHoveredBlockOverlay({
        handleGutter: 10,
        overlays,
        x: 12,
        y: 40,
      })?.id
    ).toBe("summary")
  })

  it("returns null when the pointer is left of the handle gutter", () => {
    expect(
      findHoveredBlockOverlay({
        handleGutter: 10,
        overlays,
        x: 8,
        y: 40,
      })
    ).toBeNull()
  })

  it("keeps topmost overlay ordering inside the handle gutter", () => {
    expect(
      findHoveredBlockOverlay({
        handleGutter: 80,
        overlays,
        x: 10,
        y: 80,
      })?.id
    ).toBe("details")
  })
})

describe("resolveBlockHandleHoverState", () => {
  it("keeps the handle active while the pointer or focus enters it", () => {
    expect(
      resolveBlockHandleHoverState({
        blockId: "summary",
        currentHoveredBlockId: null,
        isPromptOpen: false,
        phase: "enter",
      })
    ).toBe("summary")
  })

  it("clears the handle when it leaves and the prompt is closed", () => {
    expect(
      resolveBlockHandleHoverState({
        blockId: "summary",
        currentHoveredBlockId: "summary",
        isPromptOpen: false,
        phase: "leave",
      })
    ).toBeNull()
  })

  it("keeps the handle visible when it leaves while the prompt is open", () => {
    expect(
      resolveBlockHandleHoverState({
        blockId: "summary",
        currentHoveredBlockId: "summary",
        isPromptOpen: true,
        phase: "leave",
      })
    ).toBe("summary")
  })

  it("does not clear a newer active block from a stale handle leave", () => {
    expect(
      resolveBlockHandleHoverState({
        blockId: "summary",
        currentHoveredBlockId: "details",
        isPromptOpen: false,
        phase: "leave",
      })
    ).toBe("details")
  })
})

describe("measureBlockOverlays", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("converts block rects into overlay root coordinates", () => {
    vi.stubGlobal("window", {
      getComputedStyle() {
        return {
          getPropertyValue(propertyName: string) {
            expect(propertyName).toBe("--canvas-block-highlight-padding")

            return "6px"
          },
        }
      },
    })

    const block = {
      getAttribute(name: string) {
        return {
          "data-agent-html-block-id": "summary",
          "data-agent-html-block-title": "Summary",
        }[name] ?? null
      },
      getBoundingClientRect() {
        return {
          height: 80,
          left: 140,
          top: 90,
          width: 320,
        }
      },
    }
    const root = {
      getBoundingClientRect() {
        return {
          left: 100,
          top: 50,
        }
      },
      querySelectorAll(selector: string) {
        expect(selector).toBe("[data-agent-html-block='true']")

        return [block]
      },
    }
    const blockElement = block as unknown as HTMLElement

    expect(measureBlockOverlays(root as unknown as HTMLElement)).toEqual([
      {
        element: blockElement,
        height: 92,
        id: "summary",
        title: "Summary",
        width: 332,
        x: 34,
        y: 34,
      },
    ])
  })

  it("returns no overlays when the overlay root is missing", () => {
    expect(measureBlockOverlays(null)).toEqual([])
  })

  it("uses fallback highlight padding when computed styles are unavailable", () => {
    const block = {
      getAttribute(name: string) {
        return name === "data-agent-html-block-id" ? "fallback" : null
      },
      getBoundingClientRect() {
        return {
          height: 20,
          left: 16,
          top: 16,
          width: 40,
        }
      },
    }
    const root = {
      getBoundingClientRect() {
        return {
          left: 10,
          top: 10,
        }
      },
      querySelectorAll() {
        return [block]
      },
    }
    const blockElement = block as unknown as HTMLElement

    expect(measureBlockOverlays(root as unknown as HTMLElement)).toEqual([
      {
        element: blockElement,
        height: 32,
        id: "fallback",
        title: "fallback",
        width: 52,
        x: 0,
        y: 0,
      },
    ])
  })
})

describe("parseCssLengthInPixels", () => {
  it("parses px and rem values", () => {
    expect(parseCssLengthInPixels("8px", 6)).toBe(8)
    expect(parseCssLengthInPixels("0.5rem", 6)).toBe(8)
  })

  it("falls back for missing or invalid values", () => {
    expect(parseCssLengthInPixels("", 6)).toBe(6)
    expect(parseCssLengthInPixels("bad", 6)).toBe(6)
  })
})

describe("createAnimationFrameScheduler", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("coalesces repeated schedules into the latest animation frame", () => {
    const callbacks = new Map<number, FrameRequestCallback>()
    const callback = vi.fn()
    let nextFrame = 1

    vi.stubGlobal("window", {
      cancelAnimationFrame(frame: number) {
        callbacks.delete(frame)
      },
      requestAnimationFrame(frameCallback: FrameRequestCallback) {
        const frame = nextFrame
        nextFrame += 1
        callbacks.set(frame, frameCallback)
        return frame
      },
    })

    const scheduler = createAnimationFrameScheduler(callback)

    scheduler.schedule()
    scheduler.schedule()

    expect(callbacks.has(1)).toBe(false)
    expect(callbacks.has(2)).toBe(true)

    callbacks.get(2)?.(16)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it("cancels a scheduled animation frame", () => {
    const callbacks = new Map<number, FrameRequestCallback>()
    const callback = vi.fn()

    vi.stubGlobal("window", {
      cancelAnimationFrame(frame: number) {
        callbacks.delete(frame)
      },
      requestAnimationFrame(frameCallback: FrameRequestCallback) {
        callbacks.set(1, frameCallback)
        return 1
      },
    })

    const scheduler = createAnimationFrameScheduler(callback)

    scheduler.schedule()
    scheduler.cancel()

    expect(callbacks.has(1)).toBe(false)
    expect(callback).not.toHaveBeenCalled()
  })
})
