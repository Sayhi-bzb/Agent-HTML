// @vitest-environment jsdom

import * as React from "react"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  isCanvasPanDragBlocked,
  isCanvasSpaceKey,
  isCanvasWheelPanBlocked,
  shouldActivateCanvasSpacePan,
  useCanvasPanGestures,
} from "./use-canvas-pan-gestures"

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const roots: Root[] = []

afterEach(() => {
  for (const root of roots.splice(0)) act(() => root.unmount())
  vi.useRealTimers()
})

function renderGestureHarness(panActive = false) {
  let viewport = { x: 100, y: 80, zoom: 1 }
  const applyViewport = vi.fn((next) => {
    viewport = next
  })
  const onGestureEnd = vi.fn()

  function Harness() {
    const target = React.useRef<HTMLDivElement>(null)
    useCanvasPanGestures({
      applyViewport,
      getViewport: () => viewport,
      onGestureEnd,
      panActive,
      target,
    })
    return (
      <div data-testid="gesture-target" ref={target}>
        <div className="canvas-node-content" data-testid="node-content" />
      </div>
    )
  }

  const container = document.createElement("div")
  document.body.append(container)
  const root = createRoot(container)
  roots.push(root)
  act(() => root.render(<Harness />))
  return {
    applyViewport,
    getViewport: () => viewport,
    onGestureEnd,
    target: container.querySelector<HTMLElement>(
      "[data-testid='gesture-target']"
    )!,
  }
}

function pointerEvent(type: string, init: MouseEventInit) {
  const event = new MouseEvent(type, init)
  Object.defineProperties(event, {
    isPrimary: { value: true },
    pointerId: { value: 1 },
    pointerType: { value: "mouse" },
  })
  return event
}

describe("Canvas pan gestures", () => {
  it("keeps both wheel axes responsive during one library gesture", () => {
    vi.useFakeTimers()
    const harness = renderGestureHarness()

    act(() => {
      harness.target.dispatchEvent(
        new WheelEvent("wheel", {
          bubbles: true,
          cancelable: true,
          deltaX: 20,
        })
      )
    })
    expect(harness.getViewport()).toEqual({ x: 90, y: 80, zoom: 1 })

    act(() => {
      harness.target.dispatchEvent(
        new WheelEvent("wheel", {
          bubbles: true,
          cancelable: true,
          deltaY: 12,
        })
      )
    })
    expect(harness.getViewport()).toEqual({ x: 90, y: 74, zoom: 1 })

    act(() => vi.runAllTimers())
    expect(harness.onGestureEnd).toHaveBeenCalledOnce()
    expect(harness.onGestureEnd).toHaveBeenCalledWith({
      x: 90,
      y: 74,
      zoom: 1,
    })
  })

  it("leaves native Node scrolling and modifier zoom untouched", () => {
    vi.useFakeTimers()
    const harness = renderGestureHarness()
    const content = document.createElement("div")
    content.className = "nowheel"
    harness.target.append(content)

    const nativeWheel = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      deltaY: 20,
    })
    act(() => content.dispatchEvent(nativeWheel))
    expect(nativeWheel.defaultPrevented).toBe(false)

    const zoomWheel = new WheelEvent("wheel", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      deltaY: -20,
    })
    act(() => harness.target.dispatchEvent(zoomWheel))
    expect(zoomWheel.defaultPrevented).toBe(false)
    expect(harness.applyViewport).not.toHaveBeenCalled()
  })

  it("pans from Node content with a Space-enabled primary drag", () => {
    const harness = renderGestureHarness(true)
    const content = harness.target.querySelector<HTMLElement>(
      "[data-testid='node-content']"
    )!
    content.setPointerCapture = vi.fn()
    content.releasePointerCapture = vi.fn()
    content.hasPointerCapture = vi.fn(() => true)

    act(() => {
      content.dispatchEvent(
        pointerEvent("pointerdown", {
          bubbles: true,
          buttons: 1,
          cancelable: true,
          clientX: 10,
          clientY: 10,
        })
      )
      content.dispatchEvent(
        pointerEvent("pointermove", {
          bubbles: true,
          buttons: 1,
          cancelable: true,
          clientX: 60,
          clientY: 40,
        })
      )
      content.dispatchEvent(
        pointerEvent("pointerup", {
          bubbles: true,
          buttons: 0,
          cancelable: true,
          clientX: 60,
          clientY: 40,
        })
      )
    })

    expect(harness.getViewport()).toEqual({ x: 150, y: 110, zoom: 1 })
    expect(harness.onGestureEnd).toHaveBeenCalledOnce()
    expect(harness.onGestureEnd).toHaveBeenCalledWith({
      x: 150,
      y: 110,
      zoom: 1,
    })
  })

  it("does not consume clicks from interactive Node content", () => {
    const harness = renderGestureHarness(true)
    const onSubmit = vi.fn((event: Event) => event.preventDefault())
    const form = document.createElement("form")
    const button = document.createElement("button")
    button.type = "submit"
    form.append(button)
    form.addEventListener("submit", onSubmit)
    harness.target.append(form)

    act(() => button.click())

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(harness.applyViewport).not.toHaveBeenCalled()
  })

  it("preserves Space for interactive controls", () => {
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
    expect(isCanvasPanDragBlocked(input)).toBe(true)
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
