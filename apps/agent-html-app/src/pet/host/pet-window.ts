import { isTauri } from "@tauri-apps/api/core"

import { PET_WINDOW_LABEL } from "@/app/pet/host/pet-window-events"

const PET_WINDOW_POSITION_KEY = "agent-html:pet-window-position"

type StoredPetWindowPosition = {
  x: number
  y: number
}

function readStoredPetWindowPosition(): StoredPetWindowPosition | null {
  try {
    const rawValue = window.localStorage.getItem(PET_WINDOW_POSITION_KEY)
    if (!rawValue) {
      return null
    }

    const value = JSON.parse(rawValue) as Partial<StoredPetWindowPosition>
    return typeof value.x === "number" && typeof value.y === "number"
      ? { x: value.x, y: value.y }
      : null
  } catch {
    return null
  }
}

export async function ensurePetWindow() {
  if (!isTauri()) {
    return null
  }

  const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow")
  const existing = await WebviewWindow.getByLabel(PET_WINDOW_LABEL)
  if (existing) {
    return existing
  }

  const position = readStoredPetWindowPosition()
  return new WebviewWindow(PET_WINDOW_LABEL, {
    alwaysOnTop: true,
    decorations: false,
    focus: false,
    height: 260,
    ...(position ? { x: position.x, y: position.y } : {}),
    resizable: false,
    skipTaskbar: true,
    title: "Agent HTML Pet",
    transparent: true,
    url: "/?window=pet",
    width: 360,
  })
}

export function savePetWindowPosition(position: StoredPetWindowPosition) {
  window.localStorage.setItem(PET_WINDOW_POSITION_KEY, JSON.stringify(position))
}

export async function resizeCurrentPetWindow(input: {
  height: number
  width: number
}) {
  if (!isTauri()) {
    return
  }

  const { LogicalSize, getCurrentWindow } = await import("@tauri-apps/api/window")
  await getCurrentWindow().setSize(new LogicalSize(input.width, input.height))
}
