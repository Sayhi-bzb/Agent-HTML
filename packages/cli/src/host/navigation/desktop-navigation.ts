import {
  createArtifactTitleRenameResultMessage,
  createCanvasNavigationSnapshotMessage,
  readCanvasNavigationCommandMessage,
  readCanvasNavigationRequestMessage,
  type CanvasNavigationCommand,
  type CanvasNavigationSnapshot,
  type ArtifactTitleRenameResult,
} from "./navigation-sync-contract"

type NavigationMessageTarget = Pick<Window, "postMessage">

export function applyCanvasNavigationCommand({
  artifactFilePaths,
  command,
  onCreateArtifact,
  onRequestDeleteArtifact,
  onRenameArtifactTitle,
  onSelectArtifact,
  onSetSidebarOpen,
}: {
  artifactFilePaths: readonly string[]
  command: CanvasNavigationCommand
  onCreateArtifact: () => void
  onRequestDeleteArtifact: (filePath: string) => void
  onRenameArtifactTitle: (input: {
    filePath: string
    requestId: string
    title: string
  }) => void
  onSelectArtifact: (filePath: string) => void
  onSetSidebarOpen: (open: boolean) => void
}) {
  if (command.type === "create-artifact") {
    onCreateArtifact()
    return true
  }
  if (command.type === "set-sidebar-open") {
    onSetSidebarOpen(command.open)
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
