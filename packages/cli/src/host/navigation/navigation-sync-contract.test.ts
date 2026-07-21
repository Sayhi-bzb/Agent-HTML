import { describe, expect, it } from "vitest"

import {
  canvasNavigationSnapshotVersion,
  createArtifactTitleRenameResultMessage,
  createCanvasNavigationCommandMessage,
  createCanvasNavigationRequestMessage,
  createCanvasNavigationSnapshotMessage,
  readCanvasNavigationCommandMessage,
  readArtifactTitleRenameResultMessage,
  readCanvasNavigationRequestMessage,
  readCanvasNavigationSnapshotMessage,
  type CanvasNavigationSnapshot,
} from "./navigation-sync-contract"

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

describe("Canvas navigation sync contract", () => {
  it("round trips a valid navigation snapshot", () => {
    const message = createCanvasNavigationSnapshotMessage(snapshot)
    expect(readCanvasNavigationSnapshotMessage(message)).toEqual(message)
  })

  it("rejects active paths outside the published Artifact registry", () => {
    expect(
      readCanvasNavigationSnapshotMessage(
        createCanvasNavigationSnapshotMessage({
          ...snapshot,
          activeFilePath: "agent-html/artifacts/missing.artifact.tsx",
        })
      )
    ).toBeNull()
  })

  it("rejects duplicate Artifacts and malformed labels", () => {
    expect(
      readCanvasNavigationSnapshotMessage(
        createCanvasNavigationSnapshotMessage({
          ...snapshot,
          artifacts: [snapshot.artifacts[0], snapshot.artifacts[0]],
        })
      )
    ).toBeNull()
    expect(
      readCanvasNavigationSnapshotMessage({
        snapshot: {
          ...snapshot,
          artifacts: [{ ...snapshot.artifacts[0], title: " " }],
        },
        type: "agent-html:canvas-navigation-snapshot",
      })
    ).toBeNull()
  })

  it("validates requests and all supported commands", () => {
    const request = createCanvasNavigationRequestMessage(
      "desktop-navigation-request-1"
    )
    expect(readCanvasNavigationRequestMessage(request)).toEqual(request)

    for (const command of [
      { filePath: snapshot.artifacts[0].filePath, type: "select-artifact" },
      {
        filePath: snapshot.artifacts[0].filePath,
        type: "request-delete-artifact",
      },
      { type: "create-artifact" },
      { open: false, type: "set-sidebar-open" },
      {
        filePath: snapshot.artifacts[0].filePath,
        requestId: "desktop-title-rename-request-1",
        title: "Renamed Artifact",
        type: "rename-artifact-title",
      },
    ] as const) {
      const message = createCanvasNavigationCommandMessage(command)
      expect(readCanvasNavigationCommandMessage(message)).toEqual(message)
    }
  })

  it("round trips successful and failed title rename results", () => {
    for (const result of [
      {
        filePath: snapshot.artifacts[0].filePath,
        ok: true,
        requestId: "desktop-title-rename-request-1",
        title: "Renamed Artifact",
      },
      {
        error: "Unable to write Artifact source",
        filePath: snapshot.artifacts[0].filePath,
        ok: false,
        requestId: "desktop-title-rename-request-2",
      },
    ] as const) {
      const message = createArtifactTitleRenameResultMessage(result)
      expect(readArtifactTitleRenameResultMessage(message)).toEqual(message)
    }
  })

  it("rejects malformed title rename commands and results", () => {
    expect(
      readCanvasNavigationCommandMessage(
        createCanvasNavigationCommandMessage({
          filePath: snapshot.artifacts[0].filePath,
          requestId: "desktop-title-rename-request-1",
          title: " ",
          type: "rename-artifact-title",
        })
      )
    ).toBeNull()
    expect(
      readArtifactTitleRenameResultMessage({
        ...createArtifactTitleRenameResultMessage({
          error: "Write failed",
          filePath: snapshot.artifacts[0].filePath,
          ok: false,
          requestId: "desktop-title-rename-request-2",
        }),
        result: {
          error: " ",
          filePath: snapshot.artifacts[0].filePath,
          ok: false,
          requestId: "desktop-title-rename-request-2",
        },
      })
    ).toBeNull()
  })

  it("rejects unknown commands and incompatible versions", () => {
    expect(
      readCanvasNavigationCommandMessage({
        command: { type: "delete-artifact" },
        type: "agent-html:canvas-navigation-command",
        version: canvasNavigationSnapshotVersion,
      })
    ).toBeNull()
    expect(
      readCanvasNavigationCommandMessage({
        command: { open: "yes", type: "set-sidebar-open" },
        type: "agent-html:canvas-navigation-command",
        version: canvasNavigationSnapshotVersion,
      })
    ).toBeNull()
    expect(
      readCanvasNavigationRequestMessage(
        createCanvasNavigationRequestMessage("too-short")
      )
    ).toBeNull()
    expect(
      readCanvasNavigationRequestMessage({
        ...createCanvasNavigationRequestMessage("desktop-navigation-request-1"),
        version: 2,
      })
    ).toBeNull()
  })
})
