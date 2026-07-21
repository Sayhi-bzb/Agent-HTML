import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import {
  resolveDesktopPlatform,
  type DesktopWindowControls,
} from "./desktop-window"
import { DesktopTitleBar } from "./title-bar"
import {
  canvasNavigationSnapshotVersion,
  type CanvasNavigationSnapshot,
} from "../../../packages/cli/src/host/navigation/navigation-sync-contract"

const windowControls: DesktopWindowControls = {
  close: vi.fn(() => Promise.resolve()),
  isMaximized: vi.fn(() => Promise.resolve(false)),
  minimize: vi.fn(() => Promise.resolve()),
  onResized: vi.fn(() => Promise.resolve(vi.fn())),
  startDragging: vi.fn(() => Promise.resolve()),
  toggleMaximize: vi.fn(() => Promise.resolve()),
}

const navigation: CanvasNavigationSnapshot = {
  activeFilePath: "agent-html/artifacts/artifact-2.artifact.tsx",
  artifacts: [
    {
      filePath: "agent-html/artifacts/artifact-1.artifact.tsx",
      title: "Artifact 1",
    },
    {
      filePath: "agent-html/artifacts/artifact-2.artifact.tsx",
      title: "Artifact 2",
    },
  ],
  artifactsLoading: false,
  createArtifactActive: false,
  leftSidebarOpen: true,
  version: canvasNavigationSnapshotVersion,
}

function renderTitleBar(
  platform: "linux" | "macos" | "windows",
  workspaceNavigation?: CanvasNavigationSnapshot | null
) {
  return renderToStaticMarkup(
    createElement(DesktopTitleBar, {
      navigation: workspaceNavigation,
      platform,
      windowControls,
    })
  )
}

describe("desktop title bar", () => {
  it("resolves supported desktop platforms", () => {
    expect(resolveDesktopPlatform("MacIntel")).toBe("macos")
    expect(resolveDesktopPlatform("Linux x86_64")).toBe("linux")
    expect(resolveDesktopPlatform("Win32")).toBe("windows")
  })

  it("uses macOS window action order", () => {
    const markup = renderTitleBar("macos")

    expect(markup).toContain("Agent-HTML")
    expect(markup).toContain('data-platform="macos"')
    expect(markup.indexOf("Close window")).toBeLessThan(
      markup.indexOf("Minimize window")
    )
    expect(markup.indexOf("Minimize window")).toBeLessThan(
      markup.indexOf("Maximize window")
    )
  })

  it("renders the brand-only title bar outside a workspace", () => {
    const markup = renderTitleBar("windows")

    expect(markup).toContain('data-navigation="brand"')
    expect(markup).toContain("Agent-HTML")
    expect(markup).toContain('aria-label="Agent menu"')
    expect(markup).not.toContain('aria-label="Artifacts"')
  })

  it("renders ordered Artifact navigation and its active state", () => {
    const markup = renderTitleBar("windows", navigation)

    expect(markup).toContain('data-navigation="workspace"')
    expect(markup).toContain('aria-label="Artifacts"')
    expect(markup.indexOf("Artifact 1")).toBeLessThan(
      markup.indexOf("Artifact 2")
    )
    expect(markup).toContain(
      'class="desktop-titlebar__artifact" data-active=""'
    )
    expect(markup).toContain(
      'aria-current="page" class="desktop-titlebar__artifact-label"'
    )
    expect(markup).toContain('class="desktop-titlebar__artifact-title"')
    expect(
      markup.match(/class="desktop-titlebar__artifact-close"/g)
    ).toHaveLength(navigation.artifacts.length)
    expect(markup).toContain('aria-label="Delete Artifact 1"')
    expect(markup).toContain('aria-label="Delete Artifact 2"')
    expect(markup).toContain('aria-expanded="true"')
    expect(markup).toContain('aria-label="New Artifact"')
    expect(markup).toContain('aria-label="Agent menu"')
    expect(markup).not.toContain('role="img"')
  })

  it("shows a loading placeholder before the first runtime snapshot", () => {
    const markup = renderTitleBar("windows", null)

    expect(markup).toContain('aria-busy="true"')
    expect(markup).toContain("desktop-titlebar__artifact-placeholder")
    expect(markup).toContain("disabled")
  })

  it("marks only New Artifact active in create mode", () => {
    const markup = renderTitleBar("windows", {
      ...navigation,
      createArtifactActive: true,
    })

    expect(markup).not.toContain('aria-current="page"')
    expect(markup).toContain('aria-label="New Artifact" aria-pressed="true"')
  })

  it.each(["windows", "linux"] as const)(
    "uses right-side action order on %s",
    (platform) => {
      const markup = renderTitleBar(platform)

      expect(markup.indexOf("Minimize window")).toBeLessThan(
        markup.indexOf("Maximize window")
      )
      expect(markup.indexOf("Maximize window")).toBeLessThan(
        markup.indexOf("Close window")
      )
    }
  )
})
