import {
  createArtifactTitleRenameResultMessage,
  createCanvasNavigationSnapshotMessage,
  readCanvasNavigationCommandMessage,
  readCanvasNavigationRequestMessage,
  type CanvasNavigationCommand,
  type CanvasNavigationLanguage,
  type CanvasNavigationSnapshot,
  type ArtifactTitleRenameResult,
} from "./navigation-sync-contract"
import type { CanvasThemeMode } from "../theme/theme-sync-contract"

type NavigationMessageTarget = Pick<Window, "postMessage">

export function applyCanvasNavigationCommand({
  artifactFilePaths,
  canvasFilePaths,
  command,
  onCloseCodexThreadManager,
  onCreateArtifact,
  onOpenArtifactSearch,
  onOpenCodexThreadManager,
  onRequestDeleteArtifact,
  onRenameArtifactTitle,
  onSelectArtifact,
  onSelectCanvas,
  onSetLanguage,
  onSetSidebarOpen,
  onSetThemeMode,
  onToggleThemeMode,
}: {
  artifactFilePaths: readonly string[]
  canvasFilePaths: readonly string[]
  command: CanvasNavigationCommand
  onCloseCodexThreadManager: () => void
  onCreateArtifact: () => void
  onOpenArtifactSearch: () => void
  onOpenCodexThreadManager: () => void
  onRequestDeleteArtifact: (filePath: string) => void
  onRenameArtifactTitle: (input: {
    filePath: string
    requestId: string
    title: string
  }) => void
  onSelectArtifact: (filePath: string) => void
  onSelectCanvas: (filePath: string) => void
  onSetLanguage: (language: CanvasNavigationLanguage) => void
  onSetSidebarOpen: (open: boolean) => void
  onSetThemeMode: (mode: CanvasThemeMode) => void
  onToggleThemeMode: () => void
}) {
  if (command.type === "open-codex-thread-manager") {
    onOpenCodexThreadManager()
    return true
  }
  if (command.type === "close-codex-thread-manager") {
    onCloseCodexThreadManager()
    return true
  }
  if (command.type === "create-artifact") {
    onCreateArtifact()
    return true
  }
  if (command.type === "open-artifact-search") {
    onOpenArtifactSearch()
    return true
  }
  if (command.type === "toggle-theme-mode") {
    onToggleThemeMode()
    return true
  }
  if (command.type === "set-theme-mode") {
    onSetThemeMode(command.mode)
    return true
  }
  if (command.type === "set-language") {
    onSetLanguage(command.language)
    return true
  }
  if (command.type === "set-sidebar-open") {
    onSetSidebarOpen(command.open)
    return true
  }
  if (command.type === "select-canvas") {
    if (!canvasFilePaths.includes(command.filePath)) {
      return false
    }
    onSelectCanvas(command.filePath)
    return true
  }
  if (command.type === "request-delete-artifact") {
    if (!artifactFilePaths.includes(command.filePath)) {
      return false
    }
    onRequestDeleteArtifact(command.filePath)
    return true
  }
  if (command.type === "rename-artifact-title") {
    if (!artifactFilePaths.includes(command.filePath)) {
      return false
    }
    onRenameArtifactTitle(command)
    return true
  }
  if (artifactFilePaths.includes(command.filePath)) {
    onSelectArtifact(command.filePath)
    return true
  }
  return false
}

export function publishArtifactTitleRenameResult({
  result,
  target = window.parent,
  targetOrigin,
}: {
  result: ArtifactTitleRenameResult
  target?: NavigationMessageTarget
  targetOrigin: string
}) {
  const message = createArtifactTitleRenameResultMessage(result)
  target.postMessage(message, targetOrigin)
  return message
}

export function isTrustedDesktopNavigationOrigin(origin: string) {
  let url: URL
  try {
    url = new URL(origin)
  } catch {
    return false
  }

  if (
    url.username ||
    url.password ||
    (url.pathname !== "/" && url.pathname !== "")
  ) {
    return false
  }

  return (
    (url.protocol === "http:" &&
      url.hostname === "127.0.0.1" &&
      url.port === "1420") ||
    ((url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname === "tauri.localhost" &&
      !url.port) ||
    (url.protocol === "tauri:" && url.hostname === "localhost" && !url.port)
  )
}

export function publishCanvasNavigation({
  snapshot,
  target = window.parent,
  targetOrigin,
}: {
  snapshot: CanvasNavigationSnapshot
  target?: NavigationMessageTarget
  targetOrigin: string
}) {
  const message = createCanvasNavigationSnapshotMessage(snapshot)
  target.postMessage(message, targetOrigin)
  return message
}

export function readTrustedCanvasNavigationRequest({
  event,
  parentWindow,
}: {
  event: MessageEvent<unknown>
  parentWindow: MessageEventSource
}) {
  return event.source === parentWindow &&
    isTrustedDesktopNavigationOrigin(event.origin)
    ? readCanvasNavigationRequestMessage(event.data)
    : null
}

export function readTrustedCanvasNavigationCommand({
  event,
  parentWindow,
}: {
  event: MessageEvent<unknown>
  parentWindow: MessageEventSource
}) {
  return event.source === parentWindow &&
    isTrustedDesktopNavigationOrigin(event.origin)
    ? readCanvasNavigationCommandMessage(event.data)
    : null
}
