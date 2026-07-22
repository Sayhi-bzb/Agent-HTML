// @vitest-environment jsdom

import * as React from "react"
import { act } from "react"
import { createRoot } from "react-dom/client"
import { describe, expect, it } from "vitest"

import { WorkspaceSplitView } from "./workspace-split-view"

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function SplitViewHarness() {
  const [narrowPanel, setNarrowPanel] = React.useState<"main" | "pane">("pane")

  return (
    <WorkspaceSplitView
      main={<div data-testid="main">Artifact preview</div>}
      mainLabel="Preview"
      narrowPanel={narrowPanel}
      onNarrowPanelChange={setNarrowPanel}
      pane={<input aria-label="Theme value" defaultValue="retained" />}
      paneLabel="Controls"
    />
  )
}

describe("WorkspaceSplitView", () => {
  it("switches the narrow panel without remounting either slot", () => {
    const container = document.createElement("div")
    const root = createRoot(container)

    act(() => root.render(<SplitViewHarness />))
    const splitView = container.querySelector<HTMLElement>(
      ".workspace-split-view"
    )!
    const input = container.querySelector<HTMLInputElement>("input")!
    const buttons = container.querySelectorAll<HTMLButtonElement>("button")

    expect(splitView.dataset.narrowPanel).toBe("pane")
    expect(container.querySelector("[data-slot='scroll-area']")).not.toBeNull()
    expect(
      container.querySelector("[data-slot='scroll-area-viewport']")
    ).not.toBeNull()
    expect(container.querySelector("aside")?.getAttribute("aria-label")).toBe(
      "Controls"
    )
    expect(container.querySelector("section")?.getAttribute("aria-label")).toBe(
      "Preview"
    )

    act(() => buttons[0].click())
    expect(splitView.dataset.narrowPanel).toBe("main")
    expect(container.querySelector("input")).toBe(input)

    act(() => buttons[1].click())
    expect(splitView.dataset.narrowPanel).toBe("pane")
    expect(container.querySelector("input")).toBe(input)

    act(() => root.unmount())
  })
})
