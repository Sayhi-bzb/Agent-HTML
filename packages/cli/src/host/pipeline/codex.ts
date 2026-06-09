import {
  fetchBlockImplementation,
  fetchCodexThreads,
  startCodexTurn,
  type CodexThread,
} from "../api/api"
import { getCanvasInteractionSnapshot } from "../interaction/interaction-store"
import { publishCanvasPromptDebug } from "../prompt/prompt-debug"
import { formatBlockPrompt } from "../../react-canvas/prompt.mjs"
import type {
  SubmitBlockPromptInput,
  SubmitBlockPromptResult,
} from "./types"

export async function fetchCodexPipelineThreads(): Promise<{
  cwd: string
  threads: CodexThread[]
}> {
  return fetchCodexThreads()
}

export async function submitCodexBlockPrompt({
  activeThreadId,
  blockId,
  filePath,
  request,
}: SubmitBlockPromptInput): Promise<SubmitBlockPromptResult> {
  const blockImplementation = await fetchBlockImplementation({
    blockId,
    filePath,
  })
  const formatted = formatBlockPrompt({
    blockId,
    filePath,
    implementationPath: blockImplementation.implementationPath ?? undefined,
    interactionSnapshot: getCanvasInteractionSnapshot({
      blockId,
      filePath,
    }),
    request,
  })

  publishCanvasPromptDebug(formatted)
  return startCodexTurn({
    prompt: formatted,
    threadId: activeThreadId,
  })
}
