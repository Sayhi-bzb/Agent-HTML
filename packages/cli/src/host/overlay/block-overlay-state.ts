import type { BlockMessageThread, BlockOverlay } from "../host-contracts"

export type BlockActionBadgeState = "default" | "running" | "done" | "failed"

export function shouldTrackBlockHoverPointer(pointerType: string) {
  return pointerType !== "touch"
}

export function blockActionBadgeState(
  thread: BlockMessageThread | undefined
): BlockActionBadgeState {
  if (!thread) {
    return "default"
  }

  if (thread.phase === "running") {
    return "running"
  }

  if (!thread.readAt && thread.phase === "done") {
    return "done"
  }

  if (!thread.readAt && thread.phase === "failed") {
    return "failed"
  }

  return "default"
}

export function shouldMarkBlockMessageThreadRead({
  isThreadOpen,
  thread,
}: {
  isThreadOpen: boolean
  thread: BlockMessageThread | undefined
}) {
  return Boolean(
    isThreadOpen &&
      thread &&
      thread.phase !== "running" &&
      !thread.readAt
  )
}

export function shouldOpenBlockMessageThreadFromActionBadge(
  thread: BlockMessageThread | undefined
) {
  const state = blockActionBadgeState(thread)

  return state === "done" || state === "failed"
}

export function isBlockActionBadgeVisible({
  isHovered,
  isPromptOpen,
  isThreadOpen,
  state,
}: {
  isHovered: boolean
  isPromptOpen: boolean
  isThreadOpen: boolean
  state: BlockActionBadgeState
}) {
  return isHovered || isPromptOpen || isThreadOpen || state !== "default"
}

export function shouldCloseBlockMessagePopoverForIntersection({
  isIntersecting,
  isPanelVisible,
}: {
  isIntersecting: boolean
  isPanelVisible: boolean
}) {
  return isPanelVisible && !isIntersecting
}

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
