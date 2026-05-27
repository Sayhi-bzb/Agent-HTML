import * as React from "react"

import type {
  AgentEventScope,
  BlockMarkerState,
  BlockOutcomeCard,
  DocumentOutcome,
  DrawerEvent,
  PetActivity,
  ScenarioDefinition,
  ScenarioRawEvent,
  ScenarioSurfaceState,
} from "@/app/gallery/agent-lab/types"

const PET_SETTLE_DELAY_MS = 1800

function scopeLabel(scope?: AgentEventScope) {
  if (!scope) {
    return "Thread"
  }

  if (scope.type === "block") {
    return scope.blockPath
  }

  if (scope.type === "document") {
    return "Document"
  }

  if (scope.type === "workspace") {
    return "Workspace"
  }

  return "System"
}

function formatTimeLabel(at: number) {
  return `${(at / 1000).toFixed(1)}s`
}

function outcomeDetail(outcome: BlockOutcomeCard | DocumentOutcome) {
  if (outcome.kind === "document") {
    return outcome.summary
  }

  if (outcome.kind === "change") {
    return outcome.summary
  }

  if (outcome.kind === "explanation") {
    return outcome.body
  }

  if (outcome.kind === "suggestion") {
    return outcome.summary
  }

  return outcome.kind === "blocked" ? outcome.reason : outcome.reason
}

function drawerEventFromRawEvent(event: ScenarioRawEvent, index: number): DrawerEvent {
  switch (event.type) {
    case "turn.started":
      return {
        detail: event.prompt,
        id: `event:${index}:${event.type}`,
        scopeLabel: scopeLabel(event.scope),
        timeLabel: formatTimeLabel(event.at),
        title: "Intent received",
      }
    case "pet.thinking":
      return {
        detail: event.label,
        id: `event:${index}:${event.type}`,
        scopeLabel: scopeLabel(event.scope),
        timeLabel: formatTimeLabel(event.at),
        title: "Status update",
      }
    case "message.delta":
      return {
        detail: event.chunk,
        id: `event:${index}:${event.type}`,
        scopeLabel: scopeLabel(event.scope),
        timeLabel: formatTimeLabel(event.at),
        title: "Agent response",
      }
    case "tool.started":
      return {
        detail: event.label,
        id: `event:${index}:${event.type}`,
        scopeLabel: scopeLabel(event.scope),
        timeLabel: formatTimeLabel(event.at),
        title: "Tool use",
      }
    case "approval.requested":
      return {
        detail: event.reason,
        id: `event:${index}:${event.type}`,
        scopeLabel: scopeLabel(event.scope),
        timeLabel: formatTimeLabel(event.at),
        title: "Approval needed",
      }
    case "outcome.recorded":
      return {
        detail: outcomeDetail(event.outcome),
        id: `event:${index}:${event.type}`,
        scopeLabel:
          event.outcome.kind === "document"
            ? "Document"
            : event.outcome.blockPath,
        timeLabel: formatTimeLabel(event.at),
        title: "Outcome recorded",
      }
    case "turn.completed":
      return {
        detail: event.summary,
        id: `event:${index}:${event.type}`,
        scopeLabel: scopeLabel(event.scope),
        timeLabel: formatTimeLabel(event.at),
        title: "Turn completed",
      }
    case "turn.failed":
      return {
        detail: event.message,
        id: `event:${index}:${event.type}`,
        scopeLabel: scopeLabel(event.scope),
        timeLabel: formatTimeLabel(event.at),
        title: "Turn failed",
      }
    case "turn.cancelled":
      return {
        detail: event.reason,
        id: `event:${index}:${event.type}`,
        scopeLabel: "Thread",
        timeLabel: formatTimeLabel(event.at),
        title: "Turn cancelled",
      }
  }
}

function withBlockMarker(
  blockMarkers: Record<string, BlockMarkerState>,
  blockPath: string,
  next: Partial<BlockMarkerState>
) {
  const current = blockMarkers[blockPath] ?? { cards: [], status: "idle" as const }

  return {
    ...blockMarkers,
    [blockPath]: {
      cards: next.cards ?? current.cards,
      status: next.status ?? current.status,
    },
  }
}

export function createInitialScenarioSurfaceState(): ScenarioSurfaceState {
  return {
    blockMarkers: {},
    documentOutcomes: [],
    drawerEvents: [],
    petActivity: { kind: "idle" },
    prompt: null,
  }
}

export function reduceScenarioEvent(
  currentState: ScenarioSurfaceState,
  event: ScenarioRawEvent,
  index: number
): ScenarioSurfaceState {
  const drawerEvent = drawerEventFromRawEvent(event, index)
  let nextState: ScenarioSurfaceState = {
    ...currentState,
    drawerEvents: [...currentState.drawerEvents, drawerEvent],
  }

  switch (event.type) {
    case "turn.started": {
      nextState = {
        ...nextState,
        petActivity: { kind: "thinking", label: "Received request", scope: event.scope },
        prompt: event.prompt,
      }

      if (event.scope?.type === "block") {
        nextState = {
          ...nextState,
          blockMarkers: withBlockMarker(nextState.blockMarkers, event.scope.blockPath, {
            status: "pending",
          }),
        }
      }
      return nextState
    }
    case "pet.thinking":
      return {
        ...nextState,
        petActivity: { kind: "thinking", label: event.label, scope: event.scope },
      }
    case "message.delta": {
      const previousText =
        nextState.petActivity.kind === "speaking" ? nextState.petActivity.text : ""
      return {
        ...nextState,
        petActivity: {
          kind: "speaking",
          scope: event.scope,
          text: `${previousText}${event.chunk}`,
        },
      }
    }
    case "tool.started":
      return {
        ...nextState,
        petActivity: { kind: "editing", label: event.label, scope: event.scope },
      }
    case "approval.requested": {
      let blockMarkers = nextState.blockMarkers
      if (event.scope?.type === "block") {
        blockMarkers = withBlockMarker(blockMarkers, event.scope.blockPath, {
          status: "blocked",
        })
      }

      return {
        ...nextState,
        blockMarkers,
        petActivity: {
          kind: "waiting",
          actionLabel: event.actionLabel,
          reason: event.reason,
          scope: event.scope,
        },
      }
    }
    case "outcome.recorded":
      if (event.outcome.kind === "document") {
        return {
          ...nextState,
          documentOutcomes: [...nextState.documentOutcomes, event.outcome],
        }
      }

      return {
        ...nextState,
        blockMarkers: withBlockMarker(nextState.blockMarkers, event.outcome.blockPath, {
          cards: [
            ...(nextState.blockMarkers[event.outcome.blockPath]?.cards ?? []),
            event.outcome,
          ],
          status:
            event.outcome.kind === "blocked"
              ? "blocked"
              : event.outcome.kind === "failure"
                ? "failed"
                : "done",
        }),
      }
    case "turn.completed":
      return {
        ...nextState,
        petActivity: { kind: "review", summary: event.summary, scope: event.scope },
      }
    case "turn.failed":
      return {
        ...nextState,
        petActivity: { kind: "failed", message: event.message, scope: event.scope },
      }
    case "turn.cancelled":
      return {
        ...nextState,
        petActivity: { kind: "idle" },
      }
  }
}

export function buildScenarioSurfaceState(
  events: readonly ScenarioRawEvent[],
  appliedCount: number
) {
  return events
    .slice(0, appliedCount)
    .reduce(
      (state, event, index) => reduceScenarioEvent(state, event, index),
      createInitialScenarioSurfaceState()
    )
}

export function useScenarioPlayback(scenario: ScenarioDefinition) {
  const [appliedCount, setAppliedCount] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [hasSettledPet, setHasSettledPet] = React.useState(false)

  React.useEffect(() => {
    setAppliedCount(0)
    setHasSettledPet(false)
    setIsPlaying(false)
  }, [scenario.id])

  const surfaceState = React.useMemo(() => {
    const nextState = buildScenarioSurfaceState(scenario.events, appliedCount)

    if (
      hasSettledPet &&
      (nextState.petActivity.kind === "review" ||
        nextState.petActivity.kind === "failed")
    ) {
      return {
        ...nextState,
        petActivity: { kind: "idle" } as PetActivity,
      }
    }

    return nextState
  }, [appliedCount, hasSettledPet, scenario.events])

  React.useEffect(() => {
    if (!isPlaying || appliedCount >= scenario.events.length) {
      if (appliedCount >= scenario.events.length) {
        setIsPlaying(false)
      }
      return
    }

    const nextEvent = scenario.events[appliedCount]
    const previousEvent = appliedCount > 0 ? scenario.events[appliedCount - 1] : null
    const delay = Math.max(
      160,
      previousEvent ? nextEvent.at - previousEvent.at : nextEvent.at + 120
    )

    const timeout = window.setTimeout(() => {
      setHasSettledPet(false)
      setAppliedCount((current) => Math.min(current + 1, scenario.events.length))
    }, delay)

    return () => window.clearTimeout(timeout)
  }, [appliedCount, isPlaying, scenario.events])

  React.useEffect(() => {
    const isTurnSettled =
      appliedCount === scenario.events.length &&
      (surfaceState.petActivity.kind === "review" ||
        surfaceState.petActivity.kind === "failed")

    if (!isTurnSettled) {
      return
    }

    const timeout = window.setTimeout(() => {
      setHasSettledPet(true)
    }, PET_SETTLE_DELAY_MS)

    return () => window.clearTimeout(timeout)
  }, [appliedCount, scenario.events.length, surfaceState.petActivity])

  const reset = React.useCallback(() => {
    setAppliedCount(0)
    setHasSettledPet(false)
    setIsPlaying(false)
  }, [])

  const step = React.useCallback(() => {
    setIsPlaying(false)
    setHasSettledPet(false)
    setAppliedCount((current) => Math.min(current + 1, scenario.events.length))
  }, [scenario.events.length])

  const play = React.useCallback(() => {
    if (appliedCount >= scenario.events.length) {
      setAppliedCount(0)
      setHasSettledPet(false)
    }
    setIsPlaying(true)
  }, [appliedCount, scenario.events.length])

  const pause = React.useCallback(() => {
    setIsPlaying(false)
  }, [])

  return {
    appliedCount,
    isDrawerOpen,
    isPlaying,
    openDrawer: () => setIsDrawerOpen(true),
    pause,
    play,
    reset,
    scenarioLength: scenario.events.length,
    setIsDrawerOpen,
    step,
    surfaceState,
  }
}
