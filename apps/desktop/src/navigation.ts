import {
  readArtifactTitleRenameResultMessage,
  readCanvasNavigationSnapshotMessage,
  type ArtifactTitleRenameResult,
  type CanvasNavigationSnapshot,
} from "../../../packages/cli/src/host/navigation/navigation-sync-contract"

export function readTrustedDesktopNavigationSnapshot({
  event,
  expectedOrigin,
  expectedSource,
}: {
  event: MessageEvent<unknown>
  expectedOrigin: string
  expectedSource: MessageEventSource | null
}): CanvasNavigationSnapshot | null {
  if (
    !expectedSource ||
    event.source !== expectedSource ||
    event.origin !== expectedOrigin
  ) {
    return null
  }

  return readCanvasNavigationSnapshotMessage(event.data)?.snapshot ?? null
}

export function readTrustedDesktopArtifactTitleRenameResult({
  event,
  expectedOrigin,
  expectedSource,
}: {
  event: MessageEvent<unknown>
  expectedOrigin: string
  expectedSource: MessageEventSource | null
}): ArtifactTitleRenameResult | null {
  if (
    !expectedSource ||
    event.source !== expectedSource ||
    event.origin !== expectedOrigin
  ) {
    return null
  }

  return readArtifactTitleRenameResultMessage(event.data)?.result ?? null
}
