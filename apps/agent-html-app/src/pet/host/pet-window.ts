import { isTauri } from "@tauri-apps/api/core"

import {
  PET_PANEL_WINDOW_LABEL,
  PET_WINDOW_LABEL,
} from "@/app/pet/host/pet-window-events"

const PET_WINDOW_POSITION_KEY = "agent-html:pet-window-position"
const PET_PANEL_OFFSET = {
  x: 100,
  y: 160,
}

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

function getStoredPetPanelPosition() {
  const position = readStoredPetWindowPosition()
  return position
    ? {
        x: position.x + PET_PANEL_OFFSET.x,
        y: position.y + PET_PANEL_OFFSET.y,
      }
    : null
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
    focusable: false,
    height: 220,
    ...(position ? { x: position.x, y: position.y } : {}),
    resizable: false,
    shadow: false,
    skipTaskbar: true,
    title: "Agent HTML Pet",
    transparent: true,
    url: "/?window=pet",
    width: 320,
  })
}

export function savePetWindowPosition(position: StoredPetWindowPosition) {
  window.localStorage.setItem(PET_WINDOW_POSITION_KEY, JSON.stringify(position))
}

export async function ensurePetPanelWindow() {
  if (!isTauri()) {
    return null
  }

  const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow")
  const existing = await WebviewWindow.getByLabel(PET_PANEL_WINDOW_LABEL)
  if (existing) {
    const panelPosition = getStoredPetPanelPosition()
    if (panelPosition) {
      const { LogicalPosition } = await import("@tauri-apps/api/dpi")
      await existing.setPosition(
        new LogicalPosition(panelPosition.x, panelPosition.y)
      )
    }
    return existing
  }

  const panelPosition = getStoredPetPanelPosition()
  return new WebviewWindow(PET_PANEL_WINDOW_LABEL, {
    alwaysOnTop: true,
    decorations: false,
    focus: false,
    height: 340,
    ...(panelPosition ? { x: panelPosition.x, y: panelPosition.y } : {}),
    resizable: false,
    shadow: true,
    skipTaskbar: true,
    title: "Agent HTML Pet Panel",
    transparent: true,
    url: "/?window=pet-panel",
    visible: false,
    width: 380,
  })
}
