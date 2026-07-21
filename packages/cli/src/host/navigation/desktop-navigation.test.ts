import { describe, expect, it, vi } from "vitest"

import {
  applyCanvasNavigationCommand,
  isTrustedDesktopNavigationOrigin,
  publishCanvasNavigation,
  readTrustedCanvasNavigationCommand,
  readTrustedCanvasNavigationRequest,
} from "./desktop-navigation"
import {
  createCanvasNavigationCommandMessage,
  createCanvasNavigationRequestMessage,
} from "./navigation-sync-contract"

describe("Canvas Desktop navigation bridge", () => {
  it("maps commands to existing Canvas actions and rejects missing Artifacts", () => {
    const onCreateArtifact = vi.fn()
    const onRequestDeleteArtifact = vi.fn()
    const onSelectArtifact = vi.fn()
    const onSetSidebarOpen = vi.fn()
    const options = {
      artifactFilePaths: ["agent-html/artifacts/one.artifact.tsx"],
      onCreateArtifact,
      onRequestDeleteArtifact,
      onSelectArtifact,
      onSetSidebarOpen,
    }

    expect(
      applyCanvasNavigationCommand({
        ...options,
        command: { type: "create-artifact" },
      })
    ).toBe(true)
    expect(
      applyCanvasNavigationCommand({
        ...options,
        command: {
          filePath: "agent-html/artifacts/one.artifact.tsx",
          type: "request-delete-artifact",
        },
      })
    ).toBe(true)
    expect(
      applyCanvasNavigationCommand({
        ...options,
        command: { open: false, type: "set-sidebar-open" },
      })
    ).toBe(true)
    expect(
      applyCanvasNavigationCommand({
        ...options,
        command: {
          filePath: "agent-html/artifacts/one.artifact.tsx",
          type: "select-artifact",
        },
      })
    ).toBe(true)
    expect(
      applyCanvasNavigationCommand({
        ...options,
        command: {
          filePath: "agent-html/artifacts/missing.artifact.tsx",
          type: "select-artifact",
        },
      })
    ).toBe(false)
    expect(
      applyCanvasNavigationCommand({
        ...options,
        command: {
          filePath: "agent-html/artifacts/missing.artifact.tsx",
          type: "request-delete-artifact",
        },
      })
    ).toBe(false)

    expect(onCreateArtifact).toHaveBeenCalledOnce()
    expect(onRequestDeleteArtifact).toHaveBeenCalledOnce()
    expect(onRequestDeleteArtifact).toHaveBeenCalledWith(
      "agent-html/artifacts/one.artifact.tsx"
    )
    expect(onSetSidebarOpen).toHaveBeenCalledWith(false)
    expect(onSelectArtifact).toHaveBeenCalledOnce()
  })

  it("allows only Desktop development and Tauri application origins", () => {
    expect(isTrustedDesktopNavigationOrigin("http://127.0.0.1:1420")).toBe(true)
    expect(isTrustedDesktopNavigationOrigin("http://tauri.localhost")).toBe(
      true
    )
    expect(isTrustedDesktopNavigationOrigin("https://tauri.localhost")).toBe(
      true
    )
    expect(isTrustedDesktopNavigationOrigin("tauri://localhost")).toBe(true)
    expect(isTrustedDesktopNavigationOrigin("http://127.0.0.1:4312")).toBe(
      false
    )
    expect(isTrustedDesktopNavigationOrigin("https://example.com")).toBe(false)
  })

  it("publishes an exact validated snapshot message", () => {
    const target = { postMessage: vi.fn() }
    const snapshot = {
      activeFilePath: null,
      artifacts: [],
      artifactsLoading: true,
      createArtifactActive: false,
      leftSidebarOpen: true,
      version: 1 as const,
    }

    const message = publishCanvasNavigation({
      snapshot,
      target,
      targetOrigin: "http://127.0.0.1:1420",
    })

    expect(target.postMessage).toHaveBeenCalledWith(
      message,
      "http://127.0.0.1:1420"
    )
    expect(message.snapshot).toEqual(snapshot)
  })

  it("accepts messages only from the embedding parent", () => {
    const parentWindow = { postMessage: vi.fn() } as unknown as Window
    const request = createCanvasNavigationRequestMessage(
      "desktop-navigation-request-1"
    )
    const command = createCanvasNavigationCommandMessage({
      type: "create-artifact",
    })

    expect(
      readTrustedCanvasNavigationRequest({
        event: {
          data: request,
          origin: "http://127.0.0.1:1420",
          source: parentWindow,
        } as MessageEvent,
        parentWindow,
      })
    ).toEqual(request)
    expect(
      readTrustedCanvasNavigationCommand({
        event: {
          data: command,
          origin: "http://127.0.0.1:1420",
          source: parentWindow,
        } as MessageEvent,
        parentWindow,
      })
    ).toEqual(command)
    expect(
      readTrustedCanvasNavigationCommand({
        event: {
          data: command,
          origin: "http://127.0.0.1:1420",
          source: {},
        } as MessageEvent,
        parentWindow,
      })
    ).toBeNull()
    expect(
      readTrustedCanvasNavigationCommand({
        event: {
          data: command,
          origin: "https://example.com",
          source: parentWindow,
        } as MessageEvent,
        parentWindow,
      })
    ).toBeNull()
  })
})
