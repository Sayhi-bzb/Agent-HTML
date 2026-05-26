import * as React from "react"
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"

import type { AgentHtmlDropIntent } from "@/agent-html/edit/types"
import type { AgentHtmlInteractionUnit } from "@/agent-html/interaction/types"
import { cn } from "@/agent-html/lib/utils"
import { inferAgentHtmlDropIntentFromPointer } from "@/agent-html/runtime/block/drag-intent"
import type {
  AgentHtmlBlockDropIndicator,
  AgentHtmlBlockRuntimeState,
} from "@/agent-html/runtime/block/types"

type AgentHtmlBlockRuntimeContextValue = AgentHtmlBlockRuntimeState & {
  clearIndicator: () => void
  getBlockElement: (path: string) => HTMLElement | null
  getBlockElements: () => HTMLElement[]
  getHoveredBlockElement: () => HTMLElement | null
  getOverlayElement: () => HTMLElement | null
  getVisibleBlockRects: () => DOMRect[]
  registerBlockElement: (
    path: string,
    element: HTMLElement | null
  ) => () => void
  registerBlockPreview: (path: string, preview: React.ReactNode) => () => void
  registerBlockUnit: (path: string, unit: AgentHtmlInteractionUnit) => () => void
  registerOverlayElement: (element: HTMLElement | null) => () => void
  refreshDragIntent: () => void
  setActivePath: (path: string | null) => void
  setHoveredPath: (path: string | null) => void
  setIndicator: (indicator: AgentHtmlBlockDropIndicator | null) => void
}

type AgentHtmlBlockRuntimeProviderProps = {
  children: React.ReactNode
  onDropIntent?: (input: {
    intent: AgentHtmlDropIntent
    sourcePath: string
  }) => void
}

const AgentHtmlBlockRuntimeContext =
  React.createContext<AgentHtmlBlockRuntimeContextValue | null>(null)

type ActivePreview = {
  node: React.ReactNode
  rect: DOMRect
}

export function AgentHtmlBlockRuntimeProvider({
  children,
  onDropIntent,
}: AgentHtmlBlockRuntimeProviderProps) {
  const elementsRef = React.useRef(new Map<string, HTMLElement>())
  const activePathRef = React.useRef<string | null>(null)
  const lastPointerRef = React.useRef<{ x: number; y: number } | null>(null)
  const overlayElementRef = React.useRef<HTMLElement | null>(null)
  const previewsRef = React.useRef(new Map<string, React.ReactNode>())
  const unitsRef = React.useRef(new Map<string, AgentHtmlInteractionUnit>())
  const initialPointerRef = React.useRef<{ x: number; y: number } | null>(null)
  const [hoveredPath, setHoveredPath] = React.useState<string | null>(null)
  const [activePath, setActivePath] = React.useState<string | null>(null)
  const [activePreview, setActivePreview] = React.useState<ActivePreview | null>(
    null
  )
  const [indicator, setIndicator] =
    React.useState<AgentHtmlBlockDropIndicator | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  )

  const registerBlockElement = React.useCallback(
    (path: string, element: HTMLElement | null) => {
      if (element) {
        elementsRef.current.set(path, element)
      } else {
        elementsRef.current.delete(path)
      }

      return () => {
        if (elementsRef.current.get(path) === element) {
          elementsRef.current.delete(path)
        }
      }
    },
    []
  )

  const getBlockElement = React.useCallback((path: string) => {
    return elementsRef.current.get(path) ?? null
  }, [])

  const registerBlockPreview = React.useCallback(
    (path: string, preview: React.ReactNode) => {
      previewsRef.current.set(path, preview)

      return () => {
        if (previewsRef.current.get(path) === preview) {
          previewsRef.current.delete(path)
        }
      }
    },
    []
  )

  const registerBlockUnit = React.useCallback(
    (path: string, unit: AgentHtmlInteractionUnit) => {
      unitsRef.current.set(path, unit)

      return () => {
        if (unitsRef.current.get(path) === unit) {
          unitsRef.current.delete(path)
        }
      }
    },
    []
  )

  const registerOverlayElement = React.useCallback(
    (element: HTMLElement | null) => {
      overlayElementRef.current = element

      return () => {
        if (overlayElementRef.current === element) {
          overlayElementRef.current = null
        }
      }
    },
    []
  )

  const getOverlayElement = React.useCallback(() => {
    return overlayElementRef.current
  }, [])

  const getBlockElements = React.useCallback(() => {
    return [...elementsRef.current.values()]
  }, [])

  const getHoveredBlockElement = React.useCallback(() => {
    return hoveredPath ? elementsRef.current.get(hoveredPath) ?? null : null
  }, [hoveredPath])

  const getVisibleBlockRects = React.useCallback(() => {
    return [...elementsRef.current.values()]
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0)
  }, [])

  const clearIndicator = React.useCallback(() => {
    setIndicator(null)
  }, [])

  const inferIntent = React.useCallback(
    (sourcePath: string, pointer: { x: number; y: number }) => {
      return inferAgentHtmlDropIntentFromPointer({
        candidates: [...elementsRef.current.entries()].map(([path, element]) => {
          const rect = element.getBoundingClientRect()

          return {
            role: unitsRef.current.get(path)?.role,
            path,
            rect: {
              bottom: rect.bottom,
              height: rect.height,
              left: rect.left,
              right: rect.right,
              top: rect.top,
              width: rect.width,
            },
          }
        }),
        pointer,
        sourcePath,
      })
    },
    []
  )

  const getEventPointer = React.useCallback(
    (event: DragMoveEvent | DragEndEvent) => {
      const initialPointer = initialPointerRef.current

      if (!initialPointer) {
        return null
      }

      return {
        x: initialPointer.x + event.delta.x,
        y: initialPointer.y + event.delta.y,
      }
    },
    []
  )

  const setIndicatorFromIntent = React.useCallback(
    (intent: AgentHtmlDropIntent | null) => {
      if (!intent) {
        setIndicator(null)
        return
      }

      setIndicator(intent)
    },
    []
  )

  const refreshDragIntent = React.useCallback(() => {
    const sourcePath = activePathRef.current
    const pointer = lastPointerRef.current

    if (!sourcePath || !pointer) {
      setIndicator(null)
      return
    }

    setIndicatorFromIntent(inferIntent(sourcePath, pointer))
  }, [inferIntent, setIndicatorFromIntent])

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    const sourcePath = String(event.active.id)
    const activatorEvent = event.activatorEvent

    if ("clientX" in activatorEvent && "clientY" in activatorEvent) {
      initialPointerRef.current = {
        x: activatorEvent.clientX,
        y: activatorEvent.clientY,
      }
    }

    setActivePath(sourcePath)
    activePathRef.current = sourcePath
    lastPointerRef.current =
      "clientX" in activatorEvent && "clientY" in activatorEvent
        ? {
            x: activatorEvent.clientX,
            y: activatorEvent.clientY,
          }
        : null
    const activeElement = elementsRef.current.get(sourcePath)
    const preview = previewsRef.current.get(sourcePath)

    setActivePreview(
      activeElement && preview
        ? {
            node: preview,
            rect: activeElement.getBoundingClientRect(),
          }
        : null
    )
    setHoveredPath(null)
    setIndicator(null)
  }, [])

  const handleDragMove = React.useCallback(
    (event: DragMoveEvent) => {
      const sourcePath = String(event.active.id)
      const pointer = getEventPointer(event)

      if (!pointer) {
        setIndicator(null)
        return
      }

      lastPointerRef.current = pointer
      setIndicatorFromIntent(inferIntent(sourcePath, pointer))
    },
    [getEventPointer, inferIntent, setIndicatorFromIntent]
  )

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const sourcePath = String(event.active.id)
      const pointer = lastPointerRef.current ?? getEventPointer(event)
      const intent = pointer ? inferIntent(sourcePath, pointer) : null

      initialPointerRef.current = null
      activePathRef.current = null
      lastPointerRef.current = null
      setActivePath(null)
      setActivePreview(null)
      setIndicator(null)

      if (intent) {
        onDropIntent?.({ intent, sourcePath })
      }
    },
    [getEventPointer, inferIntent, onDropIntent]
  )

  const handleDragCancel = React.useCallback(() => {
    initialPointerRef.current = null
    activePathRef.current = null
    lastPointerRef.current = null
    setActivePath(null)
    setActivePreview(null)
    setIndicator(null)
  }, [])

  const value = React.useMemo<AgentHtmlBlockRuntimeContextValue>(
    () => ({
      activePath,
      clearIndicator,
      getBlockElement,
      getBlockElements,
      getHoveredBlockElement,
      getOverlayElement,
      getVisibleBlockRects,
      hoveredPath,
      indicator,
      registerBlockElement,
      registerBlockPreview,
      registerBlockUnit,
      registerOverlayElement,
      refreshDragIntent,
      setActivePath,
      setHoveredPath,
      setIndicator,
    }),
    [
      activePath,
      clearIndicator,
      getBlockElement,
      getBlockElements,
      getHoveredBlockElement,
      getOverlayElement,
      getVisibleBlockRects,
      hoveredPath,
      indicator,
      registerBlockElement,
      registerBlockPreview,
      registerBlockUnit,
      registerOverlayElement,
      refreshDragIntent,
    ]
  )

  return (
    <DndContext
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <AgentHtmlBlockRuntimeContext value={value}>
        {children}
        <DragOverlay>
          {activePath ? (
            <div
              className={cn(
                "pointer-events-none overflow-hidden rounded-[18px] bg-background/92 text-foreground shadow-[0_22px_48px_-24px_color-mix(in_oklab,var(--foreground)_45%,transparent)] backdrop-blur",
                "border border-[color-mix(in_oklab,var(--primary)_28%,var(--border))] ring-1 ring-[color-mix(in_oklab,var(--primary)_24%,transparent)]"
              )}
              data-agent-html-block-drag-overlay="true"
              style={{
                maxWidth: "calc(100vw - 32px)",
                width: activePreview?.rect.width,
              }}
            >
              <div className="p-0">
                {activePreview?.node}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </AgentHtmlBlockRuntimeContext>
    </DndContext>
  )
}

export function useAgentHtmlBlockRuntime() {
  const context = React.useContext(AgentHtmlBlockRuntimeContext)

  if (!context) {
    throw new Error(
      "useAgentHtmlBlockRuntime must be used inside AgentHtmlBlockRuntimeProvider"
    )
  }

  return context
}
