import * as React from "react"
import { GripIcon } from "lucide-react"

import { cn } from "@/app/shared/lib/utils"

const THREAD_PANEL_WINDOW_NO_DRAG_SELECTOR =
  'button,input,textarea,select,a,[role="menu"],[role="menuitem"],[data-window-no-drag],[data-thread-panel-window-no-drag],[data-popover-no-drag],[data-pet-settings-no-drag],[data-thread-picker-no-drag]'

type ThreadPanelWindowPosition = {
  x: number
  y: number
}

type ThreadPanelWindowSize = {
  height: number
  width: number
}

type ThreadPanelWindowDragState = {
  element: HTMLElement
  pointerId: number
  startClientX: number
  startClientY: number
  startPosition: ThreadPanelWindowPosition
}

type ThreadPanelWindowResizeState = {
  element: HTMLElement
  pointerId: number
  startClientX: number
  startClientY: number
  startSize: ThreadPanelWindowSize
}

export function ThreadPanelAppWindowHost({
  children,
  className,
  open,
}: {
  children?: React.ReactNode
  className?: string
  open: boolean
}) {
  const windowRef = React.useRef<HTMLDivElement | null>(null)
  const dragStateRef = React.useRef<ThreadPanelWindowDragState | null>(null)
  const resizeStateRef = React.useRef<ThreadPanelWindowResizeState | null>(null)
  const positionAnimationFrameRef = React.useRef<number | null>(null)
  const sizeAnimationFrameRef = React.useRef<number | null>(null)
  const [position, setPosition] = React.useState(getDefaultPosition)
  const [size, setSize] = React.useState(getDefaultSize)
  const positionRef = React.useRef<ThreadPanelWindowPosition>(position)
  const pendingPositionRef = React.useRef<ThreadPanelWindowPosition>(position)
  const pendingSizeRef = React.useRef<ThreadPanelWindowSize>(size)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isResizing, setIsResizing] = React.useState(false)

  const commitPosition = React.useCallback(
    (nextPosition: ThreadPanelWindowPosition) => {
      if (positionAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(positionAnimationFrameRef.current)
        positionAnimationFrameRef.current = null
      }

      const constrainedPosition = constrainPosition(nextPosition, size)
      positionRef.current = constrainedPosition
      pendingPositionRef.current = constrainedPosition
      setPosition(constrainedPosition)
    },
    [size]
  )

  const applyPositionFrame = React.useCallback(
    (nextPosition: ThreadPanelWindowPosition) => {
      pendingPositionRef.current = constrainPosition(nextPosition, size)
      if (positionAnimationFrameRef.current !== null) {
        return
      }

      positionAnimationFrameRef.current = window.requestAnimationFrame(() => {
        positionAnimationFrameRef.current = null
        const framePosition = pendingPositionRef.current
        positionRef.current = framePosition
        const element = dragStateRef.current?.element
        if (element) {
          element.style.transform = getWindowTransform(framePosition)
        }
      })
    },
    [size]
  )

  const commitSize = React.useCallback(
    (nextSize: ThreadPanelWindowSize) => {
      if (sizeAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(sizeAnimationFrameRef.current)
        sizeAnimationFrameRef.current = null
      }

      const constrainedSize = constrainSize(nextSize)
      pendingSizeRef.current = constrainedSize
      setSize(constrainedSize)
      commitPosition(positionRef.current)
    },
    [commitPosition]
  )

  const applySizeFrame = React.useCallback(
    (nextSize: ThreadPanelWindowSize) => {
      pendingSizeRef.current = constrainSize(nextSize)
      if (sizeAnimationFrameRef.current !== null) {
        return
      }

      sizeAnimationFrameRef.current = window.requestAnimationFrame(() => {
        sizeAnimationFrameRef.current = null
        const frameSize = pendingSizeRef.current
        const element = resizeStateRef.current?.element
        if (element) {
          element.style.width = `${frameSize.width}px`
          element.style.height = `${frameSize.height}px`
        }
      })
    },
    []
  )

  React.useEffect(
    () => () => {
      if (positionAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(positionAnimationFrameRef.current)
      }
      if (sizeAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(sizeAnimationFrameRef.current)
      }
    },
    []
  )

  React.useEffect(() => {
    if (open) {
      return
    }

    dragStateRef.current = null
    resizeStateRef.current = null
  }, [open])

  React.useEffect(() => {
    const handleResize = () => {
      commitSize(pendingSizeRef.current)
      commitPosition(positionRef.current)
    }

    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [commitPosition, commitSize])

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || !isThreadPanelWindowDragTarget(event.target)) {
        return
      }

      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      const startPosition = positionRef.current
      pendingPositionRef.current = startPosition
      dragStateRef.current = {
        element: event.currentTarget,
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPosition,
      }
      setIsDragging(true)
    },
    []
  )

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = dragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return
      }

      applyPositionFrame({
        x:
          dragState.startPosition.x +
          event.clientX -
          dragState.startClientX,
        y:
          dragState.startPosition.y +
          event.clientY -
          dragState.startClientY,
      })
    },
    [applyPositionFrame]
  )

  const finishDrag = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = dragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      commitPosition(pendingPositionRef.current)
      dragStateRef.current = null
      setIsDragging(false)
    },
    [commitPosition]
  )

  const handleResizePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0 || !windowRef.current) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      event.currentTarget.setPointerCapture(event.pointerId)
      const startSize = pendingSizeRef.current
      resizeStateRef.current = {
        element: windowRef.current,
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startSize,
      }
      setIsResizing(true)
    },
    []
  )

  const handleResizePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      const resizeState = resizeStateRef.current
      if (!resizeState || resizeState.pointerId !== event.pointerId) {
        return
      }

      applySizeFrame({
        height:
          resizeState.startSize.height +
          event.clientY -
          resizeState.startClientY,
        width:
          resizeState.startSize.width +
          event.clientX -
          resizeState.startClientX,
      })
    },
    [applySizeFrame]
  )

  const finishResize = React.useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      const resizeState = resizeStateRef.current
      if (!resizeState || resizeState.pointerId !== event.pointerId) {
        return
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      commitSize(pendingSizeRef.current)
      resizeStateRef.current = null
      setIsResizing(false)
    },
    [commitSize]
  )

  if (!open || !children) {
    return null
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50"
      data-slot="thread-panel-app-window-host"
    >
      <div
        className={cn(
          "pointer-events-auto fixed min-h-96 min-w-[34rem] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
          className
        )}
        data-resizing={isResizing ? "" : undefined}
        data-slot="thread-panel-app-window"
        data-window-host="thread-panel"
        onPointerCancel={finishDrag}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        ref={windowRef}
        style={{
          height: size.height,
          transform: getWindowTransform(position),
          width: size.width,
          willChange: isDragging ? "transform" : undefined,
        }}
      >
        {children}
        <button
          aria-label="Resize thread panel"
          className="absolute right-1 bottom-1 grid size-6 cursor-nwse-resize place-items-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          data-thread-panel-window-no-drag
          onPointerCancel={finishResize}
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={finishResize}
          type="button"
        >
          <GripIcon className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function isThreadPanelWindowDragTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    !target.closest(THREAD_PANEL_WINDOW_NO_DRAG_SELECTOR)
  )
}

function getDefaultPosition(): ThreadPanelWindowPosition {
  if (typeof window === "undefined") {
    return { x: 0, y: 0 }
  }

  const size = getDefaultSize()
  return {
    x: Math.max(16, window.innerWidth - size.width - 24),
    y: 80,
  }
}

function getDefaultSize(): ThreadPanelWindowSize {
  if (typeof window === "undefined") {
    return { height: 608, width: 928 }
  }

  return constrainSize({
    height: Math.min(608, window.innerHeight - 80),
    width: Math.min(928, window.innerWidth - 64),
  })
}

function constrainPosition(
  position: ThreadPanelWindowPosition,
  size: ThreadPanelWindowSize
) {
  if (typeof window === "undefined") {
    return position
  }

  return {
    x: clamp(position.x, 16, Math.max(16, window.innerWidth - size.width - 16)),
    y: clamp(position.y, 16, Math.max(16, window.innerHeight - size.height - 16)),
  }
}

function constrainSize(size: ThreadPanelWindowSize) {
  if (typeof window === "undefined") {
    return size
  }

  return {
    height: clamp(size.height, 384, Math.max(384, window.innerHeight - 32)),
    width: clamp(size.width, 544, Math.max(544, window.innerWidth - 32)),
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getWindowTransform(position: ThreadPanelWindowPosition) {
  return `translate3d(${position.x}px, ${position.y}px, 0)`
}
