import type { CodexThread } from "../api/api"
import {
  canvasPipelineConfig,
  type CanvasHostPipeline,
} from "./config"
import {
  fetchCodexPipelineThreads,
  submitCodexBlockPrompt,
  submitCodexValidationFixRequest,
} from "./codex"
import {
  fetchExamplePipelineThreads,
  submitExampleBlockPrompt,
  submitExampleValidationFixRequest,
} from "./example"
import type {
  SubmitBlockPromptInput,
  SubmitBlockPromptResult,
  SubmitValidationFixRequestInput,
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

export async function submitValidationFixRequestToPipeline({
  pipeline = canvasPipelineConfig.pipeline,
  ...input
}: SubmitValidationFixRequestInput & {
  pipeline?: CanvasHostPipeline
}): Promise<SubmitBlockPromptResult> {
  if (pipeline === "example") {
    return submitExampleValidationFixRequest(input)
  }

  return submitCodexValidationFixRequest(input)
}
