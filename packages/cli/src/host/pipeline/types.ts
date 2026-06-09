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
