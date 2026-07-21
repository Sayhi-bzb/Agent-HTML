import type { CodexThread } from "../api/api"
import type {
  SubmitBlockPromptInput,
  SubmitBlockPromptResult,
  SubmitValidationFixRequestInput,
} from "./types"

export async function fetchExamplePipelineThreads(): Promise<{
  cwd: string
  threads: CodexThread[]
}> {
  return {
    cwd: "agent-html example",
    threads: [
      {
        id: "example-thread",
        name: "Example session",
        preview: "Local preview pipeline",
        status: null,
      },
    ],
  }
}

export async function submitExampleBlockPrompt({
  activeThreadId,
}: SubmitBlockPromptInput): Promise<SubmitBlockPromptResult> {
  return {
    startedNewThread: !activeThreadId,
    threadId: activeThreadId ?? "example-thread",
    turnId: "example-turn",
  }
}

export async function submitExampleValidationFixRequest({
  activeThreadId,
}: SubmitValidationFixRequestInput): Promise<SubmitBlockPromptResult> {
  return {
    startedNewThread: !activeThreadId,
    threadId: activeThreadId ?? "example-thread",
    turnId: "example-validation-fix-turn",
  }
}
