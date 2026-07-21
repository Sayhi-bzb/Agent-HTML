import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import {
  resolveDesktopPlatform,
  type DesktopWindowControls,
} from "./desktop-window"
import { DesktopTitleBar } from "./title-bar"

const windowControls: DesktopWindowControls = {
  close: vi.fn(() => Promise.resolve()),
  isMaximized: vi.fn(() => Promise.resolve(false)),
  minimize: vi.fn(() => Promise.resolve()),
  onResized: vi.fn(() => Promise.resolve(vi.fn())),
  startDragging: vi.fn(() => Promise.resolve()),
  toggleMaximize: vi.fn(() => Promise.resolve()),
}

function renderTitleBar(platform: "linux" | "macos" | "windows") {
  return renderToStaticMarkup(
    createElement(DesktopTitleBar, { platform, windowControls })
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
