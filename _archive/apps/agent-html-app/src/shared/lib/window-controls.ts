import { isTauri } from "@tauri-apps/api/core"

type TauriWindowHandle = {
  close: () => Promise<void>
  hide: () => Promise<void>
  isMaximized: () => Promise<boolean>
  minimize: () => Promise<void>
  onResized: (handler: () => void) => Promise<() => void>
  startDragging: () => Promise<void>
  toggleMaximize: () => Promise<void>
}

function isTauriRuntime(): boolean {
  return isTauri()
}

let currentWindowHandlePromise: Promise<TauriWindowHandle | null> | null = null

export function preloadCurrentWindowHandle(): void {
  if (!isTauriRuntime() || currentWindowHandlePromise) {
    return
  }

  currentWindowHandlePromise = import("@tauri-apps/api/window").then(
    (tauriWindow) => tauriWindow.getCurrentWindow()
  )
}

async function getCurrentWindowHandle(): Promise<TauriWindowHandle | null> {
  if (!isTauriRuntime()) {
    return null
  }

  preloadCurrentWindowHandle()
  return currentWindowHandlePromise
}

export function isDesktopRuntime(): boolean {
  return isTauriRuntime()
}

export async function subscribeWindowMaximizedState(
  onChange: (isMaximized: boolean) => void
): Promise<() => void> {
  const currentWindow = await getCurrentWindowHandle()
  if (!currentWindow) {
    onChange(false)
    return () => {}
  }

  const publishState = () => {
    void currentWindow.isMaximized().then(onChange)
  }

  publishState()
  return currentWindow.onResized(publishState)
}

export async function startWindowDrag(): Promise<void> {
  const currentWindow = await getCurrentWindowHandle()
  if (!currentWindow) {
    return
  }

  await currentWindow.startDragging()
}

export async function minimizeWindow(): Promise<void> {
  const currentWindow = await getCurrentWindowHandle()
  if (!currentWindow) {
    return
  }

  await currentWindow.minimize()
}

export async function toggleMaximizeWindow(): Promise<void> {
  const currentWindow = await getCurrentWindowHandle()
  if (!currentWindow) {
    return
  }

  await currentWindow.toggleMaximize()
}

export async function closeWindow(): Promise<void> {
  const currentWindow = await getCurrentWindowHandle()
  if (!currentWindow) {
    return
  }

  await currentWindow.close()
}

export async function hideWindow(): Promise<void> {
  const currentWindow = await getCurrentWindowHandle()
  if (!currentWindow) {
    return
  }

  await currentWindow.hide()
}
