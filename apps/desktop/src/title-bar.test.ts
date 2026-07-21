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
  activeCodexThreadLabel: "Navigation polish",
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
  canvases: [
    {
      filePath: "agent-html/canvases/operations.canvas.tsx",
      title: "Operations",
    },
  ],
  canvasesLoading: false,
  codexThreadManagerActive: false,
  createArtifactActive: false,
  leftSidebarOpen: true,
  tabSession: {
    activeTabId: "artifact:agent-html/artifacts/artifact-2.artifact.tsx",
    tabs: [
      {
        filePath: "agent-html/artifacts/artifact-1.artifact.tsx",
        id: "artifact:agent-html/artifacts/artifact-1.artifact.tsx",
        kind: "artifact",
      },
      {
        filePath: "agent-html/artifacts/artifact-2.artifact.tsx",
        id: "artifact:agent-html/artifacts/artifact-2.artifact.tsx",
        kind: "artifact",
      },
      {
        filePath: "agent-html/canvases/operations.canvas.tsx",
        id: "canvas:agent-html/canvases/operations.canvas.tsx",
        kind: "canvas",
      },
    ],
    version: 1,
  },
  threads: [],
  threadsLoading: false,
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

    expect(markup).not.toContain("Agent-HTML")
    expect(markup).toContain('data-platform="macos"')
    expect(markup.indexOf("Close window")).toBeLessThan(
      markup.indexOf("Minimize window")
    )
    expect(markup.indexOf("Minimize window")).toBeLessThan(
      markup.indexOf("Maximize window")
    )
  })

  it("renders a drag-only title bar outside a workspace", () => {
    const markup = renderTitleBar("windows")

    expect(markup).toContain('data-navigation="home"')
    expect(markup).not.toContain("Agent-HTML")
    expect(markup).not.toContain('aria-label="Agent menu"')
    expect(markup).not.toContain('aria-label="Workspace"')
    expect(markup).toContain("desktop-titlebar__drag-space")
  })

  it("renders ordered workspace navigation and its active state", () => {
    const markup = renderTitleBar("windows", navigation)

    expect(markup).toContain('data-navigation="workspace"')
    expect(markup).toContain('aria-label="Workspace"')
    expect(markup.indexOf("Artifact 1")).toBeLessThan(
      markup.indexOf("Artifact 2")
    )
    expect(markup.indexOf("Artifact 2")).toBeLessThan(
      markup.indexOf("Operations")
    )
    expect(markup).toContain('class="desktop-titlebar__tab" data-active=""')
    expect(markup).toContain(
      'aria-selected="true" aria-posinset="2" aria-setsize="3" class="desktop-titlebar__tab-label"'
    )
    expect(markup).toContain('class="desktop-titlebar__tab-title"')
    expect(markup.match(/class="desktop-titlebar__tab-close"/g)).toHaveLength(
      navigation.artifacts.length + 1
    )
    expect(markup).toContain('data-kind="canvas"')
    expect(markup).toContain('aria-label="Close Artifact 1"')
    expect(markup).toContain('aria-label="Close Artifact 2"')
    expect(markup).toContain('aria-expanded="true"')
    expect(markup).toContain('aria-label="New Artifact"')
    expect(markup).toContain('aria-label="Agent menu"')
    expect(markup).not.toContain('role="img"')
  })

  it("shows a loading placeholder before the first runtime snapshot", () => {
    const markup = renderTitleBar("windows", null)

    expect(markup).toContain('aria-busy="true"')
    expect(markup).toContain("desktop-titlebar__tab-placeholder")
    expect(markup).toContain("disabled")
  })

  it("marks only New Artifact active in create mode", () => {
    const markup = renderTitleBar("windows", {
      ...navigation,
      createArtifactActive: true,
    })

    expect(markup).not.toContain('aria-selected="true"')
    expect(markup).toContain('aria-label="New Artifact" aria-pressed="true"')
  })

  it("renders a persistent active Threads tab with a non-destructive close", () => {
    const markup = renderTitleBar("windows", {
      ...navigation,
      activeFilePath: null,
      codexThreadManagerActive: true,
      tabSession: {
        activeTabId: "threads",
        tabs: [
          ...navigation.tabSession.tabs,
          { id: "threads", kind: "thread-manager" },
        ],
        version: 1,
      },
    })

    expect(markup).toContain('data-kind="threads"')
    expect(markup).toContain('aria-label="Close Threads"')
    expect(markup).toContain('aria-selected="true"')
    expect(markup).not.toContain('aria-label="Delete Threads"')
  })

  it("renders an individual thread as a persistent workspace tab", () => {
    const markup = renderTitleBar("windows", {
      ...navigation,
      activeFilePath: null,
      tabSession: {
        activeTabId: "thread:thread-1",
        tabs: [
          ...navigation.tabSession.tabs,
          { id: "thread:thread-1", kind: "thread", threadId: "thread-1" },
        ],
        version: 1,
      },
      threads: [{ id: "thread-1", title: "Persistent tabs" }],
    })

    expect(markup).toContain("Persistent tabs")
    expect(markup).toContain('data-kind="thread"')
    expect(markup).toContain('aria-label="Close Persistent tabs"')
    expect(markup).toContain('aria-selected="true"')
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
