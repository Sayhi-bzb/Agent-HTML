import * as React from "react"
import { MessageSquareReplyIcon } from "lucide-react"

import { artifactRenderedEventName } from "../api/api"
import {
  getCanvasMessageHostSnapshot,
  subscribeCanvasMessageHost,
} from "../prompt/canvas-message-store"
import { FloatingPrompt } from "../prompt/floating-prompt"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "#agent-html-playground/components/ui/popover"
import type {
  BlockMessageItem,
  BlockMessageThread,
  BlockOverlay,
} from "../host-contracts"
import { HostButton } from "../ui/button"
import { HostFloatingPromptPopoverContent } from "../ui/prompt"

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

export function blockMessageThreadLabel(phase: BlockMessageThread["phase"]) {
  return {
    done: "Done",
    failed: "Failed",
    idle: "Idle",
    running: "Running",
  }[phase]
}

function BlockMessageEventItem({ item }: { item: BlockMessageItem }) {
  return (
    <li
      className="canvas-block-message-item"
      data-kind={item.kind}
      data-status={item.status}
    >
      <span className="canvas-block-message-item-kind">{item.kind}</span>
      <span className="canvas-block-message-item-body">
        <span className="canvas-block-message-item-title">{item.title}</span>
        <span className="canvas-block-message-item-summary">{item.summary}</span>
      </span>
    </li>
  )
}

function BlockMessagePanel({ thread }: { thread: BlockMessageThread }) {
  return (
    <div className="canvas-block-message-panel">
      <header className="canvas-block-message-panel-header">
        <span className="canvas-block-message-panel-title">{thread.title}</span>
        <span className="canvas-block-message-panel-status">
          {blockMessageThreadLabel(thread.phase)}
        </span>
      </header>
      <ol className="canvas-block-message-list">
        {thread.items.map((item) => (
          <BlockMessageEventItem item={item} key={item.id} />
        ))}
      </ol>
    </div>
  )
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

      if (
        x < 0 ||
        y < 0 ||
        x > rect.width ||
        y > rect.height
      ) {
        setHoveredBlockId(null)
        return
      }

      const hovered = findHoveredBlockOverlay({
        overlays,
        x,
        y,
      })

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
        const messageThread = Object.values(
          messageHost.blockMessages.threads
        ).find(
          (thread) =>
            thread.blockId === overlay.id &&
            thread.filePath === messageHost.activeFilePath
        )
        const isThreadOpen = Boolean(messageThread?.isOpen)
        const isReplyVisible =
          isHovered || isPromptOpen || Boolean(messageThread)

        return (
          <Popover
            key={overlay.id}
            open={isPromptOpen || isThreadOpen}
            onOpenChange={(open) => {
              if (!open && isPromptOpen) {
                messageHost.onClose()
              }
              if (messageThread && !open) {
                messageHost.onThreadOpenChange({
                  blockId: messageThread.blockId,
                  filePath: messageThread.filePath,
                  isOpen: false,
                })
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
                <HostButton
                  aria-label={`Reply to ${overlay.title}`}
                  className="canvas-block-reply-badge"
                  data-phase={messageThread?.phase}
                  data-visible={isReplyVisible ? "true" : undefined}
                  onBlur={() => {
                    if (!isPromptOpen) {
                      setHoveredBlockId(null)
                    }
                  }}
                  onClick={(event) => {
                    messageHost.onOpenTarget({
                      anchorElement: overlay.element,
                      id: overlay.id,
                      title: overlay.title,
                      triggerElement: event.currentTarget,
                    })
                  }}
                  onFocus={() => {
                    setHoveredBlockId(overlay.id)
                  }}
                  onPointerEnter={() => {
                    setHoveredBlockId(overlay.id)
                  }}
                  onPointerLeave={() => {
                    if (!isPromptOpen) {
                      setHoveredBlockId(null)
                    }
                  }}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <MessageSquareReplyIcon
                    aria-hidden="true"
                    className="canvas-block-reply-badge-icon"
                  />
                  {messageThread ? (
                    <span
                      aria-hidden="true"
                      className="canvas-block-notification-dot"
                    />
                  ) : null}
                </HostButton>
              </div>
            </PopoverAnchor>
            {isPromptOpen && promptTarget ? (
              <HostFloatingPromptPopoverContent
                align="start"
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
                {messageThread ? (
                  <BlockMessagePanel thread={messageThread} />
                ) : null}
              </HostFloatingPromptPopoverContent>
            ) : messageThread && isThreadOpen ? (
              <PopoverContent
                align="start"
                className="canvas-block-message-popover"
                collisionPadding={12}
                side="right"
                sideOffset={12}
              >
                <BlockMessagePanel thread={messageThread} />
              </PopoverContent>
            ) : null}
          </Popover>
        )
      })}
    </div>
  )
}
