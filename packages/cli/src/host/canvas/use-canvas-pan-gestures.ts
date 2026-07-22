import { useGesture } from "@use-gesture/react"
import type { Viewport } from "@xyflow/react"
import * as React from "react"

import {
  isCanvasPrimaryPanBlocked,
  shouldCanvasPreserveWheel,
} from "./canvas-input-router"

export type CanvasSpacePanInput = {
  altKey: boolean
  code: string
  ctrlKey: boolean
  isComposing: boolean
  key: string
  metaKey: boolean
  target: EventTarget | null
}

type UseCanvasPanGesturesOptions = {
  applyViewport: (viewport: Viewport) => void
  getViewport: () => Viewport
  onGestureEnd: (viewport: Viewport) => void
  onGestureStart?: (source: "primary" | "wheel") => void
  panActive: boolean
  target: React.RefObject<HTMLElement | null>
}

const canvasWheelPanSpeed = 0.5

export function isCanvasWheelPanBlocked(
  target: EventTarget | null,
  deltaX = 0,
  deltaY = 0
) {
  return shouldCanvasPreserveWheel(target, deltaX, deltaY)
}

export function isCanvasPanDragBlocked(target: EventTarget | null) {
  return isCanvasPrimaryPanBlocked(target)
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
  return (
    !altKey &&
    !ctrlKey &&
    !isComposing &&
    !metaKey &&
    isCanvasSpaceKey({ code, key }) &&
    !isCanvasPanDragBlocked(target)
  )
}

export function useCanvasPanGestures({
  applyViewport,
  getViewport,
  onGestureEnd,
  onGestureStart,
  panActive,
  target,
}: UseCanvasPanGesturesOptions) {
  const dragActiveRef = React.useRef(false)
  const wheelActiveRef = React.useRef(false)
  const gestureActiveRef = React.useRef(false)
  const dragViewportRef = React.useRef<Viewport | null>(null)
  const wheelViewportRef = React.useRef<Viewport | null>(null)

  const syncGestureActive = React.useCallback(() => {
    gestureActiveRef.current = dragActiveRef.current || wheelActiveRef.current
  }, [])
  const finishDrag = React.useCallback(() => {
    if (!dragActiveRef.current) return
    dragActiveRef.current = false
    const viewport = dragViewportRef.current ?? getViewport()
    dragViewportRef.current = null
    syncGestureActive()
    onGestureEnd(viewport)
  }, [getViewport, onGestureEnd, syncGestureActive])
  const finishWheel = React.useCallback(() => {
    if (!wheelActiveRef.current) return
    wheelActiveRef.current = false
    const viewport = wheelViewportRef.current ?? getViewport()
    wheelViewportRef.current = null
    syncGestureActive()
    onGestureEnd(viewport)
  }, [getViewport, onGestureEnd, syncGestureActive])

  useGesture(
    {
      onDrag: ({ event, offset: [x, y] }) => {
        if (!dragActiveRef.current) return
        event.preventDefault()
        event.stopPropagation()
        const viewport = { x, y, zoom: getViewport().zoom }
        dragViewportRef.current = viewport
        applyViewport(viewport)
      },
      onDragEnd: finishDrag,
      onDragStart: ({ cancel, event }) => {
        if (isCanvasPanDragBlocked(event.target)) {
          cancel()
          return
        }
        event.preventDefault()
        event.stopPropagation()
        dragActiveRef.current = true
        dragViewportRef.current = getViewport()
        syncGestureActive()
        onGestureStart?.("primary")
      },
      onWheel: ({ delta: [deltaX, deltaY], event }) => {
        const wheelEvent = event as WheelEvent
        if (
          wheelEvent.ctrlKey ||
          wheelEvent.metaKey ||
          isCanvasWheelPanBlocked(
            wheelEvent.target,
            wheelEvent.deltaX,
            wheelEvent.deltaY
          )
        ) {
          finishWheel()
          return
        }

        wheelEvent.preventDefault()
        if (!wheelActiveRef.current) {
          wheelActiveRef.current = true
          syncGestureActive()
          onGestureStart?.("wheel")
        }
        const current = getViewport()
        const viewport = {
          x: current.x - deltaX * canvasWheelPanSpeed,
          y: current.y - deltaY * canvasWheelPanSpeed,
          zoom: current.zoom,
        }
        wheelViewportRef.current = viewport
        applyViewport(viewport)
      },
      onWheelEnd: finishWheel,
    },
    {
      drag: {
        enabled: panActive,
        from: () => {
          const { x, y } = getViewport()
          return [x, y]
        },
        pointer: { buttons: 1, keys: false },
      },
      eventOptions: { capture: true, passive: false },
      target,
      wheel: { axis: undefined },
    }
  )

  React.useEffect(() => {
    if (!panActive) finishDrag()
  }, [finishDrag, panActive])
  React.useEffect(
    () => () => {
      dragActiveRef.current = false
      wheelActiveRef.current = false
      gestureActiveRef.current = false
    },
    []
  )

  return gestureActiveRef
}
