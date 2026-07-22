// @vitest-environment jsdom

import * as React from "react"
import { act } from "react"
import { createRoot } from "react-dom/client"
import { describe, expect, it, vi } from "vitest"

import { CanvasToolDock } from "./canvas-tool-dock"

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe("Canvas tool Dock", () => {
  it("exposes one pressed tool and roves focus with arrow keys", () => {
    const container = document.createElement("div")
    document.body.append(container)
    const root = createRoot(container)
    const onToolChange = vi.fn()
    act(() =>
      root.render(<CanvasToolDock onToolChange={onToolChange} tool="select" />)
    )
    const toolbar = container.querySelector<HTMLElement>("[role='toolbar']")!
    const buttons = [...container.querySelectorAll<HTMLButtonElement>("button")]
    expect(toolbar.getAttribute("aria-label")).toBe("Canvas tools")
    expect(
      buttons.map((button) => button.getAttribute("aria-pressed"))
    ).toEqual(["true", "false"])
    expect(buttons.map((button) => button.tabIndex)).toEqual([0, -1])

    buttons[0].focus()
    act(() =>
      buttons[0].dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "ArrowRight" })
      )
    )
    expect(document.activeElement).toBe(buttons[1])
    act(() => buttons[1].click())
    expect(onToolChange).toHaveBeenCalledWith("navigate")
    act(() => root.unmount())
    container.remove()
  })
})
