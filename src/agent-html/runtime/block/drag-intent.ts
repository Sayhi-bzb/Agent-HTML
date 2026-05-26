import type { AgentHtmlDropIntent } from "@/agent-html/edit/types"
import type { AgentHtmlInteractionUnitRole } from "@/agent-html/interaction/types"

export type AgentHtmlBlockRect = {
  bottom: number
  height: number
  left: number
  right: number
  top: number
  width: number
}

export type AgentHtmlBlockIntentCandidate = {
  path: string
  rect: AgentHtmlBlockRect
  role?: AgentHtmlInteractionUnitRole
}

export type AgentHtmlBlockPointer = {
  x: number
  y: number
}

export function isInvalidAgentHtmlDropTarget(
  sourcePath: string,
  targetPath: string
) {
  return sourcePath === targetPath || targetPath.startsWith(`${sourcePath}/`)
}

function containsPointer(rect: AgentHtmlBlockRect, pointer: AgentHtmlBlockPointer) {
  return (
    pointer.x >= rect.left &&
    pointer.x <= rect.right &&
    pointer.y >= rect.top &&
    pointer.y <= rect.bottom
  )
}

function distanceToRect(
  rect: AgentHtmlBlockRect,
  pointer: AgentHtmlBlockPointer
) {
  const dx = Math.max(rect.left - pointer.x, 0, pointer.x - rect.right)
  const dy = Math.max(rect.top - pointer.y, 0, pointer.y - rect.bottom)

  return Math.hypot(dx, dy)
}

function selectTarget(
  candidates: AgentHtmlBlockIntentCandidate[],
  pointer: AgentHtmlBlockPointer
) {
  const containing = candidates.filter((candidate) =>
    containsPointer(candidate.rect, pointer)
  )

  if (containing.length > 0) {
    return containing.sort(
      (left, right) =>
        left.rect.width * left.rect.height - right.rect.width * right.rect.height
    )[0]
  }

  return candidates
    .map((candidate) => ({
      candidate,
      distance: distanceToRect(candidate.rect, pointer),
    }))
    .filter(({ distance }) => distance <= 36)
    .sort((left, right) => left.distance - right.distance)[0]?.candidate
}

function isGridItem(candidate: AgentHtmlBlockIntentCandidate) {
  return candidate.role === "grid-item"
}

export function inferAgentHtmlDropIntentFromPointer({
  candidates,
  pointer,
  sourcePath,
}: {
  candidates: AgentHtmlBlockIntentCandidate[]
  pointer: AgentHtmlBlockPointer
  sourcePath: string
}): AgentHtmlDropIntent | null {
  const target = selectTarget(
    candidates.filter(
      (candidate) => !isInvalidAgentHtmlDropTarget(sourcePath, candidate.path)
    ),
    pointer
  )

  if (!target) {
    return null
  }

  const { rect } = target
  const columnHotZone = Math.min(48, rect.width * 0.22)

  if (pointer.x <= rect.left + columnHotZone) {
    return { type: "column-before", targetPath: target.path }
  }

  if (pointer.x >= rect.right - columnHotZone) {
    return { type: "column-after", targetPath: target.path }
  }

  if (isGridItem(target)) {
    return { type: "inside", targetPath: target.path }
  }

  return {
    type: pointer.y < rect.top + rect.height / 2 ? "before" : "after",
    targetPath: target.path,
  }
}
