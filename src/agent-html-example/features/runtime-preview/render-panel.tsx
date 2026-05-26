import * as React from "react"
import { autoUpdate, computePosition, offset } from "@floating-ui/react"
import { motion, useReducedMotion } from "motion/react"

import {
  selectHoverCardPlacement,
  unionRects,
  type HoverCardCandidate,
  type HoverCardSide,
} from "@/agent-html-example/features/runtime-preview/hover-card-placement"
import { useAgentHtmlBlockRuntime } from "@/agent-html"
import { ScrollArea } from "@/agent-html-example/ui"

const hoverCardSize = {
  height: 40,
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

export const RenderPanel = React.memo(function RenderPanel({
  children,
}: {
  children: React.ReactNode
}) {
  const blockRuntime = useAgentHtmlBlockRuntime()
  const shouldReduceMotion = useReducedMotion()
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const hoverCardRef = React.useRef<HTMLDivElement | null>(null)
  const hoveredBlockRef = React.useRef<HTMLElement | null>(null)
  const cleanupAutoUpdateRef = React.useRef<(() => void) | null>(null)
  const previousSideRef = React.useRef<HoverCardSide | undefined>(undefined)
  const placementRequestRef = React.useRef(0)
  const [isHoverCardVisible, setIsHoverCardVisible] = React.useState(false)
  const [placement, setPlacement] = React.useState<{
    left: number
    side: HoverCardSide
    top: number
  } | null>(null)

  const updatePlacement = React.useCallback((block: HTMLElement | null) => {
    const requestId = placementRequestRef.current + 1
    placementRequestRef.current = requestId
    const viewport = viewportRef.current
    const hoverCard = hoverCardRef.current

    if (!block || !viewport || !hoverCard) {
      hoveredBlockRef.current = null
      cleanupAutoUpdateRef.current?.()
      cleanupAutoUpdateRef.current = null
      setIsHoverCardVisible(false)
      return
    }

    if (hoveredBlockRef.current !== block) {
      cleanupAutoUpdateRef.current?.()
      cleanupAutoUpdateRef.current = autoUpdate(block, hoverCard, () => {
        updatePlacement(hoveredBlockRef.current)
      })
    }

    hoveredBlockRef.current = block
    const contentRect = unionRects(blockRuntime.getVisibleBlockRects())

    if (!contentRect) {
      setIsHoverCardVisible(false)
      return
    }

    const sides: HoverCardSide[] = ["left", "right", "top", "bottom"]

    void Promise.all(
      sides.map(async (side) => {
        const { x, y } = await computePosition(block, hoverCard, {
          middleware: [offset(12)],
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
      setPlacement(nextPlacement)
      setIsHoverCardVisible(Boolean(nextPlacement))
    })
  }, [blockRuntime])

  const handleScroll = React.useCallback(() => {
    hoveredBlockRef.current = null
    cleanupAutoUpdateRef.current?.()
    cleanupAutoUpdateRef.current = null
    setIsHoverCardVisible(false)
    blockRuntime.setHoveredPath(null)
  }, [blockRuntime])

  React.useEffect(() => {
    updatePlacement(blockRuntime.getHoveredBlockElement())
  }, [blockRuntime, blockRuntime.hoveredPath, updatePlacement])

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
      <ScrollArea className="h-full w-full">
        <div
          className="w-full min-w-0 p-5"
          onScroll={handleScroll}
        >
          {children}
        </div>
      </ScrollArea>
      <motion.div
        animate={{
          opacity: isHoverCardVisible ? 1 : 0,
          scale: shouldReduceMotion || isHoverCardVisible ? 1 : 0.96,
          x: placement?.left ?? 0,
          y: placement?.top ?? 0,
        }}
        aria-hidden="true"
        className="pointer-events-none fixed z-50 h-10 w-56 rounded-lg bg-popover shadow-md ring-1 ring-foreground/10"
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
      />
    </div>
  )
})
