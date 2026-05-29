import * as React from "react"

import { cn } from "@/agent-html/lib/utils"
import {
  getAgentHtmlBlockLayoutKeyframes,
  getAgentHtmlBlockLayoutTransitions,
  type AgentHtmlBlockLayoutKeyframe,
  type AgentHtmlBlockLayoutRect,
  type AgentHtmlBlockLayoutSnapshot,
} from "@/agent-html/runtime/block/layout-transition"
import type { AgentHtmlBlockRegistry } from "@/agent-html/runtime/block/block-registry"

type AgentHtmlBlockLandingPreview = {
  fromRect: AgentHtmlBlockLayoutRect
  motionKey: string
  node: React.ReactNode
}

const layoutTransitionOptions = {
  duration: 220,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const

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

export function toAgentHtmlBlockLayoutRect(
  rect: DOMRect
): AgentHtmlBlockLayoutRect {
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

export function useAgentHtmlBlockLayoutAnimation({
  registry,
}: {
  registry: AgentHtmlBlockRegistry
}) {
  const pendingLayoutSnapshotRef = React.useRef<
    AgentHtmlBlockLayoutSnapshot[] | null
  >(null)
  const landingFrameRef = React.useRef<number | null>(null)
  const pendingLayoutFrameRef = React.useRef<number | null>(null)
  const [landingPreview, setLandingPreview] =
    React.useState<AgentHtmlBlockLandingPreview | null>(null)
  const [landingMotionKey, setLandingMotionKey] = React.useState<string | null>(
    null
  )

  const captureLayoutSnapshot = React.useCallback(() => {
    pendingLayoutSnapshotRef.current = canAnimateLayout()
      ? registry.snapshotLayouts()
      : null
  }, [registry])

  const clearLandingPreview = React.useCallback(() => {
    setLandingPreview(null)
    setLandingMotionKey(null)
  }, [])

  const startLandingPreview = React.useCallback(
    ({
      motionKey,
      node,
      offset,
      rect,
    }: {
      motionKey: string
      node: React.ReactNode
      offset: { x: number; y: number }
      rect: AgentHtmlBlockLayoutRect
    }) => {
      setLandingMotionKey(motionKey)
      setLandingPreview({
        fromRect: offsetLayoutRect(rect, offset),
        motionKey,
        node,
      })
    },
    []
  )

  const runPendingLayoutTransition = React.useCallback(() => {
    if (!pendingLayoutSnapshotRef.current || pendingLayoutFrameRef.current) {
      return
    }

    const previous = pendingLayoutSnapshotRef.current
    pendingLayoutSnapshotRef.current = null
    const next = registry.snapshotLayouts()
    const transitions = getAgentHtmlBlockLayoutTransitions({
      next,
      previous,
    })
    const pendingAnimations: Array<{
      element: HTMLElement
      keyframes: [AgentHtmlBlockLayoutKeyframe, AgentHtmlBlockLayoutKeyframe]
    }> = []

    for (const [path, transition] of transitions) {
      const element = registry.getBlockElement(path)

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
  }, [registry])

  const runLandingTransition = React.useCallback(() => {
    if (!landingPreview || landingFrameRef.current) {
      return
    }

    const targetPath = registry.findPathByMotionKey(landingPreview.motionKey)
    const targetElement = targetPath ? registry.getBlockElement(targetPath) : null

    if (!targetElement) {
      clearLandingPreview()
      return
    }

    const targetRect = toAgentHtmlBlockLayoutRect(
      targetElement.getBoundingClientRect()
    )
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
        clearLandingPreview()
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
        clearLandingPreview()
      })
    })
  }, [clearLandingPreview, landingPreview, registry])

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

  const landingOverlayLayer = landingPreview ? (
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
  ) : null

  return {
    captureLayoutSnapshot,
    clearLandingPreview,
    landingMotionKey,
    landingOverlayLayer,
    startLandingPreview,
  }
}
