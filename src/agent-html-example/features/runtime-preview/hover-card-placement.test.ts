import { describe, expect, it } from "vitest"

import {
  calculateHoverCardPlacement,
  selectHoverCardPlacement,
  unionRects,
} from "@/agent-html-example/features/runtime-preview/hover-card-placement"

const cardSize = { height: 40, width: 224 }
const contentRect = { bottom: 900, left: 300, right: 900, top: 100 }
const blockRect = { bottom: 260, left: 340, right: 560, top: 180 }

describe("calculateHoverCardPlacement", () => {
  it("builds the real content rect from block bounds", () => {
    expect(
      unionRects([
        { bottom: 240, left: 320, right: 520, top: 120 },
        { bottom: 420, left: 640, right: 880, top: 180 },
      ])
    ).toEqual({ bottom: 420, left: 320, right: 880, top: 120 })
  })

  it("tracks the hovered block on the left when that has less content overlap", () => {
    expect(
      calculateHoverCardPlacement({
        blockRect,
        cardSize,
        contentRect,
        viewportRect: { bottom: 900, left: 0, right: 1200, top: 0 },
      })
    ).toMatchObject({ left: 104, side: "left" })
  })

  it("tracks the hovered block on the right when that has less content overlap", () => {
    expect(
      calculateHoverCardPlacement({
        blockRect: { bottom: 260, left: 640, right: 860, top: 180 },
        cardSize,
        contentRect,
        viewportRect: { bottom: 900, left: 0, right: 1200, top: 0 },
      })
    ).toMatchObject({ left: 872, side: "right" })
  })

  it("uses the opposite side when the lowest-overlap side does not fit", () => {
    expect(
      calculateHoverCardPlacement({
        blockRect: { bottom: 260, left: 640, right: 860, top: 180 },
        cardSize,
        contentRect,
        viewportRect: { bottom: 900, left: 0, right: 1000, top: 0 },
      })
    ).toMatchObject({ side: "left" })
  })

  it("keeps the previous side when candidates are otherwise equivalent", () => {
    expect(
      selectHoverCardPlacement({
        candidates: [
          { left: 64, side: "left", top: 180 },
          { left: 912, side: "right", top: 180 },
        ],
        cardSize,
        contentRect: { bottom: 0, left: 0, right: 0, top: 0 },
        previousSide: "right",
        viewportRect: { bottom: 900, left: 0, right: 1200, top: 0 },
      })
    ).toMatchObject({ side: "right" })
  })

  it("chooses the candidate with less content overlap", () => {
    expect(
      selectHoverCardPlacement({
        candidates: [
          { left: 340, side: "left", top: 180 },
          { left: 916, side: "right", top: 180 },
        ],
        cardSize,
        contentRect,
        viewportRect: { bottom: 900, left: 0, right: 1200, top: 0 },
      })
    ).toMatchObject({ side: "right" })
  })

  it("falls back above the block when side space does not fit", () => {
    expect(
      calculateHoverCardPlacement({
        blockRect: { bottom: 260, left: 10, right: 990, top: 180 },
        cardSize,
        contentRect: { bottom: 900, left: 0, right: 1000, top: 100 },
        viewportRect: { bottom: 900, left: 0, right: 1000, top: 0 },
      })
    ).toMatchObject({ side: "top", top: 128 })
  })

  it("falls back below the block when top does not fit", () => {
    expect(
      calculateHoverCardPlacement({
        blockRect: { bottom: 80, left: 10, right: 990, top: 20 },
        cardSize,
        contentRect: { bottom: 900, left: 0, right: 1000, top: 0 },
        viewportRect: { bottom: 900, left: 0, right: 1000, top: 0 },
      })
    ).toMatchObject({ side: "bottom", top: 92 })
  })

  it("returns null when no candidate fits", () => {
    expect(
      calculateHoverCardPlacement({
        blockRect: { bottom: 60, left: 340, right: 560, top: 20 },
        cardSize: { height: 100, width: 500 },
        contentRect: { bottom: 160, left: 0, right: 600, top: 0 },
        viewportRect: { bottom: 120, left: 0, right: 600, top: 0 },
      })
    ).toBeNull()
  })
})
