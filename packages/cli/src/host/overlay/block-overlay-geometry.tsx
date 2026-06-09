import * as React from "react"

import { artifactRenderedEventName } from "../api/api"
import { parseCssLengthInPixels } from "./block-overlay-state"
import type { BlockOverlay } from "../host-contracts"

const defaultBlockHighlightPadding = 6

function getBlockHighlightPadding(root: HTMLElement) {
  if (typeof window === "undefined") {
    return defaultBlockHighlightPadding
  }

  return parseCssLengthInPixels(
    window
      .getComputedStyle(root)
      .getPropertyValue("--canvas-block-highlight-padding"),
    defaultBlockHighlightPadding
  )
}

export function createAnimationFrameScheduler(callback: () => void) {
  let frame: number | null = null

  return {
    cancel() {
      if (frame !== null) {
        window.cancelAnimationFrame(frame)
        frame = null
      }
    },
    schedule() {
      if (frame !== null) {
        window.cancelAnimationFrame(frame)
      }

      frame = window.requestAnimationFrame(() => {
        frame = null
        callback()
      })
    },
  }
}

export function measureBlockOverlays(root: HTMLElement | null): BlockOverlay[] {
  if (!root) {
    return []
  }

  const rootRect = root.getBoundingClientRect()
  const highlightPadding = getBlockHighlightPadding(root)
  const blocks = Array.from(
    root.querySelectorAll<HTMLElement>("[data-agent-html-block='true']")
  )

  return blocks.map((element) => {
    const rect = element.getBoundingClientRect()
    const id = element.getAttribute("data-agent-html-block-id") ?? ""

    return {
      element,
      height: rect.height + highlightPadding * 2,
      id,
      title: element.getAttribute("data-agent-html-block-title") ?? id,
      width: rect.width + highlightPadding * 2,
      x: rect.left - rootRect.left - highlightPadding,
      y: rect.top - rootRect.top - highlightPadding,
    }
  })
}

function useSurfaceGeometryInvalidation({
  onInvalidate,
  surfaceRef,
}: {
  onInvalidate: () => void
  surfaceRef: React.RefObject<HTMLElement | null>
}) {
  React.useEffect(() => {
    window.addEventListener("resize", onInvalidate)
    window.addEventListener(artifactRenderedEventName, onInvalidate)

    return () => {
      window.removeEventListener("resize", onInvalidate)
      window.removeEventListener(artifactRenderedEventName, onInvalidate)
    }
  }, [onInvalidate])

  React.useEffect(() => {
    const surface = surfaceRef.current

    if (!surface || typeof ResizeObserver === "undefined") {
      return
    }

    const observer = new ResizeObserver(onInvalidate)
    observer.observe(surface)

    return () => observer.disconnect()
  }, [onInvalidate, surfaceRef])
}

function useBlockOverlayMeasurements(
  rootRef: React.RefObject<HTMLElement | null>
) {
  const [overlays, setOverlays] = React.useState<BlockOverlay[]>([])

  const measureBlocks = React.useCallback(() => {
    setOverlays(measureBlockOverlays(rootRef.current))
  }, [rootRef])

  return { measureBlocks, overlays, setOverlays }
}

export function useBlockOverlays(rootRef: React.RefObject<HTMLElement | null>) {
  const { measureBlocks, overlays, setOverlays } =
    useBlockOverlayMeasurements(rootRef)
  const scheduler = React.useMemo(
    () => createAnimationFrameScheduler(measureBlocks),
    [measureBlocks]
  )
  const scheduleGeometryUpdate = React.useCallback(() => {
    scheduler.schedule()
  }, [scheduler])

  useSurfaceGeometryInvalidation({
    onInvalidate: scheduleGeometryUpdate,
    surfaceRef: rootRef,
  })

  React.useEffect(() => {
    return scheduler.cancel
  }, [scheduler])

  return { measureBlocks, overlays, scheduleGeometryUpdate, setOverlays }
}
