export type BlockPromptInteractionSnapshot = {
  blockId: string
  compactedActions?: Array<{
    controlId: string
    semantic?: string
    value: unknown
  }>
  compactedChanges?: Array<{
    component?: string
    controlId: string
    from: unknown
    kind?: string
    semantic?: string
    to: unknown
  }>
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
  actions: Array<{
    controlId: string
    semantic?: string
    value: unknown
  }>
  diff: Array<{
    controlId: string
    from: unknown
    semantic?: string
    to: unknown
  }>
  finalState: Record<string, unknown>
}

export type BlockPromptPayload = {
  blockPath: string
  filePath: string
  implementationPath?: string
  interactionSnapshot?: BlockPromptInteractionSnapshot | null
  request: string
}

export function compactInteractionSnapshot(
  snapshot: BlockPromptInteractionSnapshot
): CompactBlockPromptInteraction

export function formatBlockPrompt(payload: BlockPromptPayload): string
