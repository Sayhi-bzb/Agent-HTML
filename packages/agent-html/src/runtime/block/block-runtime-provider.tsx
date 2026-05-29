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
import { dispatchAgentHtmlInteractionEvent } from "@/agent-html/runtime/agent-events/browser-events"
import type {
  AgentHtmlAgentPromptSubmitInput,
} from "@/agent-html/runtime/agent-events/types"
import { AgentHtmlBlockDragOverlay } from "@/agent-html/runtime/block/block-drag-overlay"
import { useAgentHtmlBlockInputPopover } from "@/agent-html/runtime/block/block-input-popover"
import {
  toAgentHtmlBlockLayoutRect,
  useAgentHtmlBlockLayoutAnimation,
} from "@/agent-html/runtime/block/block-layout-animation"
import { inferAgentHtmlDropIntentFromPointer } from "@/agent-html/runtime/block/drag-intent"
import { useAgentHtmlBlockRegistry } from "@/agent-html/runtime/block/block-registry"
import type { AgentHtmlBlockLayoutRect } from "@/agent-html/runtime/block/layout-transition"
import type {
  AgentHtmlBlockDropIndicator,
  AgentHtmlBlockRuntimeState,
} from "@/agent-html/runtime/block/types"

type AgentHtmlBlockRuntimeContextValue = AgentHtmlBlockRuntimeState & {
  clearIndicator: () => void
  closeBlockInput: () => void
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
  openBlockInput: (path: string, anchorElement: HTMLElement) => void
  refreshDragIntent: () => void
  setActiveBlock: (block: AgentHtmlBlockRuntimeIdentity | null) => void
  setHoveredBlock: (block: AgentHtmlBlockRuntimeIdentity | null) => void
  setIndicator: (indicator: AgentHtmlBlockDropIndicator | null) => void
}

type AgentHtmlBlockRuntimeIdentity = {
  motionKey: string
  path: string
}

type AgentHtmlClientPointer = {
  x: number
  y: number
}

type AgentHtmlBlockRuntimeProviderProps = {
  children: React.ReactNode
  onDropIntent?: (input: {
    intent: AgentHtmlDropIntent
    sourcePath: string
  }) => void
  onPromptSubmit?: (input: AgentHtmlAgentPromptSubmitInput) => void
}

const AgentHtmlBlockRuntimeContext =
  React.createContext<AgentHtmlBlockRuntimeContextValue | null>(null)

type ActivePreview = {
  node: React.ReactNode
  rect: AgentHtmlBlockLayoutRect
}

export function AgentHtmlBlockRuntimeProvider({
  children,
  onDropIntent,
  onPromptSubmit,
}: AgentHtmlBlockRuntimeProviderProps) {
  const activePathRef = React.useRef<string | null>(null)
  const lastClientPointerRef = React.useRef<AgentHtmlClientPointer | null>(null)
  const registry = useAgentHtmlBlockRegistry()
  const lastHoverClientPointerRef =
    React.useRef<AgentHtmlClientPointer | null>(null)
  const initialClientPointerRef =
    React.useRef<AgentHtmlClientPointer | null>(null)
  const [hoveredBlock, setHoveredBlock] =
    React.useState<AgentHtmlBlockRuntimeIdentity | null>(null)
  const [activeBlock, setActiveBlock] =
    React.useState<AgentHtmlBlockRuntimeIdentity | null>(null)
  const [activePreview, setActivePreview] = React.useState<ActivePreview | null>(
    null
  )
  const [indicator, setIndicator] =
    React.useState<AgentHtmlBlockDropIndicator | null>(null)
  const {
    captureLayoutSnapshot,
    clearLandingPreview,
    landingMotionKey,
    landingOverlayLayer,
    startLandingPreview,
  } = useAgentHtmlBlockLayoutAnimation({ registry })
  const {
    blockInputPopoverLayer,
    closeBlockInput,
    openBlockInput,
  } = useAgentHtmlBlockInputPopover({ onPromptSubmit })
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  )

  const getHoveredBlockElement = React.useCallback(() => {
    return registry.getHoveredBlockElement(hoveredBlock)
  }, [hoveredBlock, registry])

  const clearIndicator = React.useCallback(() => {
    setIndicator(null)
  }, [])

  const inferIntent = React.useCallback(
    (sourcePath: string, pointer: AgentHtmlClientPointer) => {
      return inferAgentHtmlDropIntentFromPointer({
        candidates: registry.captureDragCandidates(),
        pointer,
        sourcePath,
      })
    },
    [registry]
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

  const updateHoveredBlockFromPointer = React.useCallback(
    (event: Pick<PointerEvent, "clientX" | "clientY" | "isTrusted">) => {
      if (activePathRef.current) {
        return
      }

      const pointer = {
        x: event.clientX,
        y: event.clientY,
      }
      const previousPointer = lastHoverClientPointerRef.current

      if (
        previousPointer &&
        previousPointer.x === pointer.x &&
        previousPointer.y === pointer.y
      ) {
        return
      }

      lastHoverClientPointerRef.current = pointer

      if (!event.isTrusted) {
        return
      }

      const target = document.elementFromPoint(event.clientX, event.clientY)
      const blockElement = target?.closest?.("[data-agent-html-block='true']")

      if (!(blockElement instanceof HTMLElement)) {
        setHoveredBlock(null)
        return
      }

      const path = blockElement.dataset.agentHtmlBlockPath
      const unit = path ? registry.getBlockUnit(path) : null

      if (!path || !unit) {
        setHoveredBlock(null)
        return
      }

      setHoveredBlock((current) => {
        if (current?.motionKey === unit.motionKey && current.path === path) {
          return current
        }

        return { motionKey: unit.motionKey, path }
      })
    },
    [registry]
  )

  const refreshDragIntent = React.useCallback(() => {
    const sourcePath = activePathRef.current
    const pointer = lastClientPointerRef.current

    if (!sourcePath || !pointer) {
      setIndicator(null)
      return
    }

    setIndicatorFromIntent(inferIntent(sourcePath, pointer))
  }, [inferIntent, setIndicatorFromIntent])

  const updateDragClientPointer = React.useCallback(
    (event: Pick<PointerEvent | MouseEvent, "clientX" | "clientY">) => {
      const sourcePath = activePathRef.current

      if (!sourcePath) {
        return
      }

      const pointer = {
        x: event.clientX,
        y: event.clientY,
      }

      lastClientPointerRef.current = pointer
      setIndicatorFromIntent(inferIntent(sourcePath, pointer))
    },
    [inferIntent, setIndicatorFromIntent]
  )

  React.useEffect(() => {
    window.addEventListener("pointermove", updateHoveredBlockFromPointer, {
      capture: true,
    })

    return () => {
      window.removeEventListener("pointermove", updateHoveredBlockFromPointer, {
        capture: true,
      })
    }
  }, [updateHoveredBlockFromPointer])

  React.useEffect(() => {
    if (!activeBlock) {
      return
    }

    // Block hit-testing must use browser client coordinates, not dnd-kit
    // scroll-adjusted drag deltas or overlay transforms.
    window.addEventListener("pointermove", updateDragClientPointer, {
      capture: true,
    })
    window.addEventListener("mousemove", updateDragClientPointer, {
      capture: true,
    })

    return () => {
      window.removeEventListener("pointermove", updateDragClientPointer, {
        capture: true,
      })
      window.removeEventListener("mousemove", updateDragClientPointer, {
        capture: true,
      })
    }
  }, [activeBlock, updateDragClientPointer])

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    const sourcePath = String(event.active.id)
    const activatorEvent = event.activatorEvent

    const clientPointer =
      "clientX" in activatorEvent &&
      "clientY" in activatorEvent &&
      typeof activatorEvent.clientX === "number" &&
      typeof activatorEvent.clientY === "number"
        ? {
            x: activatorEvent.clientX,
            y: activatorEvent.clientY,
          }
        : null

    if (clientPointer) {
      initialClientPointerRef.current = {
        x: clientPointer.x,
        y: clientPointer.y,
      }
    }

    const sourceUnit = registry.getBlockUnit(sourcePath)

    setActiveBlock({
      motionKey: sourceUnit?.motionKey ?? sourcePath,
      path: sourcePath,
    })
    activePathRef.current = sourcePath
    lastClientPointerRef.current = clientPointer
    const activeElement = registry.getBlockElement(sourcePath)
    const preview = registry.getBlockPreview(sourcePath)

    setActivePreview(
      activeElement && preview
        ? {
            node: preview,
            rect: toAgentHtmlBlockLayoutRect(
              activeElement.getBoundingClientRect()
            ),
          }
        : null
    )
    clearLandingPreview()
    setHoveredBlock(null)
    closeBlockInput()
    setIndicator(null)
  }, [clearLandingPreview, closeBlockInput, registry])

  const handleDragMove = React.useCallback(
    (event: DragMoveEvent) => {
      const sourcePath = String(event.active.id)
      const pointer = lastClientPointerRef.current

      if (!pointer) {
        setIndicator(null)
        return
      }

      setIndicatorFromIntent(inferIntent(sourcePath, pointer))
    },
    [inferIntent, setIndicatorFromIntent]
  )

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const sourcePath = String(event.active.id)
      const pointer = lastClientPointerRef.current
      const intent = pointer ? inferIntent(sourcePath, pointer) : null

      if (intent) {
        const sourceUnit = registry.getBlockUnit(sourcePath)
        const initialClientPointer = initialClientPointerRef.current

        captureLayoutSnapshot()
        if (
          activePreview &&
          sourceUnit?.motionKey &&
          initialClientPointer &&
          pointer
        ) {
          startLandingPreview({
            motionKey: sourceUnit.motionKey,
            node: activePreview.node,
            offset: {
              x: pointer.x - initialClientPointer.x,
              y: pointer.y - initialClientPointer.y,
            },
            rect: activePreview.rect,
          })
        }
        onDropIntent?.({ intent, sourcePath })
        dispatchAgentHtmlInteractionEvent({
          intent,
          kind: "block_moved",
          sourcePath,
        })
      }

      initialClientPointerRef.current = null
      activePathRef.current = null
      lastClientPointerRef.current = null
      setActiveBlock(null)
      setActivePreview(null)
      setIndicator(null)
    },
    [
      activePreview,
      captureLayoutSnapshot,
      inferIntent,
      onDropIntent,
      registry,
      startLandingPreview,
    ]
  )

  const handleDragCancel = React.useCallback(() => {
    initialClientPointerRef.current = null
    activePathRef.current = null
    lastClientPointerRef.current = null
    setActiveBlock(null)
    setActivePreview(null)
    clearLandingPreview()
    setIndicator(null)
    closeBlockInput()
  }, [clearLandingPreview, closeBlockInput])

  const value = React.useMemo<AgentHtmlBlockRuntimeContextValue>(
    () => {
      const activePath = activeBlock
        ? (registry.findPathByMotionKey(activeBlock.motionKey) ??
          activeBlock.path)
        : null
      const hoveredPath = hoveredBlock?.path ?? null

      return {
        activeMotionKey: activeBlock?.motionKey ?? null,
        activePath,
        clearIndicator,
        closeBlockInput,
        getBlockElement: registry.getBlockElement,
        getBlockElements: registry.getBlockElements,
        getHoveredBlockElement,
        getOverlayElement: registry.getOverlayElement,
        getVisibleBlockRects: registry.getVisibleBlockRects,
        hoveredMotionKey: hoveredBlock?.motionKey ?? null,
        hoveredPath,
        indicator,
        landingMotionKey,
        openBlockInput,
        registerBlockElement: registry.registerBlockElement,
        registerBlockPreview: registry.registerBlockPreview,
        registerBlockUnit: registry.registerBlockUnit,
        registerOverlayElement: registry.registerOverlayElement,
        refreshDragIntent,
        setActiveBlock,
        setHoveredBlock,
        setIndicator,
      }
    },
    [
      activeBlock,
      clearIndicator,
      closeBlockInput,
      getHoveredBlockElement,
      hoveredBlock,
      indicator,
      landingMotionKey,
      openBlockInput,
      refreshDragIntent,
      registry,
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
            <AgentHtmlBlockDragOverlay preview={activePreview} />
          ) : null}
        </DragOverlay>
        {landingOverlayLayer}
        {blockInputPopoverLayer}
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
