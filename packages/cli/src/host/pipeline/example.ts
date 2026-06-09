import type { CodexThread } from "../api/api"
import type {
  SubmitBlockPromptInput,
  SubmitBlockPromptResult,
  SubmitCreateArtifactInput,
  SubmitCreateArtifactResult,
  SubmitGuardFixRequestInput,
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

export async function submitExampleCreateArtifact(
  _input: SubmitCreateArtifactInput
): Promise<SubmitCreateArtifactResult> {
  throw new Error("Artifact creation is disabled in the example pipeline.")
}

export async function submitExampleGuardFixRequest({
  activeThreadId,
}: SubmitGuardFixRequestInput): Promise<SubmitBlockPromptResult> {
  return {
    startedNewThread: !activeThreadId,
    threadId: activeThreadId ?? "example-thread",
    turnId: "example-guard-fix-turn",
  }
}
