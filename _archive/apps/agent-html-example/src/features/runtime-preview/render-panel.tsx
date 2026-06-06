import * as React from "react"
import { autoUpdate, computePosition, offset } from "@floating-ui/react"

import {
  selectHoverCardPlacement,
  unionRects,
  type HoverCardCandidate,
  type HoverCardSide,
} from "@example/features/runtime-preview/hover-card-placement"
import { BlockSummaryCode } from "@example/features/runtime-preview/block-summary-code"
import { AgentHtmlRuntimeViewport } from "@/agent-html/runtime"
import { useAgentHtmlBlockRuntime } from "@/agent-html/runtime/block"

const hoverCardSize = {
  height: 224,
  width: 224,
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

function getPrefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(
    getPrefersReducedMotion
  )

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches)
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  return prefersReducedMotion
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
  } = blockRuntime
  const shouldReduceMotion = usePrefersReducedMotion()
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const hoverCardRef = React.useRef<HTMLDivElement | null>(null)
  const hoveredBlockRef = React.useRef<HTMLElement | null>(null)
  const cleanupAutoUpdateRef = React.useRef<(() => void) | null>(null)
  const previousSideRef = React.useRef<HoverCardSide | undefined>(undefined)
  const placementRequestRef = React.useRef(0)
  const updatePlacementRef = React.useRef<(block: HTMLElement | null) => void>(
    () => undefined
  )
  const [hoverCard, setHoverCard] = React.useState<HoverCardState>({
    placement: null,
    summary: "",
    visible: false,
  })

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
        updatePlacementRef.current(hoveredBlockRef.current)
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

  React.useEffect(() => {
    updatePlacementRef.current = updatePlacement
  }, [updatePlacement])

  const handleScroll = React.useCallback(() => {
    invalidateHoverCardRequest()
  }, [invalidateHoverCardRequest])

  React.useEffect(() => {
    const animationFrameId = window.requestAnimationFrame(() => {
      updatePlacement(getHoveredBlockElement())
    })
    return () => window.cancelAnimationFrame(animationFrameId)
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

    const animationFrameId = window.requestAnimationFrame(() => {
      invalidateHoverCardRequest()
    })
    return () => window.cancelAnimationFrame(animationFrameId)
  }, [activePath, invalidateHoverCardRequest])

  React.useEffect(() => {
    return () => {
      cleanupAutoUpdateRef.current?.()
    }
  }, [])

  const hoverCardOverlay = (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-50 max-h-56 w-56 overflow-hidden rounded-lg border border-[color-mix(in_oklab,var(--border)_70%,transparent)] bg-[var(--card)] px-3 py-2 opacity-0 shadow-[0_18px_36px_-24px_color-mix(in_oklab,var(--foreground)_35%,transparent)] ring-1 ring-[color-mix(in_oklab,var(--foreground)_10%,transparent)] transition-[opacity,transform] duration-150 ease-out"
      data-agent-html-hover-card="true"
      ref={hoverCardRef}
      style={{
        left: 0,
        opacity: hoverCard.visible ? 1 : 0,
        top: 0,
        transform: `translate3d(${hoverCard.placement?.left ?? 0}px, ${
          hoverCard.placement?.top ?? 0
        }px, 0) scale(${shouldReduceMotion || hoverCard.visible ? 1 : 0.96})`,
        transitionDuration: shouldReduceMotion ? "0ms" : undefined,
      }}
    >
      <BlockSummaryCode summary={hoverCard.summary} />
    </div>
  )

  return (
    <AgentHtmlRuntimeViewport
      onScroll={handleScroll}
      overlay={hoverCardOverlay}
      viewportRef={viewportRef}
    >
      {children}
    </AgentHtmlRuntimeViewport>
  )
})
