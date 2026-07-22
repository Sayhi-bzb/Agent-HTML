import type { CanvasThemeMode } from "../theme/theme-sync-contract"
import {
  readWorkspaceTabSession,
  type WorkspaceTabSession,
  type WorkspaceTabTarget,
} from "./workspace-tabs"

export const canvasNavigationSnapshotMessageType =
  "agent-html:canvas-navigation-snapshot"
export const canvasNavigationRequestMessageType =
  "agent-html:canvas-navigation-request"
export const canvasNavigationCommandMessageType =
  "agent-html:canvas-navigation-command"
export const artifactTitleRenameResultMessageType =
  "agent-html:artifact-title-rename-result"
export const canvasNavigationSnapshotVersion = 4

export type CanvasNavigationArtifact = {
  filePath: string
  title: string
}

export type CanvasNavigationCanvas = {
  filePath: string
  title: string
}

export type CanvasNavigationThread = {
  id: string
  title: string
}

export type CanvasNavigationLanguage = "en" | "system" | "zh"

export type CanvasNavigationThemePreset = {
  id: string
  label: string
}

export type CanvasNavigationSnapshot = {
  activeCodexThreadLabel?: string | null
  activeFilePath: string | null
  activeLanguage?: CanvasNavigationLanguage
  activeThemePresetId: string
  artifacts: CanvasNavigationArtifact[]
  artifactsLoading: boolean
  canvases?: CanvasNavigationCanvas[]
  canvasesLoading?: boolean
  codexThreadManagerActive?: boolean
  createArtifactActive: boolean
  tabSession: WorkspaceTabSession
  themePresets: CanvasNavigationThemePreset[]
  threads: CanvasNavigationThread[]
  threadsLoading: boolean
  version: typeof canvasNavigationSnapshotVersion
}

export type CanvasNavigationCommand =
  | { tab: WorkspaceTabTarget; type: "open-tab" }
  | { tabId: string; type: "activate-tab" }
  | { tabId: string; type: "close-tab" }
  | { filePath: string; type: "select-artifact" }
  | { filePath: string; type: "select-canvas" }
  | { filePath: string; type: "request-delete-artifact" }
  | {
      filePath: string
      requestId: string
      title: string
      type: "rename-artifact-title"
    }
  | { type: "create-artifact" }
  | { type: "close-codex-thread-manager" }
  | { type: "open-artifact-search" }
  | { type: "open-codex-thread-manager" }
  | { mode: CanvasThemeMode; type: "set-theme-mode" }
  | { presetId: string; type: "set-theme-preset" }
  | { type: "toggle-theme-mode" }
  | { language: CanvasNavigationLanguage; type: "set-language" }

export type CanvasNavigationSnapshotMessage = {
  snapshot: CanvasNavigationSnapshot
  type: typeof canvasNavigationSnapshotMessageType
}

export type CanvasNavigationRequestMessage = {
  requestId: string
  session?: WorkspaceTabSession
  type: typeof canvasNavigationRequestMessageType
  version: typeof canvasNavigationSnapshotVersion
}

export type CanvasNavigationCommandMessage = {
  command: CanvasNavigationCommand
  type: typeof canvasNavigationCommandMessageType
  version: typeof canvasNavigationSnapshotVersion
}

export type ArtifactTitleRenameResult =
  | {
      filePath: string
      ok: true
      requestId: string
      title: string
    }
  | {
      error: string
      filePath: string
      ok: false
      requestId: string
    }

export type ArtifactTitleRenameResultMessage = {
  result: ArtifactTitleRenameResult
  type: typeof artifactTitleRenameResultMessageType
  version: typeof canvasNavigationSnapshotVersion
}

const maximumArtifactCount = 1_000
const maximumThreadCount = 1_000
const maximumThemePresetCount = 100
const maximumFilePathLength = 4_096
const maximumTitleLength = 512
const maximumErrorLength = 2_048
const validRequestId = /^[a-zA-Z0-9_-]{16,128}$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readFilePath(value: unknown) {
  return typeof value === "string" &&
    value.length > 0 &&
    value.length <= maximumFilePathLength &&
    value === value.trim()
    ? value
    : null
}

function readArtifact(value: unknown): CanvasNavigationArtifact | null {
  if (!isRecord(value)) {
    return null
  }

  const filePath = readFilePath(value.filePath)
  if (
    !filePath ||
    typeof value.title !== "string" ||
    value.title.length === 0 ||
    value.title.length > maximumTitleLength ||
    value.title !== value.title.trim()
  ) {
    return null
  }

  return { filePath, title: value.title }
}

function readThread(value: unknown): CanvasNavigationThread | null {
  if (!isRecord(value)) return null
  const id = readFilePath(value.id)
  if (
    !id ||
    typeof value.title !== "string" ||
    value.title.length === 0 ||
    value.title.length > maximumTitleLength ||
    value.title !== value.title.trim()
  ) {
    return null
  }
  return { id, title: value.title }
}

function readThemePreset(value: unknown): CanvasNavigationThemePreset | null {
  if (!isRecord(value)) return null
  const id = readFilePath(value.id)
  if (
    !id ||
    !/^[a-z0-9][a-z0-9-]{0,63}$/.test(id) ||
    typeof value.label !== "string" ||
    value.label.length === 0 ||
    value.label.length > maximumTitleLength ||
    value.label !== value.label.trim()
  ) {
    return null
  }
  return { id, label: value.label }
}

function readWorkspaceTabTarget(value: unknown): WorkspaceTabTarget | null {
  if (!isRecord(value)) return null
  if (value.kind === "appearance") return { kind: "appearance" }
  if (value.kind === "thread-manager") return { kind: "thread-manager" }
  if (value.kind === "artifact" || value.kind === "canvas") {
    const filePath = readFilePath(value.filePath)
    return filePath ? { filePath, kind: value.kind } : null
  }
  if (value.kind === "thread") {
    const threadId = readFilePath(value.threadId)
    return threadId ? { kind: "thread", threadId } : null
  }
  return null
}

const readCanvas = readArtifact

function isCanvasNavigationLanguage(
  value: unknown
): value is CanvasNavigationLanguage {
  return value === "system" || value === "zh" || value === "en"
}

export function createCanvasNavigationSnapshotMessage(
  snapshot: CanvasNavigationSnapshot
): CanvasNavigationSnapshotMessage {
  return { snapshot, type: canvasNavigationSnapshotMessageType }
}

export function createCanvasNavigationRequestMessage(
  requestId: string,
  session?: WorkspaceTabSession
): CanvasNavigationRequestMessage {
  return {
    requestId,
    ...(session ? { session } : {}),
    type: canvasNavigationRequestMessageType,
    version: canvasNavigationSnapshotVersion,
  }
}

export function createCanvasNavigationCommandMessage(
  command: CanvasNavigationCommand
): CanvasNavigationCommandMessage {
  return {
    command,
    type: canvasNavigationCommandMessageType,
    version: canvasNavigationSnapshotVersion,
  }
}

export function createArtifactTitleRenameResultMessage(
  result: ArtifactTitleRenameResult
): ArtifactTitleRenameResultMessage {
  return {
    result,
    type: artifactTitleRenameResultMessageType,
    version: canvasNavigationSnapshotVersion,
  }
}

export function readCanvasNavigationSnapshot(
  value: unknown
): CanvasNavigationSnapshot | null {
  if (
    !isRecord(value) ||
    value.version !== canvasNavigationSnapshotVersion ||
    !Array.isArray(value.artifacts) ||
    value.artifacts.length > maximumArtifactCount ||
    (value.canvases !== undefined && !Array.isArray(value.canvases)) ||
    (Array.isArray(value.canvases) &&
      value.canvases.length > maximumArtifactCount) ||
    !Array.isArray(value.threads) ||
    value.threads.length > maximumThreadCount ||
    !Array.isArray(value.themePresets) ||
    value.themePresets.length === 0 ||
    value.themePresets.length > maximumThemePresetCount ||
    typeof value.threadsLoading !== "boolean" ||
    typeof value.artifactsLoading !== "boolean" ||
    (value.canvasesLoading !== undefined &&
      typeof value.canvasesLoading !== "boolean") ||
    (value.codexThreadManagerActive !== undefined &&
      typeof value.codexThreadManagerActive !== "boolean") ||
    typeof value.createArtifactActive !== "boolean"
  ) {
    return null
  }

  const artifacts: CanvasNavigationArtifact[] = []
  const filePaths = new Set<string>()
  for (const valueArtifact of value.artifacts) {
    const artifact = readArtifact(valueArtifact)
    if (!artifact || filePaths.has(artifact.filePath)) {
      return null
    }
    artifacts.push(artifact)
    filePaths.add(artifact.filePath)
  }

  const canvases: CanvasNavigationCanvas[] = []
  const canvasFilePaths = new Set<string>()
  for (const valueCanvas of value.canvases ?? []) {
    const canvas = readCanvas(valueCanvas)
    if (
      !canvas ||
      filePaths.has(canvas.filePath) ||
      canvasFilePaths.has(canvas.filePath)
    ) {
      return null
    }
    canvases.push(canvas)
    canvasFilePaths.add(canvas.filePath)
  }

  const threads: CanvasNavigationThread[] = []
  const threadIds = new Set<string>()
  for (const valueThread of value.threads) {
    const thread = readThread(valueThread)
    if (!thread || threadIds.has(thread.id)) return null
    threads.push(thread)
    threadIds.add(thread.id)
  }

  const themePresets: CanvasNavigationThemePreset[] = []
  const themePresetIds = new Set<string>()
  for (const valueThemePreset of value.themePresets) {
    const themePreset = readThemePreset(valueThemePreset)
    if (!themePreset || themePresetIds.has(themePreset.id)) return null
    themePresets.push(themePreset)
    themePresetIds.add(themePreset.id)
  }
  const activeThemePresetId =
    typeof value.activeThemePresetId === "string" &&
    themePresetIds.has(value.activeThemePresetId)
      ? value.activeThemePresetId
      : null
  if (!activeThemePresetId) return null

  const tabSession = readWorkspaceTabSession(value.tabSession)
  if (!tabSession) return null
  if (
    tabSession.tabs.some(
      (tab) =>
        (tab.kind === "artifact" && !filePaths.has(tab.filePath)) ||
        (tab.kind === "canvas" && !canvasFilePaths.has(tab.filePath))
    )
  ) {
    return null
  }

  const activeFilePath =
    value.activeFilePath === null ? null : readFilePath(value.activeFilePath)
  if (
    value.activeFilePath !== null &&
    (!activeFilePath ||
      (!filePaths.has(activeFilePath) && !canvasFilePaths.has(activeFilePath)))
  ) {
    return null
  }

  const activeLanguage =
    value.activeLanguage === undefined
      ? undefined
      : isCanvasNavigationLanguage(value.activeLanguage)
        ? value.activeLanguage
        : null
  if (activeLanguage === null) {
    return null
  }

  const activeCodexThreadLabel =
    value.activeCodexThreadLabel === undefined ||
    value.activeCodexThreadLabel === null
      ? value.activeCodexThreadLabel
      : typeof value.activeCodexThreadLabel === "string" &&
          value.activeCodexThreadLabel.length > 0 &&
          value.activeCodexThreadLabel.length <= maximumTitleLength &&
          value.activeCodexThreadLabel === value.activeCodexThreadLabel.trim()
        ? value.activeCodexThreadLabel
        : false
  if (activeCodexThreadLabel === false) {
    return null
  }

  return {
    ...(activeCodexThreadLabel === undefined ? {} : { activeCodexThreadLabel }),
    activeFilePath,
    ...(activeLanguage === undefined ? {} : { activeLanguage }),
    activeThemePresetId,
    artifacts,
    artifactsLoading: value.artifactsLoading,
    ...(value.canvases === undefined ? {} : { canvases }),
    ...(value.canvasesLoading === undefined
      ? {}
      : { canvasesLoading: value.canvasesLoading }),
    ...(value.codexThreadManagerActive === undefined
      ? {}
      : { codexThreadManagerActive: value.codexThreadManagerActive }),
    createArtifactActive: value.createArtifactActive,
    tabSession,
    themePresets,
    threads,
    threadsLoading: value.threadsLoading,
    version: canvasNavigationSnapshotVersion,
  }
}

export function readCanvasNavigationSnapshotMessage(
  value: unknown
): CanvasNavigationSnapshotMessage | null {
  if (!isRecord(value) || value.type !== canvasNavigationSnapshotMessageType) {
    return null
  }
  const snapshot = readCanvasNavigationSnapshot(value.snapshot)
  return snapshot ? createCanvasNavigationSnapshotMessage(snapshot) : null
}

export function readCanvasNavigationRequestMessage(
  value: unknown
): CanvasNavigationRequestMessage | null {
  if (
    !isRecord(value) ||
    value.type !== canvasNavigationRequestMessageType ||
    value.version !== canvasNavigationSnapshotVersion ||
    typeof value.requestId !== "string" ||
    !validRequestId.test(value.requestId)
  ) {
    return null
  }
  const session =
    value.session === undefined
      ? undefined
      : (readWorkspaceTabSession(value.session) ?? null)
  return session === null
    ? null
    : createCanvasNavigationRequestMessage(value.requestId, session)
}

export function readCanvasNavigationCommandMessage(
  value: unknown
): CanvasNavigationCommandMessage | null {
  if (
    !isRecord(value) ||
    value.type !== canvasNavigationCommandMessageType ||
    value.version !== canvasNavigationSnapshotVersion ||
    !isRecord(value.command)
  ) {
    return null
  }

  const command = value.command
  if (command.type === "open-tab") {
    const tab = readWorkspaceTabTarget(command.tab)
    return tab
      ? createCanvasNavigationCommandMessage({ tab, type: "open-tab" })
      : null
  }
  if (command.type === "activate-tab" || command.type === "close-tab") {
    const tabId = readFilePath(command.tabId)
    return tabId
      ? createCanvasNavigationCommandMessage({ tabId, type: command.type })
      : null
  }
  if (command.type === "create-artifact") {
    return createCanvasNavigationCommandMessage({ type: "create-artifact" })
  }
  if (command.type === "open-codex-thread-manager") {
    return createCanvasNavigationCommandMessage({
      type: "open-codex-thread-manager",
    })
  }
  if (command.type === "close-codex-thread-manager") {
    return createCanvasNavigationCommandMessage({
      type: "close-codex-thread-manager",
    })
  }
  if (command.type === "open-artifact-search") {
    return createCanvasNavigationCommandMessage({
      type: "open-artifact-search",
    })
  }
  if (command.type === "toggle-theme-mode") {
    return createCanvasNavigationCommandMessage({ type: "toggle-theme-mode" })
  }
  if (
    command.type === "set-theme-mode" &&
    (command.mode === "system" ||
      command.mode === "light" ||
      command.mode === "dark")
  ) {
    return createCanvasNavigationCommandMessage({
      mode: command.mode,
      type: "set-theme-mode",
    })
  }
  if (
    command.type === "set-theme-preset" &&
    typeof command.presetId === "string" &&
    /^[a-z0-9][a-z0-9-]{0,63}$/.test(command.presetId)
  ) {
    return createCanvasNavigationCommandMessage({
      presetId: command.presetId,
      type: "set-theme-preset",
    })
  }
  if (
    command.type === "set-language" &&
    isCanvasNavigationLanguage(command.language)
  ) {
    return createCanvasNavigationCommandMessage({
      language: command.language,
      type: "set-language",
    })
  }
  if (command.type === "select-artifact") {
    const filePath = readFilePath(command.filePath)
    return filePath
      ? createCanvasNavigationCommandMessage({ filePath, type: command.type })
      : null
  }
  if (command.type === "select-canvas") {
    const filePath = readFilePath(command.filePath)
    return filePath
      ? createCanvasNavigationCommandMessage({ filePath, type: command.type })
      : null
  }
  if (command.type === "request-delete-artifact") {
    const filePath = readFilePath(command.filePath)
    return filePath
      ? createCanvasNavigationCommandMessage({ filePath, type: command.type })
      : null
  }
  if (command.type === "rename-artifact-title") {
    const filePath = readFilePath(command.filePath)
    const title =
      typeof command.title === "string" &&
      command.title.length > 0 &&
      command.title.length <= maximumTitleLength &&
      command.title === command.title.trim()
        ? command.title
        : null
    return filePath &&
      title &&
      typeof command.requestId === "string" &&
      validRequestId.test(command.requestId)
      ? createCanvasNavigationCommandMessage({
          filePath,
          requestId: command.requestId,
          title,
          type: command.type,
        })
      : null
  }
  return null
}

export function readArtifactTitleRenameResultMessage(
  value: unknown
): ArtifactTitleRenameResultMessage | null {
  if (
    !isRecord(value) ||
    value.type !== artifactTitleRenameResultMessageType ||
    value.version !== canvasNavigationSnapshotVersion ||
    !isRecord(value.result)
  ) {
    return null
  }

  const result = value.result
  const filePath = readFilePath(result.filePath)
  const requestId =
    typeof result.requestId === "string" &&
    validRequestId.test(result.requestId)
      ? result.requestId
      : null
  if (!filePath || !requestId || typeof result.ok !== "boolean") {
    return null
  }

  if (result.ok) {
    const title =
      typeof result.title === "string" &&
      result.title.length > 0 &&
      result.title.length <= maximumTitleLength &&
      result.title === result.title.trim()
        ? result.title
        : null
    return title
      ? createArtifactTitleRenameResultMessage({
          filePath,
          ok: true,
          requestId,
          title,
        })
      : null
  }

  const error =
    typeof result.error === "string" &&
    result.error.length > 0 &&
    result.error.length <= maximumErrorLength &&
    result.error === result.error.trim()
      ? result.error
      : null
  return error
    ? createArtifactTitleRenameResultMessage({
        error,
        filePath,
        ok: false,
        requestId,
      })
    : null
}
