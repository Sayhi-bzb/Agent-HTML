export type AgentEventScope =
  | { type: "block"; blockPath: string }
  | { type: "document"; documentId: string }
  | { type: "workspace" }
  | { type: "system" }

export type PetActivity =
  | { kind: "idle" }
  | { kind: "thinking"; label?: string; scope?: AgentEventScope }
  | { kind: "speaking"; text: string; scope?: AgentEventScope }
  | { kind: "editing"; label: string; scope?: AgentEventScope }
  | {
      kind: "waiting"
      reason: string
      actionLabel?: string
      scope?: AgentEventScope
    }
  | { kind: "review"; summary: string; scope?: AgentEventScope }
  | { kind: "failed"; message: string; scope?: AgentEventScope }

export type BlockOutcomeCard =
  | {
      kind: "explanation"
      blockPath: string
      body: string
      title?: string
    }
  | {
      kind: "change"
      blockPath: string
      summary: string
      changedFiles: number
      title?: string
    }
  | {
      kind: "suggestion"
      blockPath: string
      summary: string
      title?: string
    }
  | {
      kind: "blocked"
      blockPath: string
      reason: string
      title?: string
    }
  | {
      kind: "failure"
      blockPath: string
      reason: string
      title?: string
    }

export type DocumentOutcome = {
  kind: "document"
  documentId: string
  summary: string
}

export type ScenarioRawEvent =
  | {
      at: number
      type: "turn.started"
      prompt: string
      scope?: AgentEventScope
    }
  | {
      at: number
      type: "pet.thinking"
      label: string
      scope?: AgentEventScope
    }
  | {
      at: number
      type: "message.delta"
      chunk: string
      scope?: AgentEventScope
    }
  | {
      at: number
      type: "tool.started"
      label: string
      scope?: AgentEventScope
    }
  | {
      at: number
      type: "approval.requested"
      reason: string
      actionLabel: string
      scope?: AgentEventScope
    }
  | {
      at: number
      type: "outcome.recorded"
      outcome: BlockOutcomeCard | DocumentOutcome
    }
  | {
      at: number
      type: "turn.completed"
      summary: string
      scope?: AgentEventScope
    }
  | {
      at: number
      type: "turn.failed"
      message: string
      scope?: AgentEventScope
    }
  | {
      at: number
      type: "turn.cancelled"
      reason: string
    }

export type ScenarioDefinition = {
  description: string
  events: readonly ScenarioRawEvent[]
  id: string
  label: string
  prompt: string
}

export type DrawerEvent = {
  detail: string
  id: string
  scopeLabel: string
  timeLabel: string
  title: string
}

export type BlockMarkerStatus =
  | "idle"
  | "pending"
  | "done"
  | "blocked"
  | "failed"

export type BlockMarkerState = {
  cards: BlockOutcomeCard[]
  status: BlockMarkerStatus
}

export type ScenarioSurfaceState = {
  blockMarkers: Record<string, BlockMarkerState>
  documentOutcomes: DocumentOutcome[]
  drawerEvents: DrawerEvent[]
  petActivity: PetActivity
  prompt: string | null
}
