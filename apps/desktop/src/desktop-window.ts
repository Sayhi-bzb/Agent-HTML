import { getCurrentWindow } from "@tauri-apps/api/window"

export type DesktopPlatform = "linux" | "macos" | "windows"

export type DesktopWindowControls = {
  close: () => Promise<void>
  isMaximized: () => Promise<boolean>
  minimize: () => Promise<void>
  onResized: (handler: () => void) => Promise<() => void>
  startDragging: () => Promise<void>
  toggleMaximize: () => Promise<void>
}

export function resolveDesktopPlatform(platform: string): DesktopPlatform {
  const normalized = platform.toLowerCase()
  if (normalized.includes("mac")) return "macos"
  if (normalized.includes("linux")) return "linux"
  return "windows"
}

export function createDesktopWindowControls(): DesktopWindowControls {
  const currentWindow = getCurrentWindow()

  return {
    close: () => currentWindow.close(),
    isMaximized: () => currentWindow.isMaximized(),
    minimize: () => currentWindow.minimize(),
    onResized: (handler) => currentWindow.onResized(handler),
    startDragging: () => currentWindow.startDragging(),
    toggleMaximize: () => currentWindow.toggleMaximize(),
  }
}
