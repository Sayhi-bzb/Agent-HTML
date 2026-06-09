import type { CodexThread } from "../api/api"
import {
  canvasPipelineConfig,
  type CanvasHostPipeline,
} from "./config"
import {
  fetchCodexPipelineThreads,
  submitCodexBlockPrompt,
} from "./codex"
import {
  fetchExamplePipelineThreads,
  submitExampleBlockPrompt,
} from "./example"
import type {
  SubmitBlockPromptInput,
  SubmitBlockPromptResult,
} from "./types"

export {
  canvasPipelineConfig,
  type CanvasHostPipeline,
  type CanvasPipelineConfig,
} from "./config"

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
