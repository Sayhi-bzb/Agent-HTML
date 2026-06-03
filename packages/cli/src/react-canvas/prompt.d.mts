export type BlockPromptPayload = {
  blockPath: string
  filePath: string
  request: string
  selectedSource: string | null
  targetStatus: "selected_block" | "missing_block"
}

export function formatBlockPrompt(payload: BlockPromptPayload): string
