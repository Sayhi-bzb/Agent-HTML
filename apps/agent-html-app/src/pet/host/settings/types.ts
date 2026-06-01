import type {
  CodexConnectionSettings,
  CodexConnectionStatus,
  CodexHostHealth,
  CodexRuntimeStatus,
} from "@/app/codex/connection"
import type { WorkspaceRootStatus } from "@/app/codex/connection/types"
import type { CodexSettingsMutation } from "@/app/codex/connection/codex-settings-service"
import type { AgentsInstructionsSource } from "@/app/pet/host/agents-instructions-loader"

export const settingsViews = [
  "AGENTS.md",
  "MCP",
  "Skills",
  "Plugins",
  "Runtime",
  "Connection",
] as const

export type SettingsView = (typeof settingsViews)[number]

export type PetSettingsView = SettingsView

export type PetSettingsSurfaceSnapshot = {
  activeView: SettingsView
  agents: {
    draft: string
    error: string | null
    isDirty: boolean
    isLoading: boolean
    isSaving: boolean
    path: string | null
    source: AgentsInstructionsSource | null
    status: "idle" | "saved"
  }
  codex: {
    canManageHost: boolean
    draftSettings: CodexConnectionSettings
    draftWorkspaceRootPath: string
    health: CodexHostHealth | null
    isBusy: boolean
    isLoaded: boolean
    lastError: string | null
    mutationError: string | null
    pendingMutation: CodexSettingsMutation | null
    runtimeStatus: CodexRuntimeStatus
    status: CodexConnectionStatus
    workspaceRootNotice: string | null
    workspaceRootStatus: WorkspaceRootStatus | null
  }
}

export type PetSettingsAction =
  | { type: "close" }
  | { type: "cancel-mutation" }
  | { type: "confirm-mutation" }
  | { type: "refresh-runtime-status" }
  | { type: "reload-agents-instructions" }
  | { mutation: CodexSettingsMutation; type: "queue-mutation" }
  | { draft: string; type: "set-agents-draft" }
  | { type: "save-agents-instructions" }
  | { command: string; type: "set-codex-command" }
  | { path: string; type: "set-workspace-root-path" }
  | { type: "save-codex-settings" }
  | { type: "save-workspace-root" }
  | { type: "restart-codex" }
  | { type: "stop-codex" }
  | { type: "test-codex" }
  | { type: "set-active-view"; view: SettingsView }

export type PetSettingsDispatch = (action: PetSettingsAction) => void

export type PetSettingsBridge = {
  dispatch: PetSettingsDispatch
  snapshot: PetSettingsSurfaceSnapshot
}
