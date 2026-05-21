import type { PanelLayoutState, ShellChromeState } from "./types"
import { shellPanelConstraints } from "./layout"

const panelLayoutStorageKey = "agent-html-app:panel-layout:v5-structural"
const shellChromeStorageKey = "agent-html-app:shell-chrome:v1"

const defaultPanelLayout: PanelLayoutState = {
  sessions: shellPanelConstraints.sessions.defaultSize,
  workbench: shellPanelConstraints.workbench.defaultSize,
  shell: shellPanelConstraints.shell.defaultSize,
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

const defaultShellChromeState: ShellChromeState = {
  leftPanelVisible: true,
  rightPanelVisible: true,
}

export function readStoredShellChromeState(): ShellChromeState {
  if (typeof window === "undefined") {
    return defaultShellChromeState
  }

  try {
    const raw = window.localStorage.getItem(shellChromeStorageKey)
    if (!raw) {
      return defaultShellChromeState
    }

    const parsed = JSON.parse(raw) as Partial<ShellChromeState>
    return {
      leftPanelVisible:
        typeof parsed.leftPanelVisible === "boolean"
          ? parsed.leftPanelVisible
          : defaultShellChromeState.leftPanelVisible,
      rightPanelVisible:
        typeof parsed.rightPanelVisible === "boolean"
          ? parsed.rightPanelVisible
          : defaultShellChromeState.rightPanelVisible,
    }
  } catch {
    return defaultShellChromeState
  }
}

export function persistShellChromeState(state: ShellChromeState): void {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(shellChromeStorageKey, JSON.stringify(state))
}
