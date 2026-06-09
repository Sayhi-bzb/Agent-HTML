import * as React from "react"
import {
  CircleAlertIcon,
  CircleCheckIcon,
  LoaderCircleIcon,
  MessageSquareReplyIcon,
} from "lucide-react"

import {
  getCanvasMessageHostSnapshot,
  subscribeCanvasMessageHost,
} from "../prompt/canvas-message-store"
import type { CanvasMessageHostSnapshot } from "../prompt/canvas-message-store"
import { FloatingPrompt } from "../prompt/floating-prompt"
import {
  blockActionBadgeState,
  findHoveredBlockOverlay,
  isBlockActionBadgeVisible,
  resolveBlockMessagePopoverPlacement,
  shouldMarkBlockMessageThreadRead,
  shouldOpenBlockMessageThreadFromActionBadge,
  type BlockActionBadgeState,
} from "./block-overlay-state"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "#agent-html-playground/components/ui/popover"
import type {
  BlockMessageItem,
  BlockMessageThread,
  BlockOverlay,
  FloatingPromptTarget,
} from "../host-contracts"
import { HostButton } from "../ui/button"
import { HostFloatingPromptPopoverContent } from "../ui/prompt"

function BlockActionBadgeIcon({ state }: { state: BlockActionBadgeState }) {
  if (state === "running") {
    return (
      <LoaderCircleIcon
        aria-hidden="true"
        className="canvas-block-action-badge-icon"
      />
    )
  }

  if (state === "done") {
    return (
      <CircleCheckIcon
        aria-hidden="true"
        className="canvas-block-action-badge-icon"
      />
    )
  }

  if (state === "failed") {
    return (
      <CircleAlertIcon
        aria-hidden="true"
        className="canvas-block-action-badge-icon"
      />
    )
  }

  return (
    <MessageSquareReplyIcon
      aria-hidden="true"
      className="canvas-block-action-badge-icon"
    />
  )
}

type BlockMessagePanelSection = {
  id: string
  status?: BlockMessageItem["status"]
  summary: string
}

function BlockMessageEventItem({ item }: { item: BlockMessagePanelSection }) {
  return (
    <li
      className="canvas-block-message-item"
      data-status={item.status}
    >
      <span className="canvas-block-message-item-body">
        <span className="canvas-block-message-item-summary">{item.summary}</span>
      </span>
    </li>
  )
}

type BlockMessagePanelView = "messages" | "diff"

function lastBlockMessageItem(
  thread: BlockMessageThread,
  predicate: (item: BlockMessageItem) => boolean
) {
  for (let index = thread.items.length - 1; index >= 0; index -= 1) {
    const item = thread.items[index]

    if (predicate(item)) {
      return item
    }
  }

  return undefined
}

function blockMessageReviewSummary(thread: BlockMessageThread) {
  if (thread.phase === "failed") {
    return "Review failed request details and retry when ready."
  }

  if (thread.phase === "running") {
    return "Codex is working on this block request."
  }

  if (thread.phase === "done") {
    return "Codex accepted this block request."
  }

  return "No review available yet."
}

function blockMessageDiffSummary(thread: BlockMessageThread) {
  if (thread.threadId || thread.turnId) {
    return "Codex thread diff available."
  }

  return "No diff available yet."
}

function blockMessageItems(thread: BlockMessageThread) {
  const request = lastBlockMessageItem(thread, (item) => item.kind === "request")
  const response = lastBlockMessageItem(thread, (item) => item.kind === "response")
  const status = lastBlockMessageItem(thread, (item) => item.kind === "status")

  return [
    {
      id: "request",
      status: request?.status,
      summary: request?.summary ?? "No request available.",
    },
    {
      id: "result",
      status: response?.status ?? status?.status,
      summary: response?.summary ?? status?.summary ?? "No result available yet.",
    },
    {
      id: "review",
      status: thread.phase === "failed" ? "failed" : status?.status,
      summary: blockMessageReviewSummary(thread),
    },
  ] satisfies BlockMessagePanelSection[]
}

function BlockMessagePanel({ thread }: { thread: BlockMessageThread }) {
  const [view, setView] = React.useState<BlockMessagePanelView>("messages")
  const items =
    view === "messages"
      ? blockMessageItems(thread)
      : [
          {
            id: "diff",
            status: thread.phase === "failed" ? "failed" : undefined,
            summary: blockMessageDiffSummary(thread),
          } satisfies BlockMessagePanelSection,
        ]

  return (
    <div className="canvas-block-message-panel">
      <div aria-label="Message view" className="canvas-block-message-tabs">
        <button
          className="canvas-block-message-tab"
          data-active={view === "messages" ? "true" : undefined}
          onClick={() => setView("messages")}
          type="button"
        >
          Messages
        </button>
        <button
          className="canvas-block-message-tab"
          data-active={view === "diff" ? "true" : undefined}
          onClick={() => setView("diff")}
          type="button"
        >
          Diff
        </button>
      </div>
      <ol className="canvas-block-message-list">
        {items.map((item) => (
          <BlockMessageEventItem item={item} key={item.id} />
        ))}
      </ol>
    </div>
  )
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
      {overlays.map((overlay) => (
        <BlockOverlayItem
          hoveredBlockId={hoveredBlockId}
          key={overlay.id}
          messageHost={messageHost}
          overlay={overlay}
          promptTarget={promptTarget}
          setHoveredBlockId={setHoveredBlockId}
        />
      ))}
    </div>
  )
}

function BlockOverlayItem({
  hoveredBlockId,
  messageHost,
  overlay,
  promptTarget,
  setHoveredBlockId,
}: {
  hoveredBlockId: string | null
  messageHost: CanvasMessageHostSnapshot
  overlay: BlockOverlay
  promptTarget: FloatingPromptTarget | null
  setHoveredBlockId: React.Dispatch<React.SetStateAction<string | null>>
}) {
  const isHovered = overlay.id === hoveredBlockId
  const isPromptOpen = overlay.id === promptTarget?.id
  const messageThread = Object.values(messageHost.blockMessages.threads).find(
    (thread) =>
      thread.blockId === overlay.id &&
      thread.filePath === messageHost.activeFilePath
  )
  const isThreadOpen = Boolean(messageThread?.isOpen)
  const isPanelVisible = isPromptOpen || isThreadOpen
  const badgeState = blockActionBadgeState(messageThread)
  const isBadgeVisible = isBlockActionBadgeVisible({
    isHovered,
    isPromptOpen,
    isThreadOpen,
    state: badgeState,
  })
  const badgeRef = React.useRef<HTMLButtonElement | null>(null)
  const popoverPlacement = resolveBlockMessagePopoverPlacement({
    triggerRect: badgeRef.current?.getBoundingClientRect() ?? null,
    viewportWidth: typeof window === "undefined" ? 0 : window.innerWidth,
  })

  React.useEffect(() => {
    if (!messageThread) {
      return
    }

    if (shouldMarkBlockMessageThreadRead({ isThreadOpen, thread: messageThread })) {
      messageHost.onThreadOpenChange({
        blockId: messageThread.blockId,
        filePath: messageThread.filePath,
        isOpen: true,
      })
    }
  }, [isThreadOpen, messageHost, messageThread])

  return (
    <Popover
      open={isPanelVisible}
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
        <PopoverAnchor asChild>
          <HostButton
            aria-label={`Reply to ${overlay.title}`}
            className="canvas-block-action-badge"
            data-state={badgeState}
            data-visible={isBadgeVisible ? "true" : undefined}
            onBlur={() => {
              if (!isPromptOpen) {
                setHoveredBlockId(null)
              }
            }}
            onClick={(event) => {
              if (
                messageThread &&
                shouldOpenBlockMessageThreadFromActionBadge(messageThread)
              ) {
                messageHost.onClose()
                messageHost.onThreadOpenChange({
                  blockId: messageThread.blockId,
                  filePath: messageThread.filePath,
                  isOpen: true,
                })
              } else {
                messageHost.onOpenTarget({
                  anchorElement: overlay.element,
                  id: overlay.id,
                  title: overlay.title,
                  triggerElement: event.currentTarget,
                })
              }
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
            ref={badgeRef}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <BlockActionBadgeIcon state={badgeState} />
          </HostButton>
        </PopoverAnchor>
      </div>
      {isPromptOpen && promptTarget ? (
        <HostFloatingPromptPopoverContent
          align={popoverPlacement.align}
          collisionPadding={popoverPlacement.collisionPadding}
          side={popoverPlacement.side}
          sideOffset={popoverPlacement.sideOffset}
        >
          <FloatingPrompt
            onDraftChange={messageHost.onDraftChange}
            onSubmit={messageHost.onPromptSubmit}
            status={messageHost.status}
            target={promptTarget}
            value={messageHost.draft}
          />
          {messageThread ? <BlockMessagePanel thread={messageThread} /> : null}
        </HostFloatingPromptPopoverContent>
      ) : messageThread && isThreadOpen ? (
        <PopoverContent
          align={popoverPlacement.align}
          className="canvas-block-message-popover"
          collisionPadding={popoverPlacement.collisionPadding}
          side={popoverPlacement.side}
          sideOffset={popoverPlacement.sideOffset}
        >
          <BlockMessagePanel thread={messageThread} />
        </PopoverContent>
      ) : null}
    </Popover>
  )
}
