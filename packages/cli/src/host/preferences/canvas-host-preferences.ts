import type { Artifact } from "../host-contracts"
import {
  createEmptyWorkspaceTabSession,
  createWorkspaceTab,
  readWorkspaceTabSession,
  type WorkspaceTabSession,
} from "../navigation/workspace-tabs"
import {
  isCanvasThemeEditorSectionId,
  type CanvasThemeEditorSectionId,
} from "../theme/theme-editor-contract"
import {
  canvasThemePresets,
  type CanvasThemePresetId,
} from "#agent-html-playground/theme/presets"

export const CANVAS_HOST_PREFERENCES_STORAGE_KEY =
  "agent-html:react-canvas:host-preferences:v3"
const LEGACY_CANVAS_HOST_PREFERENCES_STORAGE_KEY =
  "agent-html:react-canvas:host-preferences:v2"

export type CanvasHostLanguage = "en" | "system" | "zh"
export type CanvasHostThemeMode = "dark" | "light" | "system"
export type CanvasCreateArtifactJobPhase =
  | "failed"
  | "starting"
  | "waiting-for-artifact"

export type CanvasCreateArtifactJob = {
  error?: string
  filePath: string
  phase: CanvasCreateArtifactJobPhase
  request: string
  startedAt: number
}

export type CanvasHostPreferences = {
  activeCodexThreadId: string | null
  activeFilePath: string | null
  activeLanguage: CanvasHostLanguage
  activeThemeEditorSectionId: CanvasThemeEditorSectionId
  activeThemeMode: CanvasHostThemeMode
  activeThemePresetId: CanvasThemePresetId
  createArtifactJob: CanvasCreateArtifactJob | null
  messageDrafts: Record<string, string>
  workspaceTabSession: WorkspaceTabSession
}

const defaultCanvasHostPreferences: CanvasHostPreferences = {
  activeCodexThreadId: null,
  activeFilePath: null,
  activeLanguage: "system",
  activeThemeEditorSectionId: "color",
  activeThemeMode: "system",
  activeThemePresetId: "claude-plus",
  createArtifactJob: null,
  messageDrafts: {},
  workspaceTabSession: createEmptyWorkspaceTabSession(),
}

function hasBrowserStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isHostLanguage(value: unknown): value is CanvasHostLanguage {
  return value === "system" || value === "zh" || value === "en"
}

function isHostThemeMode(value: unknown): value is CanvasHostThemeMode {
  return value === "system" || value === "light" || value === "dark"
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
    const rawPreferences =
      localStorage.getItem(CANVAS_HOST_PREFERENCES_STORAGE_KEY) ??
      localStorage.getItem(LEGACY_CANVAS_HOST_PREFERENCES_STORAGE_KEY)
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

function isCreateArtifactJobPhase(
  value: unknown
): value is CanvasCreateArtifactJobPhase {
  return (
    value === "failed" ||
    value === "starting" ||
    value === "waiting-for-artifact"
  )
}

function readCreateArtifactJob(value: unknown): CanvasCreateArtifactJob | null {
  if (!isRecord(value)) {
    return null
  }

  const filePath = readOptionalString(value.filePath)
  const request = readOptionalString(value.request)
  const phase = value.phase

  if (!filePath || !request || !isCreateArtifactJobPhase(phase)) {
    return null
  }

  const job: CanvasCreateArtifactJob = {
    filePath,
    phase,
    request,
    startedAt:
      typeof value.startedAt === "number" && Number.isFinite(value.startedAt)
        ? value.startedAt
        : 0,
  }
  const error = readOptionalString(value.error)

  if (error) {
    job.error = error
  }

  return job
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

function readStoredWorkspaceTabSession({
  activeFilePath,
  value,
}: {
  activeFilePath: string | null
  value: unknown
}) {
  const session = readWorkspaceTabSession(value)
  if (session) return session
  if (!activeFilePath) return createEmptyWorkspaceTabSession()
  const tab = createWorkspaceTab({
    filePath: activeFilePath,
    kind: "artifact",
  })
  return {
    activeTabId: tab.id,
    tabs: [tab],
    version: 1 as const,
  }
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

  const activeFilePath = readActiveFilePath({
    artifacts,
    value: stored.activeFilePath,
  })
  return {
    activeCodexThreadId: readOptionalString(stored.activeCodexThreadId),
    activeFilePath,
    activeLanguage: isHostLanguage(stored.activeLanguage)
      ? stored.activeLanguage
      : defaultCanvasHostPreferences.activeLanguage,
    activeThemeEditorSectionId: isCanvasThemeEditorSectionId(
      stored.activeThemeEditorSectionId
    )
      ? stored.activeThemeEditorSectionId
      : defaultCanvasHostPreferences.activeThemeEditorSectionId,
    activeThemeMode: isHostThemeMode(stored.activeThemeMode)
      ? stored.activeThemeMode
      : defaultCanvasHostPreferences.activeThemeMode,
    activeThemePresetId: isThemePresetId(stored.activeThemePresetId)
      ? stored.activeThemePresetId
      : defaultCanvasHostPreferences.activeThemePresetId,
    createArtifactJob: readCreateArtifactJob(stored.createArtifactJob),
    messageDrafts: readMessageDrafts(stored.messageDrafts),
    workspaceTabSession: readStoredWorkspaceTabSession({
      activeFilePath,
      value: stored.workspaceTabSession,
    }),
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
  return preferences.messageDrafts[messageDraftKey({ blockId, filePath })] ?? ""
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
