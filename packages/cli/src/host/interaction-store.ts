import type { ArtifactStateChange } from "@agent-html/react"

export const canvasInteractionEventName = "agent-html:state-change"

export type CanvasInteractionCompactChange = {
  component: string
  controlId: string
  from: unknown
  kind: string
  semantic?: string
  to: unknown
}

export type CanvasInteractionCompactAction = {
  controlId: string
  semantic?: string
  value: unknown
}

export type CanvasInteractionSnapshot = {
  blockId: string
  compactedActions: CanvasInteractionCompactAction[]
  compactedChanges: CanvasInteractionCompactChange[]
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
    compactedActions: [],
    compactedChanges: [],
    currentState: {},
    recentChanges: [],
  }
  const compactedChanges =
    change.kind === "action"
      ? previous.compactedChanges
      : compactStateChanges({ change, previous })
  const compactedActions =
    change.kind === "action"
      ? [
          ...previous.compactedActions,
          {
            controlId: change.controlId,
            semantic: change.semantic,
            value: change.after,
          },
        ]
      : previous.compactedActions

  snapshots.set(key, {
    blockId: change.blockId,
    compactedActions,
    compactedChanges,
    currentState: {
      ...previous.currentState,
      [change.controlId]: change.after,
    },
    recentChanges: [...previous.recentChanges, change].slice(-maxRecentChanges),
  })
}

function compactStateChanges({
  change,
  previous,
}: {
  change: ArtifactStateChange
  previous: CanvasInteractionSnapshot
}) {
  const previousCompactedChange = previous.compactedChanges.find(
    (compactedChange) => compactedChange.controlId === change.controlId
  )

  return [
    ...previous.compactedChanges.filter(
      (compactedChange) => compactedChange.controlId !== change.controlId
    ),
    {
      component: change.component,
      controlId: change.controlId,
      from: previousCompactedChange
        ? previousCompactedChange.from
        : change.before,
      kind: change.kind,
      semantic: change.semantic,
      to: change.after,
    },
  ]
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
