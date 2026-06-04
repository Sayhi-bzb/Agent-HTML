export type BlockPromptInteractionSnapshot = {
  blockId: string
  currentState: Record<string, unknown>
  recentChanges: Array<{
    after: unknown
    before: unknown
    blockId?: string
    component: string
    controlId: string
    kind: string
    label?: string
    semantic?: string
    timestamp: number
  }>
}

export type CompactBlockPromptInteraction = {
  finalState: Record<string, unknown>
  diff: Array<{
    controlId: string
    from: unknown
    semantic?: string
    to: unknown
  }>
}

export type BlockPromptPayload = {
  blockPath: string
  filePath: string
  interactionSnapshot?: BlockPromptInteractionSnapshot | null
  request: string
  selectedSource: string | null
  targetStatus: "selected_block" | "missing_block"
}

export function compactInteractionSnapshot(
  snapshot: BlockPromptInteractionSnapshot
): CompactBlockPromptInteraction

export function formatBlockPrompt(payload: BlockPromptPayload): string
