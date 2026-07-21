import { describe, expect, it } from "vitest"

import {
  canvasNavigationSnapshotVersion,
  createCanvasNavigationSnapshotMessage,
  type CanvasNavigationSnapshot,
} from "../../../packages/cli/src/host/navigation/navigation-sync-contract"
import { readTrustedDesktopNavigationSnapshot } from "./navigation"

describe("Desktop Canvas navigation bridge", () => {
  it("accepts snapshots only from the active runtime frame and origin", () => {
    const source = {} as MessageEventSource
    const snapshot: CanvasNavigationSnapshot = {
      activeFilePath: "agent-html/artifacts/one.artifact.tsx",
      artifacts: [
        {
          filePath: "agent-html/artifacts/one.artifact.tsx",
          title: "Artifact one",
        },
      ],
      artifactsLoading: false,
      createArtifactActive: false,
      leftSidebarOpen: true,
      version: canvasNavigationSnapshotVersion,
    }
    const event = {
      data: createCanvasNavigationSnapshotMessage(snapshot),
      origin: "http://127.0.0.1:4312",
      source,
    } as MessageEvent<unknown>

    expect(
      readTrustedDesktopNavigationSnapshot({
        event,
        expectedOrigin: event.origin,
        expectedSource: source,
      })
    ).toEqual(snapshot)
    expect(
      readTrustedDesktopNavigationSnapshot({
        event,
        expectedOrigin: "http://127.0.0.1:9999",
        expectedSource: source,
      })
    ).toBeNull()
    expect(
      readTrustedDesktopNavigationSnapshot({
        event,
        expectedOrigin: event.origin,
        expectedSource: {} as MessageEventSource,
      })
    ).toBeNull()
    expect(
      readTrustedDesktopNavigationSnapshot({
        event: { ...event, source: null } as MessageEvent<unknown>,
        expectedOrigin: event.origin,
        expectedSource: null,
      })
    ).toBeNull()
  })
})
