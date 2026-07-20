import { invoke } from "@tauri-apps/api/core"
import { open } from "@tauri-apps/plugin-dialog"

import type {
  OpenWorkspaceRequest,
  RuntimeReady,
} from "./session"
import type { DesktopPreferences } from "./preferences"

export interface RecentWorkspace {
  name: string
  path: string
  available: boolean
  lastOpenedAt: number
}

export interface DesktopSnapshot {
  preferences: DesktopPreferences
  recents: RecentWorkspace[]
  version: string
  logPath: string
}

export async function selectWorkspaceFolder(): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    title: "Open AHTML project",
  })
  return typeof selected === "string" ? selected : null
}

export const desktopApi = {
  snapshot: () => invoke<DesktopSnapshot>("desktop_snapshot"),
  openWorkspace: (request: OpenWorkspaceRequest) =>
    invoke<RuntimeReady>("open_workspace", { request }),
  closeWorkspace: () => invoke<void>("close_workspace"),
  savePreferences: (preferences: DesktopPreferences) =>
    invoke<void>("save_preferences", { preferences }),
  showLog: () => invoke<void>("show_runtime_log"),
}
