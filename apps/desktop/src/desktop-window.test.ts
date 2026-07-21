import { describe, expect, it, vi } from "vitest"

const currentWindow = vi.hoisted(() => ({
  close: vi.fn(() => Promise.resolve()),
  isMaximized: vi.fn(() => Promise.resolve(true)),
  minimize: vi.fn(() => Promise.resolve()),
  onResized: vi.fn(() => Promise.resolve(vi.fn())),
  startDragging: vi.fn(() => Promise.resolve()),
  toggleMaximize: vi.fn(() => Promise.resolve()),
}))

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => currentWindow,
}))

import { createDesktopWindowControls } from "./desktop-window"

describe("desktop window controls", () => {
  it("delegates every title bar action to the current Tauri window", async () => {
    const controls = createDesktopWindowControls()
    const onResize = vi.fn()

    await controls.startDragging()
    await controls.minimize()
    await controls.toggleMaximize()
    await controls.close()
    await expect(controls.isMaximized()).resolves.toBe(true)
    await controls.onResized(onResize)

    expect(currentWindow.startDragging).toHaveBeenCalledOnce()
    expect(currentWindow.minimize).toHaveBeenCalledOnce()
    expect(currentWindow.toggleMaximize).toHaveBeenCalledOnce()
    expect(currentWindow.close).toHaveBeenCalledOnce()
    expect(currentWindow.isMaximized).toHaveBeenCalledOnce()
    expect(currentWindow.onResized).toHaveBeenCalledWith(onResize)
  })
})
