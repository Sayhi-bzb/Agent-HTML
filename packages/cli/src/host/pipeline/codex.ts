import {
  fetchBlockImplementation,
  fetchCodexThreads,
  fetchCodexTranscript,
  startCodexTurn,
  type CodexTranscript,
  type CodexThread,
} from "../api/api"
import { getCanvasInteractionSnapshot } from "../interaction/interaction-store"
import { publishCanvasPromptDebug } from "../prompt/prompt-debug"
import { formatBlockPrompt } from "../../react-canvas/prompt.mjs"
import type {
  SubmitBlockPromptInput,
  SubmitBlockPromptResult,
  SubmitValidationFixRequestInput,
} from "./types"

export async function fetchCodexPipelineThreads(): Promise<{
  cwd: string
  threads: CodexThread[]
}> {
  return fetchCodexThreads()
}

export function fetchCodexPipelineTranscript(
  threadId: string
): Promise<CodexTranscript> {
  return fetchCodexTranscript(threadId)
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

function formatValidationFixPrompt({
  filePath,
  diagnostics,
}: Omit<SubmitValidationFixRequestInput, "activeThreadId">) {
  const lines = [
    "---",
    "task: fix-canvas-validation-errors",
    `filePath: ${filePath}`,
    "---",
    "",
    "Fix the Canvas validation errors listed below.",
    "",
    "Constraints:",
    "- Edit only the affected Canvas artifact source.",
    "- Preserve artifact intent and Block ids unless the issue requires changing them.",
    "- Do not downgrade or ignore validation errors.",
    "",
    "Validation errors:",
  ]

  for (const diagnostic of diagnostics) {
    lines.push(
      `- ${diagnostic.code} ${diagnostic.category} line ${diagnostic.line}:${diagnostic.column}: ${diagnostic.message}`
    )

    if (diagnostic.suggestion) {
      lines.push(`  Suggestion: ${diagnostic.suggestion}`)
    }
  }

  return lines.join("\n")
}

export async function submitCodexValidationFixRequest({
  activeThreadId,
  filePath,
  diagnostics,
}: SubmitValidationFixRequestInput): Promise<SubmitBlockPromptResult> {
  const prompt = formatValidationFixPrompt({
    filePath,
    diagnostics,
  })

  publishCanvasPromptDebug(prompt)
  return startCodexTurn({
    prompt,
    threadId: activeThreadId,
  })
}
