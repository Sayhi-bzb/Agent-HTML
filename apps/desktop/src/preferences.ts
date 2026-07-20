import type { AgentPipeline } from "./session"

export interface DesktopPreferences {
  language: "en" | "zh-CN"
  theme: "system" | "light" | "dark"
  pipeline: AgentPipeline
  externalEditor: string
  automaticUpdates: boolean
}

export const defaultPreferences: DesktopPreferences = {
  language: "en",
  theme: "system",
  pipeline: "codex",
  externalEditor: "",
  automaticUpdates: false,
}
