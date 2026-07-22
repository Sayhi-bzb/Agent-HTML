import type { CanvasFocusOwner } from "./canvas-interaction-machine"

export type CanvasRegion =
  | "canvas"
  | "dock"
  | "node-chrome"
  | "node-content"
  | "overlay"

const interactiveSelector = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "[contenteditable]:not([contenteditable='false'])",
  "[data-canvas-interactive]",
  "[role='button']",
  "[role='checkbox']",
  "[role='combobox']",
  "[role='link']",
  "[role='radio']",
  "[role='slider']",
  "[role='switch']",
  "[role='textbox']",
].join(",")

function regionFromElement(element: Element): CanvasRegion | null {
  const region = element.getAttribute("data-canvas-region")
  return region === "canvas" ||
    region === "dock" ||
    region === "node-chrome" ||
    region === "node-content" ||
    region === "overlay"
    ? region
    : null
}

export function canvasRegionFromTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null
  const owner = target.closest<Element>("[data-canvas-region]")
  return owner ? regionFromElement(owner) : null
}

export function canvasRegionFromEvent(event: Event) {
  for (const candidate of event.composedPath()) {
    if (!(candidate instanceof Element)) continue
    const region = regionFromElement(candidate)
    if (region) return region
  }
  return canvasRegionFromTarget(event.target)
}

export function canvasFocusOwnerFromTarget(
  target: EventTarget | null
): CanvasFocusOwner {
  const region = canvasRegionFromTarget(target)
  if (region === "node-content") return "nodeContent"
  if (region === "node-chrome") return "nodeChrome"
  if (region === "dock" || region === "overlay") return "overlay"
  if (region === "canvas") return "canvas"
  return "none"
}

export function isCanvasInteractiveTarget(target: EventTarget | null) {
  return (
    target instanceof Element && Boolean(target.closest(interactiveSelector))
  )
}

export function isCanvasPrimaryPanBlocked(target: EventTarget | null) {
  const region = canvasRegionFromTarget(target)
  return (
    region === "dock" ||
    region === "overlay" ||
    isCanvasInteractiveTarget(target)
  )
}

function axisCanScroll(element: Element, delta: number, axis: "x" | "y") {
  if (delta === 0) return false
  const view = element.ownerDocument.defaultView
  if (!view) return false
  const style = view.getComputedStyle(element)
  const overflow = axis === "x" ? style.overflowX : style.overflowY
  if (!/(auto|overlay|scroll)/.test(overflow)) return false

  if (axis === "x") {
    if (element.scrollWidth <= element.clientWidth) return false
    return delta < 0
      ? element.scrollLeft > 0
      : element.scrollLeft + element.clientWidth < element.scrollWidth
  }
  if (element.scrollHeight <= element.clientHeight) return false
  return delta < 0
    ? element.scrollTop > 0
    : element.scrollTop + element.clientHeight < element.scrollHeight
}

export function shouldCanvasPreserveWheel(
  target: EventTarget | null,
  deltaX: number,
  deltaY: number
) {
  if (!(target instanceof Element)) return false
  if (target.closest(".nowheel")) return true

  let current: Element | null = target
  while (current) {
    if (
      axisCanScroll(current, deltaX, "x") ||
      axisCanScroll(current, deltaY, "y")
    )
      return true
    if (regionFromElement(current) === "node-content") break
    current = current.parentElement
  }
  return false
}
