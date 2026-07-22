// @vitest-environment jsdom

import { describe, expect, it } from "vitest"

import {
  isCanvasShortcutBlocked,
  resolveCanvasShortcut,
  type CanvasShortcutInput,
} from "./canvas-shortcuts"

function shortcut(
  overrides: Partial<CanvasShortcutInput> = {}
): CanvasShortcutInput {
  return {
    altKey: false,
    ctrlKey: false,
    isComposing: false,
    key: "",
    metaKey: false,
    shiftKey: false,
    ...overrides,
  }
}

describe("Canvas shortcuts", () => {
  it("maps viewport, selection, and movement shortcuts", () => {
    expect(resolveCanvasShortcut(shortcut({ key: "+" }))).toEqual({
      type: "zoom-in",
    })
    expect(resolveCanvasShortcut(shortcut({ key: "2" }))).toEqual({
      type: "fit-selection",
    })
    expect(
      resolveCanvasShortcut(shortcut({ key: "ArrowRight", shiftKey: true }))
    ).toEqual({ dx: 10, dy: 0, type: "move" })
    expect(
      resolveCanvasShortcut(shortcut({ ctrlKey: true, key: "a" }))
    ).toEqual({ type: "select-all" })
    expect(resolveCanvasShortcut(shortcut({ key: "v" }))).toEqual({
      type: "tool-select",
    })
    expect(resolveCanvasShortcut(shortcut({ key: "H" }))).toEqual({
      type: "tool-navigate",
    })
  })

  it("preserves modified, composing, and unrelated shortcuts", () => {
    expect(
      resolveCanvasShortcut(shortcut({ ctrlKey: true, key: "+" }))
    ).toBeNull()
    expect(
      resolveCanvasShortcut(shortcut({ isComposing: true, key: "1" }))
    ).toBeNull()
    expect(
      resolveCanvasShortcut(shortcut({ altKey: true, key: "1" }))
    ).toBeNull()
  })

  it("blocks shortcuts owned by Node content and editable controls", () => {
    const content = document.createElement("div")
    content.dataset.canvasRegion = "node-content"
    const button = document.createElement("button")
    content.append(button)
    expect(isCanvasShortcutBlocked(button)).toBe(true)

    const input = document.createElement("input")
    expect(isCanvasShortcutBlocked(input)).toBe(true)

    const editor = document.createElement("div")
    editor.setAttribute("contenteditable", "")
    expect(isCanvasShortcutBlocked(editor)).toBe(true)

    const dock = document.createElement("div")
    dock.dataset.canvasRegion = "dock"
    expect(isCanvasShortcutBlocked(dock)).toBe(true)

    const pane = document.createElement("div")
    pane.className = "react-flow__pane"
    expect(isCanvasShortcutBlocked(pane)).toBe(false)
  })
})
