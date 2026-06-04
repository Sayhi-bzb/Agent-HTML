import * as React from "react"
import { SparklesIcon } from "lucide-react"

import { artifactRenderedEventName } from "./api"
import {
  getCanvasMessageHostSnapshot,
  subscribeCanvasMessageHost,
} from "./canvas-message-store"
import { FloatingPrompt } from "./floating-prompt"
import { Button } from "#agent-html-playground/ui/button"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "#agent-html-playground/ui/popover"
import type { BlockOverlay } from "./host-contracts"

const defaultBlockHighlightPadding = 6

export function findHoveredBlockOverlay({
  overlays,
  x,
  y,
}: {
  overlays: BlockOverlay[]
  x: number
  y: number
}) {
  for (let index = overlays.length - 1; index >= 0; index -= 1) {
    const overlay = overlays[index]

    if (
      x >= overlay.x &&
      x <= overlay.x + overlay.width &&
      y >= overlay.y &&
      y <= overlay.y + overlay.height
    ) {
      return overlay
    }
  }

  return null
}

export function parseCssLengthInPixels(value: string, fallback: number) {
  const trimmed = value.trim()

  if (!trimmed) {
    return fallback
  }

  if (trimmed.endsWith("px")) {
    const parsed = Number.parseFloat(trimmed)

    return Number.isFinite(parsed) ? parsed : fallback
  }

  if (trimmed.endsWith("rem")) {
    const parsed = Number.parseFloat(trimmed)

    return Number.isFinite(parsed) ? parsed * 16 : fallback
  }

  const parsed = Number.parseFloat(trimmed)

  return Number.isFinite(parsed) ? parsed : fallback
}

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

export function useSurfaceGeometryInvalidation({
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

export function useBlockOverlayMeasurements(
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

export function BlockOverlayLayer({
  overlays,
}: {
  overlays: BlockOverlay[]
}) {
  const [hoveredBlockId, setHoveredBlockId] = React.useState<string | null>(null)
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const messageHost = React.useSyncExternalStore(
    subscribeCanvasMessageHost,
    getCanvasMessageHostSnapshot,
    getCanvasMessageHostSnapshot
  )
  const promptTarget = messageHost.activeTarget

  React.useEffect(() => {
    setHoveredBlockId((current) =>
      current && overlays.some((overlay) => overlay.id === current)
        ? current
        : null
    )
  }, [overlays])

  React.useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const root = rootRef.current
      if (!root) {
        setHoveredBlockId(null)
        return
      }

      const rect = root.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        setHoveredBlockId(null)
        return
      }

      const hovered = findHoveredBlockOverlay({ overlays, x, y })

      setHoveredBlockId(hovered?.id ?? null)
    }

    function handlePointerLeave() {
      setHoveredBlockId(null)
    }

    window.addEventListener("pointermove", handlePointerMove, { capture: true })
    window.addEventListener("pointerleave", handlePointerLeave)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove, {
        capture: true,
      })
      window.removeEventListener("pointerleave", handlePointerLeave)
    }
  }, [overlays])

  return (
    <div className="canvas-block-overlay-layer" ref={rootRef}>
      {overlays.map((overlay) => {
        const isHovered = overlay.id === hoveredBlockId
        const isPromptOpen = overlay.id === promptTarget?.id

        return (
          <Popover
            key={overlay.id}
            open={isPromptOpen}
            onOpenChange={(open) => {
              if (!open && isPromptOpen) {
                messageHost.onClose()
              }
            }}
          >
            <PopoverAnchor asChild>
              <div
                className="canvas-block-overlay"
                data-hovered={isHovered || isPromptOpen ? "true" : undefined}
                style={{
                  height: overlay.height,
                  left: overlay.x,
                  top: overlay.y,
                  width: overlay.width,
                }}
              >
                <Button
                  aria-label={`Message ${overlay.title}`}
                  className="canvas-block-action"
                  data-hovered={isHovered || isPromptOpen ? "true" : undefined}
                  onClick={(event) => {
                    messageHost.onOpenTarget({
                      anchorElement: overlay.element,
                      id: overlay.id,
                      title: overlay.title,
                      triggerElement: event.currentTarget,
                    })
                  }}
                  size="icon-sm"
                  type="button"
                  variant="outline"
                >
                  <SparklesIcon />
                </Button>
              </div>
            </PopoverAnchor>
            {isPromptOpen && promptTarget ? (
              <PopoverContent
                align="start"
                className="canvas-floating-prompt-popover"
                collisionPadding={12}
                side="right"
                sideOffset={12}
              >
                <FloatingPrompt
                  onDraftChange={messageHost.onDraftChange}
                  onSubmit={messageHost.onPromptSubmit}
                  status={messageHost.status}
                  target={promptTarget}
                  value={messageHost.draft}
                />
              </PopoverContent>
            ) : null}
          </Popover>
        )
      })}
    </div>
  )
}
