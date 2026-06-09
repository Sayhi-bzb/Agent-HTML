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
  blockMessageThreadLabel,
  findHoveredBlockOverlay,
  isBlockActionBadgeVisible,
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
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <BlockActionBadgeIcon state={badgeState} />
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
          {messageThread ? <BlockMessagePanel thread={messageThread} /> : null}
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
}
