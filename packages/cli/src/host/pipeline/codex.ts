import {
  fetchBlockImplementation,
  fetchCodexThreads,
  startCodexTurn,
  type CodexThread,
} from "../api/api"
import { getCanvasInteractionSnapshot } from "../interaction/interaction-store"
import { publishCanvasPromptDebug } from "../prompt/prompt-debug"
import {
  formatBlockPrompt,
  formatCreateArtifactPrompt,
} from "../../react-canvas/prompt.mjs"
import type {
  SubmitBlockPromptInput,
  SubmitBlockPromptResult,
  SubmitCreateArtifactInput,
  SubmitCreateArtifactResult,
  SubmitGuardFixRequestInput,
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

export async function submitCodexCreateArtifact({
  activeThreadId,
  filePath,
  request,
}: SubmitCreateArtifactInput): Promise<SubmitCreateArtifactResult> {
  const prompt = formatCreateArtifactPrompt({
    filePath,
    request,
  })

  publishCanvasPromptDebug(prompt)
  const turn = await startCodexTurn({
    prompt,
    threadId: activeThreadId,
  })

  return {
    ...turn,
    filePath,
  }
}

export function formatGuardFixPrompt({
  filePath,
  issues,
}: Omit<SubmitGuardFixRequestInput, "activeThreadId">) {
  const lines = [
    "---",
    "task: fix-canvas-guard-errors",
    `filePath: ${filePath}`,
    "---",
    "",
    "Fix the Canvas guard errors listed below.",
    "",
    "Constraints:",
    "- Edit only the affected Canvas artifact source.",
    "- Preserve artifact intent and Block ids unless the issue requires changing them.",
    "- Do not downgrade or ignore guard errors.",
    "",
    "Guard errors:",
  ]

  for (const issue of issues) {
    lines.push(
      `- ${issue.guardScope ?? "guard"}${issue.line ? ` line ${issue.line}` : ""}: ${issue.message}`
    )

    if (issue.suggestion) {
      lines.push(`  Suggestion: ${issue.suggestion}`)
    }
  }

  return lines.join("\n")
}

export async function submitCodexGuardFixRequest({
  activeThreadId,
  filePath,
  issues,
}: SubmitGuardFixRequestInput): Promise<SubmitBlockPromptResult> {
  const prompt = formatGuardFixPrompt({
    filePath,
    issues,
  })

  publishCanvasPromptDebug(prompt)
  return startCodexTurn({
    prompt,
    threadId: activeThreadId,
  })
}
