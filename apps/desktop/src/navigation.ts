import {
  readCanvasNavigationSnapshotMessage,
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
