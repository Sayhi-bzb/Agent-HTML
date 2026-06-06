import type { ThreadPanelAction, ThreadPanelSurfaceSnapshot } from "@/app/pet/host/pet-thread-panel-content"
import { createSecondaryWindowSurface } from "@/app/shared/window/secondary-window"
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

const threadPanelSecondaryWindow = createSecondaryWindowSurface<
  ThreadPanelNativeSnapshot,
  ThreadPanelNativeAction
>({
  actionEvent: THREAD_PANEL_ACTION_EVENT,
  defaultSize: {
    height: 640,
    width: 960,
  },
  label: THREAD_PANEL_WINDOW_LABEL,
  preload: () => import("@/app/pet/host/thread-panel-window-app"),
  snapshotEvent: THREAD_PANEL_SNAPSHOT_EVENT,
  snapshotStorageKey: THREAD_PANEL_SNAPSHOT_STORAGE_KEY,
  title: "Thread Panel",
  url: "/?window=thread-panel",
})

export function canUseThreadPanelNativeWindow() {
  return threadPanelSecondaryWindow.canUseNativeWindow()
}

export function getLatestThreadPanelNativeSnapshot() {
  return readThreadPanelNativeSnapshotCache()
}

export function setLatestThreadPanelNativeSnapshot(
  snapshot: ThreadPanelNativeSnapshot | null
) {
  threadPanelSecondaryWindow.setLatestSnapshot(snapshot)
}

export function readThreadPanelNativeSnapshotCache() {
  return threadPanelSecondaryWindow.readSnapshotCache()
}

export function preloadThreadPanelNativeWindowApp() {
  threadPanelSecondaryWindow.preloadWindowApp()
}

export async function openThreadPanelNativeWindow() {
  return threadPanelSecondaryWindow.openWindow()
}

export async function closeThreadPanelNativeWindow() {
  await threadPanelSecondaryWindow.hideWindow()
}

export async function publishThreadPanelNativeSnapshot(
  snapshot: ThreadPanelNativeSnapshot
) {
  await threadPanelSecondaryWindow.publishSnapshot(snapshot)
}

export async function dispatchThreadPanelNativeAction(
  action: ThreadPanelNativeAction
) {
  await threadPanelSecondaryWindow.dispatchAction(action)
}

export async function subscribeThreadPanelNativeActions(
  handler: (action: ThreadPanelNativeAction) => void
) {
  return threadPanelSecondaryWindow.subscribeActions(handler)
}

export async function subscribeThreadPanelNativeSnapshots(
  handler: (snapshot: ThreadPanelNativeSnapshot) => void
) {
  return threadPanelSecondaryWindow.subscribeSnapshots(handler)
}
