import { invoke, isTauri } from "@tauri-apps/api/core"

import type {
  CodexConnectionSettings,
  CodexHostProcessStatus,
  CodexRpcRequestResult,
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
  runCommand: (
    command: CodexHostCommand,
    settings: CodexConnectionSettings
  ) => Promise<CodexHostProcessStatus>
  saveSettings: (
    settings: CodexConnectionSettings
  ) => Promise<CodexConnectionSettings>
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

  runCommand(command, settings) {
    return invoke<CodexHostProcessStatus>(command, { settings })
  },

  saveSettings(settings) {
    return invoke<CodexConnectionSettings>("codex_host_settings_save", {
      settings,
    })
  },
}
