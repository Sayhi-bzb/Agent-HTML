import * as React from "react"

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
import { HostFloatingPromptPopoverContent } from "../ui/prompt"

const defaultBlockHighlightPadding = 6
const defaultBlockActionWidth = 6
const defaultBlockActionOutsideGap = 6

export function findHoveredBlockOverlay({
  handleGutter = 0,
  overlays,
  x,
  y,
}: {
  handleGutter?: number
  overlays: BlockOverlay[]
  x: number
  y: number
}) {
  for (let index = overlays.length - 1; index >= 0; index -= 1) {
    const overlay = overlays[index]

    if (
      x >= overlay.x - handleGutter &&
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

function getBlockActionHandleGutter(root: HTMLElement) {
  if (typeof window === "undefined") {
    return defaultBlockActionWidth + defaultBlockActionOutsideGap
  }

  const style = window.getComputedStyle(root)
  const width = parseCssLengthInPixels(
    style.getPropertyValue("--canvas-block-action-width"),
    defaultBlockActionWidth
  )
  const gap = parseCssLengthInPixels(
    style.getPropertyValue("--canvas-block-action-outside-gap"),
    defaultBlockActionOutsideGap
  )

  return width + gap
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

export function resolveBlockHandleHoverState({
  blockId,
  currentHoveredBlockId,
  isPromptOpen,
  phase,
}: {
  blockId: string
  currentHoveredBlockId: string | null
  isPromptOpen: boolean
  phase: "enter" | "leave"
}) {
  if (phase === "enter") {
    return blockId
  }

  if (currentHoveredBlockId !== blockId) {
    return currentHoveredBlockId
  }

  return isPromptOpen ? currentHoveredBlockId : null
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
  const handleGutterRef = React.useRef(defaultBlockActionWidth + defaultBlockActionOutsideGap)
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
      handleGutterRef.current = getBlockActionHandleGutter(root)
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      if (
        x < -handleGutterRef.current ||
        y < 0 ||
        x > rect.width ||
        y > rect.height
      ) {
        setHoveredBlockId(null)
        return
      }

      const hovered = findHoveredBlockOverlay({
        handleGutter: handleGutterRef.current,
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
                <button
                  aria-label={`Message ${overlay.title}`}
                  className="canvas-block-action"
                  data-hovered={isHovered || isPromptOpen ? "true" : undefined}
                  onBlur={() => {
                    setHoveredBlockId((currentHoveredBlockId) =>
                      resolveBlockHandleHoverState({
                        blockId: overlay.id,
                        currentHoveredBlockId,
                        isPromptOpen,
                        phase: "leave",
                      })
                    )
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
                    setHoveredBlockId((currentHoveredBlockId) =>
                      resolveBlockHandleHoverState({
                        blockId: overlay.id,
                        currentHoveredBlockId,
                        isPromptOpen,
                        phase: "enter",
                      })
                    )
                  }}
                  onPointerEnter={() => {
                    setHoveredBlockId((currentHoveredBlockId) =>
                      resolveBlockHandleHoverState({
                        blockId: overlay.id,
                        currentHoveredBlockId,
                        isPromptOpen,
                        phase: "enter",
                      })
                    )
                  }}
                  onPointerLeave={() => {
                    setHoveredBlockId((currentHoveredBlockId) =>
                      resolveBlockHandleHoverState({
                        blockId: overlay.id,
                        currentHoveredBlockId,
                        isPromptOpen,
                        phase: "leave",
                      })
                    )
                  }}
                  type="button"
                />
                {messageThread ? (
                  <button
                    aria-label={`Open agent events for ${overlay.title}`}
                    className="canvas-block-message-badge"
                    data-phase={messageThread.phase}
                    onClick={() => {
                      messageHost.onThreadOpenChange({
                        blockId: messageThread.blockId,
                        filePath: messageThread.filePath,
                        isOpen: !messageThread.isOpen,
                      })
                    }}
                    type="button"
                  >
                    <span className="canvas-block-message-badge-dot" />
                  </button>
                ) : null}
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
