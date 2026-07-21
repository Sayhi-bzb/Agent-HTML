export const canvasNavigationSnapshotMessageType =
  "agent-html:canvas-navigation-snapshot"
export const canvasNavigationRequestMessageType =
  "agent-html:canvas-navigation-request"
export const canvasNavigationCommandMessageType =
  "agent-html:canvas-navigation-command"
export const artifactTitleRenameResultMessageType =
  "agent-html:artifact-title-rename-result"
export const canvasNavigationSnapshotVersion = 1

export type CanvasNavigationArtifact = {
  filePath: string
  title: string
}

export type CanvasNavigationSnapshot = {
  activeFilePath: string | null
  artifacts: CanvasNavigationArtifact[]
  artifactsLoading: boolean
  createArtifactActive: boolean
  leftSidebarOpen: boolean
  version: typeof canvasNavigationSnapshotVersion
}

export type CanvasNavigationCommand =
  | { filePath: string; type: "select-artifact" }
  | { filePath: string; type: "request-delete-artifact" }
  | {
      filePath: string
      requestId: string
      title: string
      type: "rename-artifact-title"
    }
  | { type: "create-artifact" }
  | { open: boolean; type: "set-sidebar-open" }

export type CanvasNavigationSnapshotMessage = {
  snapshot: CanvasNavigationSnapshot
  type: typeof canvasNavigationSnapshotMessageType
}

export type CanvasNavigationRequestMessage = {
  requestId: string
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

export function createCanvasNavigationSnapshotMessage(
  snapshot: CanvasNavigationSnapshot
): CanvasNavigationSnapshotMessage {
  return { snapshot, type: canvasNavigationSnapshotMessageType }
}

export function createCanvasNavigationRequestMessage(
  requestId: string
): CanvasNavigationRequestMessage {
  return {
    requestId,
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
    typeof value.artifactsLoading !== "boolean" ||
    typeof value.createArtifactActive !== "boolean" ||
    typeof value.leftSidebarOpen !== "boolean"
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

  const activeFilePath =
    value.activeFilePath === null ? null : readFilePath(value.activeFilePath)
  if (
    value.activeFilePath !== null &&
    (!activeFilePath || !filePaths.has(activeFilePath))
  ) {
    return null
  }

  return {
    activeFilePath,
    artifacts,
    artifactsLoading: value.artifactsLoading,
    createArtifactActive: value.createArtifactActive,
    leftSidebarOpen: value.leftSidebarOpen,
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
  return createCanvasNavigationRequestMessage(value.requestId)
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
  if (command.type === "create-artifact") {
    return createCanvasNavigationCommandMessage({ type: "create-artifact" })
  }
  if (command.type === "select-artifact") {
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
  if (
    command.type === "set-sidebar-open" &&
    typeof command.open === "boolean"
  ) {
    return createCanvasNavigationCommandMessage({
      open: command.open,
      type: command.type,
    })
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
