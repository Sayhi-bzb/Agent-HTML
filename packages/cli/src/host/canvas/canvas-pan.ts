import type { Viewport } from "@xyflow/react"

type CanvasWheelPanControllerOptions = {
  applyViewport: (viewport: Viewport) => void
  cancelFrame: (handle: number) => void
  cancelGestureEnd: (handle: ReturnType<typeof setTimeout>) => void
  getViewport: () => Viewport
  onGestureEnd: (viewport: Viewport) => void
  requestFrame: (callback: FrameRequestCallback) => number
  scheduleGestureEnd: (
    callback: () => void,
    delay: number
  ) => ReturnType<typeof setTimeout>
}

export type CanvasWheelPanController = {
  dispose: () => void
  finish: () => void
  isActive: () => boolean
  pan: (deltaX: number, deltaY: number, deltaMode: number) => boolean
}

export type CanvasSpacePanInput = {
  altKey: boolean
  code: string
  ctrlKey: boolean
  isComposing: boolean
  key: string
  metaKey: boolean
  target: EventTarget | null
}

const canvasWheelPanSpeed = 0.5
const canvasWheelPanEndDelay = 150
const canvasWheelDeltaLine = 1
const canvasSpacePanBlockedSelector =
  "input, textarea, select, [contenteditable]:not([contenteditable='false']), button, a[href], [role='button'], [role='link']"

function normalizeCanvasWheelDelta(value: number, deltaMode: number) {
  return value * (deltaMode === canvasWheelDeltaLine ? 20 : 1)
}

export function isCanvasWheelPanBlocked(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(".nowheel"))
}

export function isCanvasSpaceKey({
  code,
  key,
}: Pick<CanvasSpacePanInput, "code" | "key">) {
  return code === "Space" || key === " "
}

export function shouldActivateCanvasSpacePan({
  altKey,
  code,
  ctrlKey,
  isComposing,
  key,
  metaKey,
  target,
}: CanvasSpacePanInput) {
  if (
    altKey ||
    ctrlKey ||
    isComposing ||
    metaKey ||
    !isCanvasSpaceKey({ code, key })
  )
    return false

  return !(
    target instanceof Element && target.closest(canvasSpacePanBlockedSelector)
  )
}

export function createCanvasWheelPanController({
  applyViewport,
  cancelFrame,
  cancelGestureEnd,
  getViewport,
  onGestureEnd,
  requestFrame,
  scheduleGestureEnd,
}: CanvasWheelPanControllerOptions): CanvasWheelPanController {
  let active = false
  let disposed = false
  let frame: number | null = null
  let gestureEnd: ReturnType<typeof setTimeout> | null = null
  let pendingX = 0
  let pendingY = 0
  let viewport: Viewport | null = null

  const flush = () => {
    frame = null
    if (!viewport || (pendingX === 0 && pendingY === 0)) return
    viewport = {
      x: viewport.x - pendingX * canvasWheelPanSpeed,
      y: viewport.y - pendingY * canvasWheelPanSpeed,
      zoom: viewport.zoom,
    }
    pendingX = 0
    pendingY = 0
    applyViewport(viewport)
  }

  const finish = () => {
    if (!active) return
    if (frame !== null) {
      cancelFrame(frame)
      frame = null
    }
    if (gestureEnd !== null) {
      cancelGestureEnd(gestureEnd)
      gestureEnd = null
    }
    flush()
    const finalViewport = viewport
    active = false
    viewport = null
    if (!disposed && finalViewport) onGestureEnd(finalViewport)
  }

  return {
    dispose() {
      disposed = true
      if (frame !== null) cancelFrame(frame)
      if (gestureEnd !== null) cancelGestureEnd(gestureEnd)
      frame = null
      gestureEnd = null
      active = false
      viewport = null
    },
    finish,
    isActive: () => active,
    pan(deltaX, deltaY, deltaMode) {
      if (disposed) return false
      const normalizedX = normalizeCanvasWheelDelta(deltaX, deltaMode)
      const normalizedY = normalizeCanvasWheelDelta(deltaY, deltaMode)
      if (normalizedX === 0 && normalizedY === 0) return false

      if (!active) {
        active = true
        viewport = getViewport()
      }
      pendingX += normalizedX
      pendingY += normalizedY
      if (frame === null) frame = requestFrame(flush)
      if (gestureEnd !== null) cancelGestureEnd(gestureEnd)
      gestureEnd = scheduleGestureEnd(() => {
        gestureEnd = null
        finish()
      }, canvasWheelPanEndDelay)
      return true
    },
  }
}
