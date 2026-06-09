export type CanvasHostPipeline = "codex" | "example"

export type CanvasPipelineConfig = {
  contentSource: "artifacts"
  pipeline: CanvasHostPipeline
}

const defaultPipelineConfig: CanvasPipelineConfig = {
  contentSource: "artifacts",
  pipeline: "codex",
}

function readPipelineConfig(): CanvasPipelineConfig {
  const config = globalThis.__AGENT_HTML_HOST_CONFIG__

  if (!config || typeof config !== "object") {
    return defaultPipelineConfig
  }

  return {
    contentSource: "artifacts",
    pipeline: config.pipeline === "example" ? "example" : "codex",
  }
}

export const canvasPipelineConfig = readPipelineConfig()

declare global {
  // eslint-disable-next-line no-var
  var __AGENT_HTML_HOST_CONFIG__: Partial<CanvasPipelineConfig> | undefined
}
