import type { CodexThread } from "../api/api"
import { getGuardFixIssues } from "../guard-visibility"
import {
  canvasPipelineConfig,
  type CanvasHostPipeline,
} from "./config"
import {
  fetchCodexPipelineThreads,
  submitCodexBlockPrompt,
  submitCodexGuardFixRequest,
} from "./codex"
import {
  fetchExamplePipelineThreads,
  submitExampleBlockPrompt,
  submitExampleGuardFixRequest,
} from "./example"
import type {
  SubmitBlockPromptInput,
  SubmitBlockPromptResult,
  SubmitGuardFixRequestInput,
} from "./types"
import { createArtifactFilePath } from "../../react-canvas/prompt.mjs"

export { type CanvasHostPipeline, type CanvasPipelineConfig } from "./config"

export function createArtifactFilePathForRequest({
  existingFilePaths,
  request,
}: {
  existingFilePaths: string[]
  request: string
}) {
  return createArtifactFilePath({ existingFilePaths, request })
}

export async function fetchPipelineThreads({
  pipeline = canvasPipelineConfig.pipeline,
}: {
  pipeline?: CanvasHostPipeline
} = {}): Promise<{
  cwd: string
  threads: CodexThread[]
}> {
  if (pipeline === "example") {
    return fetchExamplePipelineThreads()
  }

  return fetchCodexPipelineThreads()
}

export async function submitBlockPromptToPipeline({
  pipeline = canvasPipelineConfig.pipeline,
  ...input
}: SubmitBlockPromptInput & {
  pipeline?: CanvasHostPipeline
}): Promise<SubmitBlockPromptResult> {
  if (pipeline === "example") {
    return submitExampleBlockPrompt(input)
  }

  return submitCodexBlockPrompt(input)
}

export async function submitGuardFixRequestToPipeline({
  pipeline = canvasPipelineConfig.pipeline,
  ...input
}: SubmitGuardFixRequestInput & {
  pipeline?: CanvasHostPipeline
}): Promise<SubmitBlockPromptResult> {
  const fixInput = {
    ...input,
    issues: getGuardFixIssues(input.issues),
  }

  if (pipeline === "example") {
    return submitExampleGuardFixRequest(fixInput)
  }

  return submitCodexGuardFixRequest(fixInput)
}
