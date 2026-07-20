import type { AgentPipeline } from "./session"

export interface DesktopPreferences {
  language: "en" | "zh-CN"
  pipeline: AgentPipeline
  externalEditor: string
  automaticUpdates: boolean
}

export const defaultPreferences: DesktopPreferences = {
  language: "en",
  pipeline: "codex",
  externalEditor: "",
  automaticUpdates: false,
}
