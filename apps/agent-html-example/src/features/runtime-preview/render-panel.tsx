import * as React from "react"
import { autoUpdate, computePosition, offset } from "@floating-ui/react"
import { motion, useReducedMotion } from "motion/react"

import {
  selectHoverCardPlacement,
  unionRects,
  type HoverCardCandidate,
  type HoverCardSide,
} from "@example/features/runtime-preview/hover-card-placement"
import { BlockSummaryCode } from "@example/features/runtime-preview/block-summary-code"
import { AgentHtmlBlockIndicator, useAgentHtmlBlockRuntime } from "@/agent-html"
import { ScrollArea } from "@example/ui"

const hoverCardSize = {
  height: 224,
  width: 224,
} as const

const hoverCardMotionTransition = {
  opacity: { duration: 0.14, ease: "easeOut" },
  scale: { duration: 0.16, ease: "easeOut" },
  x: { damping: 42, mass: 0.7, stiffness: 520, type: "spring" },
  y: { damping: 42, mass: 0.7, stiffness: 520, type: "spring" },
} as const

const reducedHoverCardMotionTransition = {
  opacity: { duration: 0.1, ease: "easeOut" },
  scale: { duration: 0 },
  x: { duration: 0 },
  y: { duration: 0 },
} as const

type HoverCardState = {
  placement: {
    left: number
    side: HoverCardSide
    top: number
  } | null
  summary: string
  visible: boolean
}

export const RenderPanel = React.memo(function RenderPanel({
  blockSummaries,
  children,
}: {
  blockSummaries: Record<string, string>
  children: React.ReactNode
}) {
  const blockRuntime = useAgentHtmlBlockRuntime()
  const {
    activePath,
    getHoveredBlockElement,
    getVisibleBlockRects,
    hoveredMotionKey,
    hoveredPath,
    registerOverlayElement,
    refreshDragIntent,
    setHoveredBlock,
  } = blockRuntime
  const shouldReduceMotion = useReducedMotion()
  const scrollAreaRef = React.useRef<HTMLDivElement | null>(null)
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const hoverCardRef = React.useRef<HTMLDivElement | null>(null)
  const hoveredBlockRef = React.useRef<HTMLElement | null>(null)
  const cleanupAutoUpdateRef = React.useRef<(() => void) | null>(null)
  const previousSideRef = React.useRef<HoverCardSide | undefined>(undefined)
  const placementRequestRef = React.useRef(0)
  const [hoverCard, setHoverCard] = React.useState<HoverCardState>({
    placement: null,
    summary: "",
    visible: false,
  })

  React.useEffect(() => {
    return registerOverlayElement(viewportRef.current)
  }, [registerOverlayElement])

  const hideHoverCard = React.useCallback(() => {
    setHoverCard((current) => ({
      ...current,
      visible: false,
    }))
  }, [])

  const invalidateHoverCardRequest = React.useCallback(() => {
    placementRequestRef.current += 1
    hoveredBlockRef.current = null
    cleanupAutoUpdateRef.current?.()
    cleanupAutoUpdateRef.current = null
    hideHoverCard()
  }, [hideHoverCard])

  const updatePlacement = React.useCallback((block: HTMLElement | null) => {
    const requestId = placementRequestRef.current + 1
    placementRequestRef.current = requestId
    const viewport = viewportRef.current
    const hoverCardElement = hoverCardRef.current
    const hoverSummary = hoveredMotionKey
      ? blockSummaries[hoveredMotionKey] ?? blockSummaries[hoveredPath ?? ""]
      : null

    if (activePath || !block || !viewport || !hoverCardElement || !hoverSummary) {
      invalidateHoverCardRequest()
      return
    }

    if (hoveredBlockRef.current !== block) {
      cleanupAutoUpdateRef.current?.()
      cleanupAutoUpdateRef.current = autoUpdate(block, hoverCardElement, () => {
        updatePlacement(hoveredBlockRef.current)
      })
    }

    hoveredBlockRef.current = block
    const contentRect = unionRects(getVisibleBlockRects())

    if (!contentRect) {
      hideHoverCard()
      return
    }

    const sides: HoverCardSide[] = ["left", "right", "top", "bottom"]

    void Promise.all(
      sides.map(async (side) => {
        const { x, y } = await computePosition(block, hoverCardElement, {
          middleware: [offset(36)],
          placement: side,
          strategy: "fixed",
        })

        return {
          left: x,
          side,
          top: y,
        } satisfies HoverCardCandidate
      })
    ).then((candidates) => {
      if (placementRequestRef.current !== requestId) {
        return
      }

      const nextPlacement = selectHoverCardPlacement({
        candidates,
        cardSize: hoverCardSize,
        contentRect,
        previousSide: previousSideRef.current,
        viewportRect: viewport.getBoundingClientRect(),
      })

      previousSideRef.current = nextPlacement?.side ?? previousSideRef.current
      if (!nextPlacement || hoveredBlockRef.current !== block) {
        hideHoverCard()
        return
      }

      setHoverCard({
        placement: nextPlacement,
        summary: hoverSummary,
        visible: true,
      })
    })
  }, [
    activePath,
    blockSummaries,
    getVisibleBlockRects,
    hideHoverCard,
    hoveredMotionKey,
    hoveredPath,
    invalidateHoverCardRequest,
  ])

  const handleScroll = React.useCallback(() => {
    invalidateHoverCardRequest()
    if (activePath) {
      refreshDragIntent()
      return
    }

    setHoveredBlock(null)
  }, [activePath, invalidateHoverCardRequest, refreshDragIntent, setHoveredBlock])

  React.useEffect(() => {
    const scrollRoot = scrollAreaRef.current
    const scrollViewport = scrollRoot?.querySelector<HTMLElement>(
      "[data-slot='scroll-area-viewport']"
    )

    if (!scrollViewport) {
      return
    }

    scrollViewport.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      scrollViewport.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  React.useEffect(() => {
    updatePlacement(getHoveredBlockElement())
  }, [
    blockSummaries,
    getHoveredBlockElement,
    hoveredMotionKey,
    hoveredPath,
    updatePlacement,
  ])

  React.useEffect(() => {
    if (!activePath) {
      return
    }

    invalidateHoverCardRequest()
  }, [activePath, invalidateHoverCardRequest])

  React.useEffect(() => {
    return () => {
      cleanupAutoUpdateRef.current?.()
    }
  }, [])

  return (
    <div
      className="relative h-full min-h-0 w-full min-w-0 overflow-hidden"
      ref={viewportRef}
    >
      <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
        <div
          className="w-full min-w-0 p-5"
        >
          {children}
        </div>
      </ScrollArea>
      <AgentHtmlBlockIndicator />
      <motion.div
        animate={{
          opacity: hoverCard.visible ? 1 : 0,
          scale: shouldReduceMotion || hoverCard.visible ? 1 : 0.96,
          x: hoverCard.placement?.left ?? 0,
          y: hoverCard.placement?.top ?? 0,
        }}
        aria-hidden="true"
        className="pointer-events-none fixed z-50 max-h-56 w-56 overflow-hidden rounded-lg border border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[var(--card)] px-3 py-2 shadow-[0_18px_36px_-24px_color-mix(in_oklab,var(--foreground)_35%,transparent)] ring-1 ring-[color-mix(in_oklab,var(--foreground)_10%,transparent)]"
        data-agent-html-hover-card="true"
        initial={false}
        ref={hoverCardRef}
        transition={
          shouldReduceMotion
            ? reducedHoverCardMotionTransition
            : hoverCardMotionTransition
        }
        style={{
          left: 0,
          top: 0,
        }}
      >
        <BlockSummaryCode summary={hoverCard.summary} />
      </motion.div>
    </div>
  )
})
