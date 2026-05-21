import { invoke } from "@tauri-apps/api/core"
import { getCurrentWindow } from "@tauri-apps/api/window"

import type {
  BuildRunSummary,
  InspectSnapshot,
  LogSnapshot,
  SessionDetail,
  SessionSummary,
  SourceValidationSnapshot,
} from "./types"

export async function listSessions(): Promise<SessionSummary[]> {
  return invoke("list_sessions")
}

export async function createSession(name: string): Promise<SessionDetail> {
  return invoke("create_session", { name })
}

export async function openSession(sessionId: string): Promise<SessionDetail> {
  return invoke("open_session", { sessionId })
}

export async function deleteSession(sessionId: string): Promise<void> {
  return invoke("delete_session", { sessionId })
}

export async function setSessionView(
  sessionId: string,
  view: SessionDetail["currentView"],
): Promise<SessionDetail> {
  return invoke("set_session_view", { sessionId, view })
}

export async function renameSession(sessionId: string, name: string): Promise<SessionDetail> {
  return invoke("rename_session", { sessionId, name })
}

export async function saveSource(sessionId: string, source: string): Promise<SessionDetail> {
  return invoke("save_source", { sessionId, source })
}

export async function runBuild(sessionId: string): Promise<BuildRunSummary> {
  return invoke("run_build", { sessionId })
}

export async function runInspect(sessionId: string): Promise<InspectSnapshot> {
  return invoke("run_inspect", { sessionId })
}

export async function validateSource(
  sessionId: string,
  source: string,
): Promise<SourceValidationSnapshot> {
  return invoke("validate_source", { sessionId, source })
}

export async function readPreviewHtml(sessionId: string): Promise<string> {
  return invoke("read_preview_html", { sessionId })
}

export async function readLogs(sessionId: string): Promise<LogSnapshot> {
  return invoke("read_logs", { sessionId })
}

export function isTauriRuntime(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  return "__TAURI_INTERNALS__" in (window as Window & { __TAURI_INTERNALS__?: unknown })
}

export async function minimizeWindow(): Promise<void> {
  if (!isTauriRuntime()) {
    return
  }

  await getCurrentWindow().minimize()
}

export async function toggleMaximizeWindow(): Promise<void> {
  if (!isTauriRuntime()) {
    return
  }

  const currentWindow = getCurrentWindow()
  if (await currentWindow.isMaximized()) {
    await currentWindow.unmaximize()
    return
  }

  await currentWindow.maximize()
}

export async function closeWindow(): Promise<void> {
  if (!isTauriRuntime()) {
    return
  }

  await getCurrentWindow().close()
}
