import type { ArtifactStateChange } from "@agent-html/react"

export const canvasInteractionEventName = "agent-html:state-change"

export type CanvasInteractionSnapshot = {
  blockId: string
  currentState: Record<string, unknown>
  recentChanges: ArtifactStateChange[]
}

const maxRecentChanges = 20
const snapshots = new Map<string, CanvasInteractionSnapshot>()

function snapshotKey({
  blockId,
  filePath,
}: {
  blockId: string
  filePath: string
}) {
  return `${filePath}\u0000${blockId}`
}

function isArtifactStateChange(value: unknown): value is ArtifactStateChange {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Partial<ArtifactStateChange>

  return (
    typeof candidate.component === "string" &&
    typeof candidate.controlId === "string" &&
    typeof candidate.kind === "string" &&
    typeof candidate.timestamp === "number" &&
    "before" in candidate &&
    "after" in candidate
  )
}

export function recordCanvasInteractionChange({
  change,
  filePath,
}: {
  change: ArtifactStateChange
  filePath: string
}) {
  if (!change.blockId) {
    return
  }

  const key = snapshotKey({ blockId: change.blockId, filePath })
  const previous = snapshots.get(key) ?? {
    blockId: change.blockId,
    currentState: {},
    recentChanges: [],
  }

  snapshots.set(key, {
    blockId: change.blockId,
    currentState: {
      ...previous.currentState,
      [change.controlId]: change.after,
    },
    recentChanges: [...previous.recentChanges, change].slice(-maxRecentChanges),
  })
}

export function getCanvasInteractionSnapshot({
  blockId,
  filePath,
}: {
  blockId: string
  filePath: string
}): CanvasInteractionSnapshot | null {
  return snapshots.get(snapshotKey({ blockId, filePath })) ?? null
}

export function clearCanvasInteractionSnapshots(filePath?: string) {
  if (!filePath) {
    snapshots.clear()
    return
  }

  for (const key of snapshots.keys()) {
    if (key.startsWith(`${filePath}\u0000`)) {
      snapshots.delete(key)
    }
  }
}

export function createCanvasInteractionEventListener({
  getActiveFilePath,
}: {
  getActiveFilePath: () => string | null
}) {
  return (event: Event) => {
    const filePath = getActiveFilePath()

    if (!filePath || !(event instanceof CustomEvent)) {
      return
    }

    if (!isArtifactStateChange(event.detail)) {
      return
    }

    recordCanvasInteractionChange({
      change: event.detail,
      filePath,
    })
  }
}
