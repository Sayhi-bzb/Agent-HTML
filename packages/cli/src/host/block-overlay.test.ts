import { afterEach, describe, expect, it, vi } from "vitest"

import {
  createAnimationFrameScheduler,
  findHoveredBlockOverlay,
  measureBlockOverlays,
} from "./block-overlay"
import type { BlockOverlay } from "./host-contracts"

const overlays: BlockOverlay[] = [
  {
    height: 120,
    id: "summary",
    title: "Summary",
    width: 240,
    x: 20,
    y: 20,
  },
  {
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
})

describe("measureBlockOverlays", () => {
  it("converts block rects into overlay root coordinates", () => {
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

    expect(measureBlockOverlays(root as unknown as HTMLElement)).toEqual([
      {
        height: 80,
        id: "summary",
        title: "Summary",
        width: 320,
        x: 40,
        y: 40,
      },
    ])
  })

  it("returns no overlays when the overlay root is missing", () => {
    expect(measureBlockOverlays(null)).toEqual([])
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
