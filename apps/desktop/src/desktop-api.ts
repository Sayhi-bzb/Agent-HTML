import { invoke } from "@tauri-apps/api/core"
import { open } from "@tauri-apps/plugin-dialog"

import type { OpenWorkspaceRequest, RuntimeReady } from "./session"
import type { DesktopPreferences } from "./preferences"
import type { CanvasThemeSnapshot } from "../../../packages/cli/src/host/theme/theme-sync-contract"
import type { WorkspaceTabSession } from "../../../packages/cli/src/host/navigation/workspace-tabs"

export interface RecentWorkspace {
  name: string
  path: string
  available: boolean
  lastOpenedAt: number
}

export interface DesktopSnapshot {
  canvasTheme: CanvasThemeSnapshot | null
  preferences: DesktopPreferences
  recents: RecentWorkspace[]
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
  loadWorkspaceTabSession: (root: string) =>
    invoke<WorkspaceTabSession | null>("load_workspace_tab_session", { root }),
  saveCanvasTheme: (canvasTheme: CanvasThemeSnapshot) =>
    invoke<void>("save_canvas_theme", { canvasTheme }),
  saveWorkspaceTabSession: (root: string, session: WorkspaceTabSession) =>
    invoke<void>("save_workspace_tab_session", { root, session }),
}
