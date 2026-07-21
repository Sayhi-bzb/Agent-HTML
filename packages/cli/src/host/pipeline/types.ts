import type { CanvasDiagnostic } from "../host-contracts"

export type SubmitBlockPromptInput = {
  activeThreadId: string | null
  blockId: string
  filePath: string
  request: string
}

export type SubmitBlockPromptResult = {
  startedNewThread: boolean
  threadId: string
  turnId?: string | null
}

export type SubmitValidationFixRequestInput = {
  activeThreadId: string | null
  filePath: string
  diagnostics: CanvasDiagnostic[]
}
