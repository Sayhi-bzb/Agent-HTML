import type { Artifact } from "../host-contracts"
import {
  canvasThemeEditorSections,
  type CanvasThemeEditorSectionId,
} from "../theme/theme-editor-sections"
import {
  canvasThemePresets,
  type CanvasThemePresetId,
} from "#agent-html-playground/theme/presets"

export const CANVAS_HOST_PREFERENCES_STORAGE_KEY =
  "agent-html:react-canvas:host-preferences:v1"

export type CanvasSidebarView = "artifacts" | "gallery"

export type CanvasHostPreferences = {
  activeCodexThreadId: string | null
  activeFilePath: string | null
  activeSidebarView: CanvasSidebarView
  activeThemeEditorSectionId: CanvasThemeEditorSectionId
  activeThemePresetId: CanvasThemePresetId
  leftSidebarOpen: boolean
  messageDrafts: Record<string, string>
}

const defaultCanvasHostPreferences: CanvasHostPreferences = {
  activeCodexThreadId: null,
  activeFilePath: null,
  activeSidebarView: "artifacts",
  activeThemeEditorSectionId: "color",
  activeThemePresetId: "default",
  leftSidebarOpen: true,
  messageDrafts: {},
}

function hasBrowserStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isSidebarView(value: unknown): value is CanvasSidebarView {
  return value === "artifacts" || value === "gallery"
}

function readSidebarView(value: unknown): CanvasSidebarView {
  if (value === "theme") {
    return "gallery"
  }

  return isSidebarView(value)
    ? value
    : defaultCanvasHostPreferences.activeSidebarView
}

function isThemeEditorSectionId(
  value: unknown
): value is CanvasThemeEditorSectionId {
  return canvasThemeEditorSections.some((section) => section.id === value)
}

function isThemePresetId(value: unknown): value is CanvasThemePresetId {
  return canvasThemePresets.some((preset) => preset.id === value)
}

function messageDraftKey({
  blockId,
  filePath,
}: {
  blockId: string
  filePath: string
}) {
  return `${encodeURIComponent(filePath)}::${encodeURIComponent(blockId)}`
}

function readStoredCanvasHostPreferences() {
  if (!hasBrowserStorage()) {
    return null
  }

  try {
    const rawPreferences = localStorage.getItem(
      CANVAS_HOST_PREFERENCES_STORAGE_KEY
    )
    if (!rawPreferences) {
      return null
    }

    const parsed = JSON.parse(rawPreferences) as unknown
    return isRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeStoredCanvasHostPreferences(preferences: CanvasHostPreferences) {
  if (!hasBrowserStorage()) {
    return
  }

  try {
    localStorage.setItem(
      CANVAS_HOST_PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences)
    )
  } catch {
    // Preferences should never make the host unusable.
  }
}

function readMessageDrafts(value: unknown) {
  if (!isRecord(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] =>
        typeof entry[0] === "string" && typeof entry[1] === "string"
    )
  )
}

function readOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null
}

function readActiveFilePath({
  artifacts,
  value,
}: {
  artifacts?: Artifact[]
  value: unknown
}) {
  if (typeof value !== "string") {
    return null
  }

  if (!artifacts) {
    return value
  }

  return artifacts.some((artifact) => artifact.filePath === value)
    ? value
    : null
}

export function readCanvasHostPreferences({
  artifacts,
}: {
  artifacts?: Artifact[]
} = {}): CanvasHostPreferences {
  const stored = readStoredCanvasHostPreferences()
  if (!stored) {
    return defaultCanvasHostPreferences
  }

  return {
    activeCodexThreadId: readOptionalString(stored.activeCodexThreadId),
    activeFilePath: readActiveFilePath({
      artifacts,
      value: stored.activeFilePath,
    }),
    activeSidebarView: readSidebarView(stored.activeSidebarView),
    activeThemeEditorSectionId: isThemeEditorSectionId(
      stored.activeThemeEditorSectionId
    )
      ? stored.activeThemeEditorSectionId
      : defaultCanvasHostPreferences.activeThemeEditorSectionId,
    activeThemePresetId: isThemePresetId(stored.activeThemePresetId)
      ? stored.activeThemePresetId
      : defaultCanvasHostPreferences.activeThemePresetId,
    leftSidebarOpen:
      typeof stored.leftSidebarOpen === "boolean"
        ? stored.leftSidebarOpen
        : defaultCanvasHostPreferences.leftSidebarOpen,
    messageDrafts: readMessageDrafts(stored.messageDrafts),
  }
}

export function writeCanvasHostPreferences(
  patch: Partial<Omit<CanvasHostPreferences, "messageDrafts">>
) {
  const current = readCanvasHostPreferences()
  writeStoredCanvasHostPreferences({
    ...current,
    ...patch,
  })
}

export function readCanvasMessageDraft({
  blockId,
  filePath,
}: {
  blockId: string
  filePath: string
}) {
  const preferences = readCanvasHostPreferences()
  return (
    preferences.messageDrafts[messageDraftKey({ blockId, filePath })] ?? ""
  )
}

export function writeCanvasMessageDraft({
  blockId,
  draft,
  filePath,
}: {
  blockId: string
  draft: string
  filePath: string
}) {
  const preferences = readCanvasHostPreferences()
  const key = messageDraftKey({ blockId, filePath })
  const messageDrafts = { ...preferences.messageDrafts }

  if (draft) {
    messageDrafts[key] = draft
  } else {
    delete messageDrafts[key]
  }

  writeStoredCanvasHostPreferences({
    ...preferences,
    messageDrafts,
  })
}
