// @vitest-environment jsdom

import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  canvasNavigationSnapshotVersion,
  type CanvasNavigationSnapshot,
} from "../../../packages/cli/src/host/navigation/navigation-sync-contract"
import type { DesktopWindowControls } from "./desktop-window"
import { DesktopTitleBar } from "./title-bar"

const navigation: CanvasNavigationSnapshot = {
  activeCodexThreadLabel: "Navigation polish",
  activeFilePath: "agent-html/artifacts/artifact.artifact.tsx",
  activeLanguage: "system",
  activeThemePresetId: "claude-plus",
  artifacts: [
    {
      filePath: "agent-html/artifacts/artifact.artifact.tsx",
      title: "Artifact",
    },
  ],
  artifactsLoading: false,
  canvases: [],
  canvasesLoading: false,
  codexThreadManagerActive: false,
  createArtifactActive: false,
  tabSession: {
    activeTabId: "artifact:agent-html/artifacts/artifact.artifact.tsx",
    tabs: [
      {
        filePath: "agent-html/artifacts/artifact.artifact.tsx",
        id: "artifact:agent-html/artifacts/artifact.artifact.tsx",
        kind: "artifact",
      },
    ],
    version: 1,
  },
  themePresets: [
    { id: "default", label: "Default" },
    { id: "claude-plus", label: "Claude +" },
  ],
  threads: [],
  threadsLoading: false,
  version: canvasNavigationSnapshotVersion,
}

class ResizeObserverStub implements ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

let container: HTMLDivElement
let root: Root
let windowControls: DesktopWindowControls

beforeEach(async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  vi.stubGlobal("PointerEvent", MouseEvent)
  vi.stubGlobal("ResizeObserver", ResizeObserverStub)
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  })
  container = document.createElement("div")
  document.body.append(container)
  root = createRoot(container)
  windowControls = {
    close: vi.fn(() => Promise.resolve()),
    isMaximized: vi.fn(() => Promise.resolve(false)),
    minimize: vi.fn(() => Promise.resolve()),
    onResized: vi.fn(() => Promise.resolve(vi.fn())),
    startDragging: vi.fn(() => Promise.resolve()),
    toggleMaximize: vi.fn(() => Promise.resolve()),
  }
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView")
  vi.unstubAllGlobals()
})

async function renderTitleBar(props: {
  navigation?: CanvasNavigationSnapshot
  onActivateTab?: (tabId: string) => void
  onOpenAppearance?: () => void
  onOpenCodexThreadManager?: () => void
  onSearchArtifacts?: () => void
}) {
  await act(async () => {
    root.render(
      createElement(DesktopTitleBar, {
        navigation,
        platform: "windows",
        windowControls,
        ...props,
      })
    )
  })
}

async function openAgentMenu() {
  const trigger = container.querySelector<HTMLButtonElement>(
    'button[aria-label="Agent menu"]'
  )
  expect(trigger).not.toBeNull()
  await act(async () => {
    trigger!.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, button: 0 })
    )
  })
}

function findMenuItem(label: string) {
  return Array.from(
    document.querySelectorAll<HTMLElement>("[role=menuitem]")
  ).find((item) => item.textContent?.trim() === label)
}

describe("desktop title bar interactions", () => {
  it("activates the Appearance workspace tab on click", async () => {
    const onActivateTab = vi.fn()
    await renderTitleBar({
      navigation: {
        ...navigation,
        tabSession: {
          activeTabId: navigation.tabSession.activeTabId,
          tabs: [
            ...navigation.tabSession.tabs,
            { id: "appearance", kind: "appearance" },
          ],
          version: 1,
        },
      },
      onActivateTab,
    })

    const appearanceTab = container.querySelector<HTMLButtonElement>(
      'button[role="tab"][title="Appearance"]'
    )
    expect(appearanceTab).not.toBeNull()
    await act(async () => appearanceTab!.click())

    expect(onActivateTab).toHaveBeenCalledWith("appearance")
  })

  it("activates an individual thread tab on click", async () => {
    const onActivateTab = vi.fn()
    await renderTitleBar({
      navigation: {
        ...navigation,
        tabSession: {
          activeTabId: navigation.tabSession.activeTabId,
          tabs: [
            ...navigation.tabSession.tabs,
            { id: "thread:thread-1", kind: "thread", threadId: "thread-1" },
          ],
          version: 1,
        },
        threads: [{ id: "thread-1", title: "Persistent tabs" }],
      },
      onActivateTab,
    })

    const threadTab = container.querySelector<HTMLButtonElement>(
      'button[role="tab"][title="Persistent tabs"]'
    )
    expect(threadTab).not.toBeNull()
    await act(async () => threadTab!.click())

    expect(onActivateTab).toHaveBeenCalledWith("thread:thread-1")
    expect(windowControls.startDragging).not.toHaveBeenCalled()
  })

  it("starts window actions only from the dedicated drag region", async () => {
    await renderTitleBar({})

    const navigationDragRegion = container.querySelector<HTMLElement>(
      ".desktop-titlebar__drag-space--navigation"
    )
    const headerDragRegion = Array.from(
      container.querySelectorAll<HTMLElement>(".desktop-titlebar__drag-space")
    ).find(
      (region) =>
        !region.classList.contains("desktop-titlebar__drag-space--navigation")
    )
    expect(navigationDragRegion).not.toBeNull()
    expect(headerDragRegion).toBeDefined()

    for (const dragRegion of [navigationDragRegion!, headerDragRegion!]) {
      dragRegion.dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true, button: 0, detail: 1 })
      )
      dragRegion.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }))
    }

    const newArtifact = container.querySelector<HTMLButtonElement>(
      'button[aria-label="New Artifact"]'
    )
    expect(newArtifact).not.toBeNull()
    newArtifact!.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, button: 0, detail: 1 })
    )

    expect(windowControls.startDragging).toHaveBeenCalledTimes(2)
    expect(windowControls.toggleMaximize).toHaveBeenCalledTimes(2)
  })

  it.each([
    ["Search", "onSearchArtifacts"],
    ["Navigation polish", "onOpenCodexThreadManager"],
    ["Appearance", "onOpenAppearance"],
  ] as const)(
    "selects %s without starting a window drag",
    async (label, callbackName) => {
      const onOpenCodexThreadManager = vi.fn()
      const onOpenAppearance = vi.fn()
      const onSearchArtifacts = vi.fn()
      await renderTitleBar({
        onOpenAppearance,
        onOpenCodexThreadManager,
        onSearchArtifacts,
      })
      await openAgentMenu()

      const item = findMenuItem(label)
      expect(item).toBeDefined()
      await act(async () => {
        item!.dispatchEvent(
          new MouseEvent("mousedown", {
            bubbles: true,
            button: 0,
            detail: 1,
          })
        )
        item!.click()
      })

      expect(
        { onOpenAppearance, onOpenCodexThreadManager, onSearchArtifacts }[
          callbackName
        ]
      ).toHaveBeenCalledOnce()
      expect(windowControls.startDragging).not.toHaveBeenCalled()
      expect(document.querySelector('[role="menu"]')).toBeNull()
    }
  )
})
