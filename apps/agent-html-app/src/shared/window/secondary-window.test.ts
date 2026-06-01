import { afterEach, describe, expect, it, vi } from "vitest"

const isTauriMock = vi.hoisted(() => vi.fn())
const listenMock = vi.hoisted(() => vi.fn())
const emitToMock = vi.hoisted(() => vi.fn())

vi.mock("@tauri-apps/api/core", () => ({
  isTauri: isTauriMock,
}))

vi.mock("@tauri-apps/api/event", () => ({
  emitTo: emitToMock,
  listen: listenMock,
}))

import { createSecondaryWindowSurface } from "./secondary-window"

const storage = new Map<string, string>()
const windowMock = {
  localStorage: {
    clear: () => storage.clear(),
    getItem: (key: string) => storage.get(key) ?? null,
    removeItem: (key: string) => {
      storage.delete(key)
    },
    setItem: (key: string, value: string) => {
      storage.set(key, value)
    },
  },
}

afterEach(() => {
  storage.clear()
  isTauriMock.mockReset()
  listenMock.mockReset()
  emitToMock.mockReset()
})

describe("createSecondaryWindowSurface", () => {
  it("replays the cached snapshot after native subscription is installed", async () => {
    vi.stubGlobal("window", windowMock)
    isTauriMock.mockReturnValue(true)
    const unlisten = vi.fn()
    listenMock.mockResolvedValue(unlisten)
    const surface = createSecondaryWindowSurface<{ isLoading: boolean }, never>({
      actionEvent: "settings://action",
      defaultSize: { height: 400, width: 600 },
      label: "pet-settings",
      snapshotEvent: "settings://snapshot",
      snapshotStorageKey: "agent-html:test-snapshot",
      title: "Settings",
      url: "/?window=pet-settings",
    })
    surface.setLatestSnapshot({ isLoading: false })
    const handler = vi.fn()

    await expect(surface.subscribeSnapshots(handler)).resolves.toBe(unlisten)

    expect(listenMock).toHaveBeenCalledWith(
      "settings://snapshot",
      expect.any(Function)
    )
    expect(handler).toHaveBeenCalledWith({ isLoading: false })
  })
})
