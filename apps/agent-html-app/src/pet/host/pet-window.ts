import { isTauri } from "@tauri-apps/api/core"

import { PET_WINDOW_LABEL } from "@/app/pet/host/pet-window-events"

export async function ensurePetWindow() {
  if (!isTauri()) {
    return null
  }

  const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow")
  const existing = await WebviewWindow.getByLabel(PET_WINDOW_LABEL)
  if (existing) {
    return existing
  }

  return new WebviewWindow(PET_WINDOW_LABEL, {
    alwaysOnTop: true,
    decorations: false,
    focus: false,
    height: 260,
    resizable: false,
    skipTaskbar: true,
    title: "Agent HTML Pet",
    transparent: true,
    url: "/?window=pet",
    width: 360,
  })
}
