import type {
  AgentShellMessage,
  LogSnapshot,
  SessionDetail,
  SourceValidationSnapshot,
} from "@/lib/types"

export type CommandState = {
  loading: boolean
  saving: boolean
  validating: boolean
  building: boolean
  inspecting: boolean
  sending: boolean
  drafting: boolean
  checking: boolean
  error?: string
}

export type HydratedSessionState = {
  session: SessionDetail
  chat: AgentShellMessage[]
  logs: LogSnapshot
  previewHtml?: string
}

export type PanelLayoutState = {
  sessions: number
  workbench: number
  shell: number
}

export type ShellChromeState = {
  leftPanelVisible: boolean
  rightPanelVisible: boolean
}

export type OpenSessionTab = {
  sessionId: string
}

type SourceState = {
  draft: string
  validation?: SourceValidationSnapshot
}

export const initialCommandState: CommandState = {
  loading: true,
  saving: false,
  validating: false,
  building: false,
  inspecting: false,
  sending: false,
  drafting: false,
  checking: false,
}
