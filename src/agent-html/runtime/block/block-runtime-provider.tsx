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
import {
  getAgentHtmlBlockLayoutKeyframes,
  getAgentHtmlBlockLayoutTransitions,
  type AgentHtmlBlockLayoutKeyframe,
  type AgentHtmlBlockLayoutRect,
  type AgentHtmlBlockLayoutSnapshot,
} from "@/agent-html/runtime/block/layout-transition"
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
  setActiveBlock: (block: AgentHtmlBlockRuntimeIdentity | null) => void
  setHoveredBlock: (block: AgentHtmlBlockRuntimeIdentity | null) => void
  setIndicator: (indicator: AgentHtmlBlockDropIndicator | null) => void
}

type AgentHtmlBlockRuntimeIdentity = {
  motionKey: string
  path: string
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
  rect: AgentHtmlBlockLayoutRect
}

type LandingPreview = {
  fromRect: AgentHtmlBlockLayoutRect
  motionKey: string
  node: React.ReactNode
}

const layoutTransitionOptions = {
  duration: 220,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const

function snapshotBlockLayouts(
  elements: ReadonlyMap<string, HTMLElement>,
  units: ReadonlyMap<string, AgentHtmlInteractionUnit>
): AgentHtmlBlockLayoutSnapshot[] {
  return [...elements.entries()]
    .map(([path, element]) => {
      const rect = element.getBoundingClientRect()
      const unit = units.get(path)

      return {
        motionKey: unit?.motionKey ?? path,
        path,
        rect: {
          height: rect.height,
          left: rect.left,
          top: rect.top,
          width: rect.width,
        },
      }
    })
    .filter((snapshot) => snapshot.rect.width > 0 && snapshot.rect.height > 0)
}

function canAnimateLayout() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

function playLayoutTransition(
  element: HTMLElement,
  keyframes: [AgentHtmlBlockLayoutKeyframe, AgentHtmlBlockLayoutKeyframe]
) {
  return element.animate(keyframes, layoutTransitionOptions)
}

function toLayoutRect(rect: DOMRect): AgentHtmlBlockLayoutRect {
  return {
    height: rect.height,
    left: rect.left,
    top: rect.top,
    width: rect.width,
  }
}

function offsetLayoutRect(
  rect: AgentHtmlBlockLayoutRect,
  offset: { x: number; y: number }
): AgentHtmlBlockLayoutRect {
  return {
    ...rect,
    left: rect.left + offset.x,
    top: rect.top + offset.y,
  }
}

function findPathByMotionKey(
  units: ReadonlyMap<string, AgentHtmlInteractionUnit>,
  motionKey: string
) {
  return [...units.entries()].find(([, unit]) => unit.motionKey === motionKey)?.[0]
}

export function AgentHtmlBlockRuntimeProvider({
  children,
  onDropIntent,
}: AgentHtmlBlockRuntimeProviderProps) {
  const elementsRef = React.useRef(new Map<string, HTMLElement>())
  const activePathRef = React.useRef<string | null>(null)
  const lastPointerRef = React.useRef<{ x: number; y: number } | null>(null)
  const overlayElementRef = React.useRef<HTMLElement | null>(null)
  const pendingLayoutSnapshotRef = React.useRef<
    AgentHtmlBlockLayoutSnapshot[] | null
  >(null)
  const landingFrameRef = React.useRef<number | null>(null)
  const pendingLayoutFrameRef = React.useRef<number | null>(null)
  const previewsRef = React.useRef(new Map<string, React.ReactNode>())
  const unitsRef = React.useRef(new Map<string, AgentHtmlInteractionUnit>())
  const initialPointerRef = React.useRef<{ x: number; y: number } | null>(null)
  const [hoveredBlock, setHoveredBlock] =
    React.useState<AgentHtmlBlockRuntimeIdentity | null>(null)
  const [activeBlock, setActiveBlock] =
    React.useState<AgentHtmlBlockRuntimeIdentity | null>(null)
  const [activePreview, setActivePreview] = React.useState<ActivePreview | null>(
    null
  )
  const [indicator, setIndicator] =
    React.useState<AgentHtmlBlockDropIndicator | null>(null)
  const [landingPreview, setLandingPreview] =
    React.useState<LandingPreview | null>(null)
  const [landingMotionKey, setLandingMotionKey] = React.useState<string | null>(
    null
  )
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
    if (!hoveredBlock) {
      return null
    }

    const currentPath =
      findPathByMotionKey(unitsRef.current, hoveredBlock.motionKey) ??
      hoveredBlock.path

    return elementsRef.current.get(currentPath) ?? null
  }, [hoveredBlock])

  const getVisibleBlockRects = React.useCallback(() => {
    return [...elementsRef.current.values()]
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0)
  }, [])

  const clearIndicator = React.useCallback(() => {
    setIndicator(null)
  }, [])

  const captureDragCandidates = React.useCallback(() => {
    return [...elementsRef.current.entries()].map(([path, element]) => {
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
    })
  }, [])

  const inferIntent = React.useCallback(
    (sourcePath: string, pointer: { x: number; y: number }) => {
      return inferAgentHtmlDropIntentFromPointer({
        candidates: captureDragCandidates(),
        pointer,
        sourcePath,
      })
    },
    [captureDragCandidates]
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

  const captureLayoutSnapshot = React.useCallback(() => {
    pendingLayoutSnapshotRef.current = canAnimateLayout()
      ? snapshotBlockLayouts(elementsRef.current, unitsRef.current)
      : null
  }, [])

  const runPendingLayoutTransition = React.useCallback(() => {
    if (!pendingLayoutSnapshotRef.current || pendingLayoutFrameRef.current) {
      return
    }

    const previous = pendingLayoutSnapshotRef.current
    pendingLayoutSnapshotRef.current = null
    const next = snapshotBlockLayouts(elementsRef.current, unitsRef.current)
    const transitions = getAgentHtmlBlockLayoutTransitions({
      next,
      previous,
    })
    const pendingAnimations: Array<{
      element: HTMLElement
      keyframes: [AgentHtmlBlockLayoutKeyframe, AgentHtmlBlockLayoutKeyframe]
    }> = []

    for (const [path, transition] of transitions) {
      const element = elementsRef.current.get(path)

      if (!element) {
        continue
      }

      const keyframes = getAgentHtmlBlockLayoutKeyframes(transition)
      const [inverted] = keyframes

      element.style.transformOrigin = inverted.transformOrigin
      element.style.transform = inverted.transform
      pendingAnimations.push({ element, keyframes })
    }

    if (pendingAnimations.length === 0) {
      return
    }

    pendingLayoutFrameRef.current = window.requestAnimationFrame(() => {
      pendingLayoutFrameRef.current = null

      for (const { element, keyframes } of pendingAnimations) {
        const animation = playLayoutTransition(element, keyframes)

        animation.finished.finally(() => {
          if (element.isConnected) {
            element.style.transform = ""
            element.style.transformOrigin = ""
          }
        })
      }
    })
  }, [])

  const runLandingTransition = React.useCallback(() => {
    if (!landingPreview || landingFrameRef.current) {
      return
    }

    const targetEntry = [...unitsRef.current.entries()].find(
      ([, unit]) => unit.motionKey === landingPreview.motionKey
    )
    const targetElement = targetEntry
      ? elementsRef.current.get(targetEntry[0])
      : null

    if (!targetElement) {
      setLandingPreview(null)
      setLandingMotionKey(null)
      return
    }

    const targetRect = toLayoutRect(targetElement.getBoundingClientRect())
    const deltaX = landingPreview.fromRect.left - targetRect.left
    const deltaY = landingPreview.fromRect.top - targetRect.top
    const scaleX = landingPreview.fromRect.width / targetRect.width
    const scaleY = landingPreview.fromRect.height / targetRect.height

    targetElement.style.opacity = "0"

    landingFrameRef.current = window.requestAnimationFrame(() => {
      landingFrameRef.current = null
      const overlayElement = document.querySelector<HTMLElement>(
        "[data-agent-html-block-landing-overlay='true']"
      )

      if (!overlayElement) {
        targetElement.style.opacity = ""
        setLandingPreview(null)
        setLandingMotionKey(null)
        return
      }

      overlayElement.style.left = `${targetRect.left}px`
      overlayElement.style.top = `${targetRect.top}px`
      overlayElement.style.width = `${targetRect.width}px`
      overlayElement.style.height = `${targetRect.height}px`

      const animation = overlayElement.animate(
        [
          {
            transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
            transformOrigin: "top left",
          },
          {
            transform: "translate(0, 0) scale(1, 1)",
            transformOrigin: "top left",
          },
        ],
        layoutTransitionOptions
      )

      animation.finished.finally(() => {
        targetElement.style.opacity = ""
        setLandingPreview(null)
        setLandingMotionKey(null)
      })
    })
  }, [landingPreview])

  React.useEffect(() => {
    return () => {
      if (pendingLayoutFrameRef.current) {
        window.cancelAnimationFrame(pendingLayoutFrameRef.current)
      }

      if (landingFrameRef.current) {
        window.cancelAnimationFrame(landingFrameRef.current)
      }
    }
  }, [])

  React.useLayoutEffect(() => {
    runPendingLayoutTransition()
  })

  React.useLayoutEffect(() => {
    runLandingTransition()
  }, [runLandingTransition])

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    const sourcePath = String(event.active.id)
    const activatorEvent = event.activatorEvent

    if ("clientX" in activatorEvent && "clientY" in activatorEvent) {
      initialPointerRef.current = {
        x: activatorEvent.clientX,
        y: activatorEvent.clientY,
      }
    }

    const sourceUnit = unitsRef.current.get(sourcePath)

    setActiveBlock({
      motionKey: sourceUnit?.motionKey ?? sourcePath,
      path: sourcePath,
    })
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
            rect: toLayoutRect(activeElement.getBoundingClientRect()),
          }
        : null
    )
    setLandingPreview(null)
    setLandingMotionKey(null)
    setHoveredBlock(null)
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

      if (intent) {
        const sourceUnit = unitsRef.current.get(sourcePath)
        const initialPointer = initialPointerRef.current

        captureLayoutSnapshot()
        if (activePreview && sourceUnit?.motionKey && initialPointer) {
          setLandingMotionKey(sourceUnit.motionKey)
          setLandingPreview({
            fromRect: offsetLayoutRect(activePreview.rect, {
              x: pointer.x - initialPointer.x,
              y: pointer.y - initialPointer.y,
            }),
            motionKey: sourceUnit.motionKey,
            node: activePreview.node,
          })
        }
        onDropIntent?.({ intent, sourcePath })
      }

      initialPointerRef.current = null
      activePathRef.current = null
      lastPointerRef.current = null
      setActiveBlock(null)
      setActivePreview(null)
      setIndicator(null)
    },
    [
      activePreview,
      captureLayoutSnapshot,
      getEventPointer,
      inferIntent,
      onDropIntent,
    ]
  )

  const handleDragCancel = React.useCallback(() => {
    initialPointerRef.current = null
    activePathRef.current = null
    lastPointerRef.current = null
    setActiveBlock(null)
    setActivePreview(null)
    setLandingPreview(null)
    setLandingMotionKey(null)
    setIndicator(null)
  }, [])

  const value = React.useMemo<AgentHtmlBlockRuntimeContextValue>(
    () => {
      const activePath = activeBlock
        ? (findPathByMotionKey(unitsRef.current, activeBlock.motionKey) ??
          activeBlock.path)
        : null
      const hoveredPath = hoveredBlock
        ? (findPathByMotionKey(unitsRef.current, hoveredBlock.motionKey) ??
          hoveredBlock.path)
        : null

      return {
        activeMotionKey: activeBlock?.motionKey ?? null,
        activePath,
        clearIndicator,
        getBlockElement,
        getBlockElements,
        getHoveredBlockElement,
        getOverlayElement,
        getVisibleBlockRects,
        hoveredMotionKey: hoveredBlock?.motionKey ?? null,
        hoveredPath,
        indicator,
        landingMotionKey,
        registerBlockElement,
        registerBlockPreview,
        registerBlockUnit,
        registerOverlayElement,
        refreshDragIntent,
        setActiveBlock,
        setHoveredBlock,
        setIndicator,
      }
    },
    [
      activeBlock,
      clearIndicator,
      getBlockElement,
      getBlockElements,
      getHoveredBlockElement,
      getOverlayElement,
      getVisibleBlockRects,
      hoveredBlock,
      indicator,
      landingMotionKey,
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
        <DragOverlay dropAnimation={null}>
          {activeBlock ? (
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
        {landingPreview ? (
          <div
            className={cn(
              "pointer-events-none fixed z-50 overflow-hidden rounded-[18px] bg-background/92 text-foreground shadow-[0_22px_48px_-24px_color-mix(in_oklab,var(--foreground)_45%,transparent)] backdrop-blur",
              "border border-[color-mix(in_oklab,var(--primary)_28%,var(--border))] ring-1 ring-[color-mix(in_oklab,var(--primary)_24%,transparent)]"
            )}
            data-agent-html-block-landing-overlay="true"
            style={{
              height: landingPreview.fromRect.height,
              left: landingPreview.fromRect.left,
              top: landingPreview.fromRect.top,
              width: landingPreview.fromRect.width,
            }}
          >
            <div className="p-0">{landingPreview.node}</div>
          </div>
        ) : null}
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
