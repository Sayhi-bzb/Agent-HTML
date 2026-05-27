import { isTauri } from "@tauri-apps/api/core"

type TauriWindowHandle = {
  close: () => Promise<void>
  minimize: () => Promise<void>
  toggleMaximize: () => Promise<void>
}

function isTauriRuntime(): boolean {
  return isTauri()
}

async function getCurrentWindowHandle(): Promise<TauriWindowHandle | null> {
  if (!isTauriRuntime()) {
    return null
  }

  const tauriWindow = await import("@tauri-apps/api/window")
  return tauriWindow.getCurrentWindow()
}

export function isDesktopRuntime(): boolean {
  return isTauriRuntime()
}

export function getDragRegionProps(): Record<string, string> {
  return isDesktopRuntime() ? { "data-tauri-drag-region": "" } : {}
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
