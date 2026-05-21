import type { PanelLayoutState } from "./types"

const panelLayoutStorageKey = "agent-html-app:panel-layout:v4-minimal"

export const defaultPanelLayout: PanelLayoutState = {
  sessions: 18,
  workbench: 56,
  shell: 26,
}

export function readStoredPanelLayout(): PanelLayoutState {
  if (typeof window === "undefined") {
    return defaultPanelLayout
  }

  try {
    const raw = window.localStorage.getItem(panelLayoutStorageKey)
    if (!raw) {
      return defaultPanelLayout
    }

    const parsed = JSON.parse(raw) as Partial<PanelLayoutState>
    if (
      typeof parsed.sessions !== "number" ||
      typeof parsed.workbench !== "number" ||
      typeof parsed.shell !== "number"
    ) {
      return defaultPanelLayout
    }

    return normalizePanelLayout([parsed.sessions, parsed.workbench, parsed.shell])
  } catch {
    return defaultPanelLayout
  }
}

export function normalizePanelLayout(
  layout: number[] | Record<string, number>,
): PanelLayoutState {
  if (Array.isArray(layout)) {
    const [
      sessions = defaultPanelLayout.sessions,
      workbench = defaultPanelLayout.workbench,
      shell = defaultPanelLayout.shell,
    ] = layout

    return {
      sessions,
      workbench,
      shell,
    }
  }

  return {
    sessions: layout.sessions ?? defaultPanelLayout.sessions,
    workbench: layout.workbench ?? defaultPanelLayout.workbench,
    shell: layout.shell ?? defaultPanelLayout.shell,
  }
}

export function persistPanelLayout(layout: PanelLayoutState): void {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(panelLayoutStorageKey, JSON.stringify(layout))
}
