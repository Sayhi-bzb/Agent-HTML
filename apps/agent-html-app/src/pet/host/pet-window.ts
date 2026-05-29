import { isTauri } from "@tauri-apps/api/core"

const PET_WINDOW_LABEL = "pet"

export async function ensurePetWindow() {
  if (!isTauri()) {
    return null
  }

  const tauriWindow = await import("@tauri-apps/api/window")
  const existing = await tauriWindow.WebviewWindow.getByLabel(PET_WINDOW_LABEL)
  if (existing) {
    return existing
  }

  return new tauriWindow.WebviewWindow(PET_WINDOW_LABEL, {
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
