// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest"

import {
  canvasFocusOwnerFromTarget,
  canvasRegionFromEvent,
  isCanvasPrimaryPanBlocked,
  shouldCanvasPreserveWheel,
} from "./canvas-input-router"

describe("Canvas input router", () => {
  it("classifies Host and React content regions", () => {
    const canvas = document.createElement("div")
    canvas.dataset.canvasRegion = "canvas"
    const content = document.createElement("div")
    content.dataset.canvasRegion = "node-content"
    const input = document.createElement("input")
    content.append(input)
    canvas.append(content)

    expect(canvasFocusOwnerFromTarget(input)).toBe("nodeContent")
    expect(isCanvasPrimaryPanBlocked(input)).toBe(true)

    const event = new Event("focusin", { bubbles: true, composed: true })
    input.dispatchEvent(event)
    expect(canvasRegionFromEvent(event)).toBe("node-content")
  })

  it("reserves Dock and overlays from Canvas primary pan", () => {
    for (const region of ["dock", "overlay"]) {
      const element = document.createElement("button")
      element.dataset.canvasRegion = region
      expect(isCanvasPrimaryPanBlocked(element)).toBe(true)
    }
    const pane = document.createElement("div")
    pane.dataset.canvasRegion = "canvas"
    expect(isCanvasPrimaryPanBlocked(pane)).toBe(false)
  })

  it("preserves wheel only while a scrollable content ancestor can consume it", () => {
    const content = document.createElement("div")
    content.dataset.canvasRegion = "node-content"
    const scroll = document.createElement("div")
    const child = document.createElement("span")
    scroll.style.overflowY = "auto"
    scroll.append(child)
    content.append(scroll)
    vi.spyOn(scroll, "clientHeight", "get").mockReturnValue(100)
    vi.spyOn(scroll, "scrollHeight", "get").mockReturnValue(300)
    scroll.scrollTop = 20

    expect(shouldCanvasPreserveWheel(child, 0, 30)).toBe(true)
    scroll.scrollTop = 200
    expect(shouldCanvasPreserveWheel(child, 0, 30)).toBe(false)
    expect(shouldCanvasPreserveWheel(child, 0, -30)).toBe(true)
  })
})
