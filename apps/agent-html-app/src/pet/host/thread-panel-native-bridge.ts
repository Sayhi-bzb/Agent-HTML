import { isTauri } from "@tauri-apps/api/core"

import type { AgentHtmlAgentPromptSubmitInput } from "@/agent-html"
import type { ThreadPanelAction, ThreadPanelSurfaceSnapshot } from "@/app/pet/host/pet-thread-panel-content"
import type { ThreadTranscriptState } from "@/app/workspace/thread-transcript"

export const THREAD_PANEL_WINDOW_LABEL = "thread-panel"
export const THREAD_PANEL_SNAPSHOT_EVENT = "thread-panel://snapshot"
export const THREAD_PANEL_ACTION_EVENT = "thread-panel://action"

export type ThreadPanelNativeSnapshot = {
  composer: {
    draft: string
  }
  surface: ThreadPanelSurfaceSnapshot
  transcript: Pick<
    ThreadTranscriptState,
    "error" | "isLoading" | "threadId" | "turns"
  >
}

export type ThreadPanelNativeAction =
  | ThreadPanelAction
  | { draft: string; type: "set-message-draft" }
  | { submit: AgentHtmlAgentPromptSubmitInput; type: "submit-prompt" }
  | { type: "interrupt-turn" }

export function canUseThreadPanelNativeWindow() {
  return isTauri()
}

export async function openThreadPanelNativeWindow() {
  if (!canUseThreadPanelNativeWindow()) {
    return false
  }

  const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow")
  const existingWindow = await WebviewWindow.getByLabel(
    THREAD_PANEL_WINDOW_LABEL
  )
  if (existingWindow) {
    await existingWindow.setFocus()
    return true
  }

  const threadPanelWindow = new WebviewWindow(THREAD_PANEL_WINDOW_LABEL, {
    decorations: false,
    height: 640,
    title: "Thread Panel",
    url: "/?window=thread-panel",
    width: 960,
  })

  await new Promise<void>((resolve, reject) => {
    void threadPanelWindow.once("tauri://created", () => resolve())
    void threadPanelWindow.once("tauri://error", (event) => {
      reject(event.payload)
    })
  })
  await threadPanelWindow.setFocus()
  return true
}

export async function publishThreadPanelNativeSnapshot(
  snapshot: ThreadPanelNativeSnapshot
) {
  if (!canUseThreadPanelNativeWindow()) {
    return
  }

  const { emitTo } = await import("@tauri-apps/api/event")
  await emitTo(
    THREAD_PANEL_WINDOW_LABEL,
    THREAD_PANEL_SNAPSHOT_EVENT,
    snapshot
  )
}

export async function dispatchThreadPanelNativeAction(
  action: ThreadPanelNativeAction
) {
  if (!canUseThreadPanelNativeWindow()) {
    return
  }

  const { emitTo } = await import("@tauri-apps/api/event")
  await emitTo("main", THREAD_PANEL_ACTION_EVENT, action)
}

export async function subscribeThreadPanelNativeActions(
  handler: (action: ThreadPanelNativeAction) => void
) {
  if (!canUseThreadPanelNativeWindow()) {
    return () => {}
  }

  const { listen } = await import("@tauri-apps/api/event")
  return listen<ThreadPanelNativeAction>(THREAD_PANEL_ACTION_EVENT, (event) => {
    handler(event.payload)
  })
}

export async function subscribeThreadPanelNativeSnapshots(
  handler: (snapshot: ThreadPanelNativeSnapshot) => void
) {
  if (!canUseThreadPanelNativeWindow()) {
    return () => {}
  }

  const { listen } = await import("@tauri-apps/api/event")
  return listen<ThreadPanelNativeSnapshot>(
    THREAD_PANEL_SNAPSHOT_EVENT,
    (event) => {
      handler(event.payload)
    }
  )
}
