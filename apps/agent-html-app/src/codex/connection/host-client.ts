import { invoke, isTauri } from "@tauri-apps/api/core"

import type {
  CodexConnectionSettings,
  CodexHostProcessStatus,
  CodexRpcResponseInput,
  CodexRpcRequestResult,
  WorkspaceRootSettings,
  WorkspaceRootStatus,
} from "./types"

export type CodexHostCommand =
  | "codex_host_health"
  | "codex_host_restart"
  | "codex_host_start"
  | "codex_host_stop"

export type CodexRpcRequestInput = {
  method: string
  params: unknown
  settings: CodexConnectionSettings
}

export type CodexHostClient = {
  canManageHost: () => boolean
  loadSettings: () => Promise<CodexConnectionSettings>
  request: (input: CodexRpcRequestInput) => Promise<unknown>
  respond: (
    input: CodexRpcResponseInput & { settings: CodexConnectionSettings }
  ) => Promise<void>
  runCommand: (
    command: CodexHostCommand,
    settings: CodexConnectionSettings
  ) => Promise<CodexHostProcessStatus>
  saveSettings: (
    settings: CodexConnectionSettings
  ) => Promise<CodexConnectionSettings>
  loadWorkspaceRootSettings: () => Promise<WorkspaceRootStatus>
  saveWorkspaceRootSettings: (
    settings: WorkspaceRootSettings
  ) => Promise<WorkspaceRootStatus>
}

export const codexHostClient: CodexHostClient = {
  canManageHost() {
    return isTauri()
  },

  loadSettings() {
    return invoke<CodexConnectionSettings>("codex_host_settings_load")
  },

  async request({ method, params, settings }) {
    const response = await invoke<CodexRpcRequestResult>("codex_rpc_request", {
      input: {
        method,
        params,
      },
      settings,
    })

    return response.result
  },

  respond({ requestId, result, settings }) {
    return invoke<void>("codex_rpc_respond", {
      input: {
        requestId,
        result,
      },
      settings,
    })
  },

  runCommand(command, settings) {
    return invoke<CodexHostProcessStatus>(command, { settings })
  },

  saveSettings(settings) {
    return invoke<CodexConnectionSettings>("codex_host_settings_save", {
      settings,
    })
  },

  loadWorkspaceRootSettings() {
    return invoke<WorkspaceRootStatus>("workspace_root_settings_load")
  },

  saveWorkspaceRootSettings(settings) {
    return invoke<WorkspaceRootStatus>("workspace_root_settings_save", {
      settings,
    })
  },
}
