import { isTauri } from "@tauri-apps/api/core"
import { emitTo, listen } from "@tauri-apps/api/event"

import type { ThreadPanelAction, ThreadPanelSurfaceSnapshot } from "@/app/pet/host/pet-thread-panel-content"
import type { ThreadTranscriptState } from "@/app/workspace/thread-transcript"

export const THREAD_PANEL_WINDOW_LABEL = "thread-panel"
export const THREAD_PANEL_SNAPSHOT_EVENT = "thread-panel://snapshot"
export const THREAD_PANEL_ACTION_EVENT = "thread-panel://action"
export const THREAD_PANEL_SNAPSHOT_STORAGE_KEY =
  "agent-html:thread-panel-native-snapshot"

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

export type ThreadPanelNativeAction = ThreadPanelAction

let latestThreadPanelNativeSnapshot: ThreadPanelNativeSnapshot | null = null

export function canUseThreadPanelNativeWindow() {
  return isTauri()
}

export function getLatestThreadPanelNativeSnapshot() {
  return latestThreadPanelNativeSnapshot ?? readThreadPanelNativeSnapshotCache()
}

export function setLatestThreadPanelNativeSnapshot(
  snapshot: ThreadPanelNativeSnapshot | null
) {
  latestThreadPanelNativeSnapshot = snapshot
  writeThreadPanelNativeSnapshotCache(snapshot)
}

export function readThreadPanelNativeSnapshotCache() {
  if (typeof window === "undefined") {
    return null
  }

  const rawSnapshot = window.localStorage.getItem(
    THREAD_PANEL_SNAPSHOT_STORAGE_KEY
  )
  if (!rawSnapshot) {
    return null
  }

  try {
    return JSON.parse(rawSnapshot) as ThreadPanelNativeSnapshot
  } catch {
    window.localStorage.removeItem(THREAD_PANEL_SNAPSHOT_STORAGE_KEY)
    return null
  }
}

function writeThreadPanelNativeSnapshotCache(
  snapshot: ThreadPanelNativeSnapshot | null
) {
  if (typeof window === "undefined") {
    return
  }

  if (!snapshot) {
    window.localStorage.removeItem(THREAD_PANEL_SNAPSHOT_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(
    THREAD_PANEL_SNAPSHOT_STORAGE_KEY,
    JSON.stringify(snapshot)
  )
}

export function preloadThreadPanelNativeWindowApp() {
  if (!canUseThreadPanelNativeWindow()) {
    return
  }

  void import("@/app/pet/host/thread-panel-window-app")
}

export async function openThreadPanelNativeWindow() {
  if (!canUseThreadPanelNativeWindow()) {
    return false
  }

  try {
    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow")
    const existingWindow = await WebviewWindow.getByLabel(
      THREAD_PANEL_WINDOW_LABEL
    )
    if (existingWindow) {
      await existingWindow.show()
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
    await threadPanelWindow.show()
    await threadPanelWindow.setFocus()
    return true
  } catch {
    return false
  }
}

export async function closeThreadPanelNativeWindow() {
  if (!canUseThreadPanelNativeWindow()) {
    return
  }

  const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow")
  const existingWindow = await WebviewWindow.getByLabel(
    THREAD_PANEL_WINDOW_LABEL
  )
  await existingWindow?.hide()
}

export async function publishThreadPanelNativeSnapshot(
  snapshot: ThreadPanelNativeSnapshot
) {
  setLatestThreadPanelNativeSnapshot(snapshot)

  if (!canUseThreadPanelNativeWindow()) {
    return
  }

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

  await emitTo("main", THREAD_PANEL_ACTION_EVENT, action)
}

export async function subscribeThreadPanelNativeActions(
  handler: (action: ThreadPanelNativeAction) => void
) {
  if (!canUseThreadPanelNativeWindow()) {
    return () => {}
  }

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

  return listen<ThreadPanelNativeSnapshot>(
    THREAD_PANEL_SNAPSHOT_EVENT,
    (event) => {
      handler(event.payload)
    }
  )
}
