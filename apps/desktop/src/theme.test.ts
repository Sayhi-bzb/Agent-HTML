import { describe, expect, it, vi } from "vitest"

import {
  canvasThemeSnapshotVersion,
  createCanvasThemeChangeMessage,
  type CanvasThemeSnapshot,
} from "../../../packages/cli/src/host/theme/theme-sync-contract"
import {
  desktopDarkModeMediaQuery,
  readTrustedDesktopThemeMessage,
  resolveDesktopThemeDark,
  resolveDesktopThemeVariables,
  watchDesktopTheme,
} from "./theme"

const snapshot: CanvasThemeSnapshot = {
  darkCssVariables: {
    "--background": "#111111",
    "--foreground": "#eeeeee",
  },
  draftCssVariables: { "--radius": "0.75rem" },
  lightCssVariables: {
    "--background": "#ffffff",
    "--foreground": "#111111",
  },
  mode: "system",
  presetId: "test",
  version: canvasThemeSnapshotVersion,
}

describe("desktop theme", () => {
  it("resolves explicit and system theme modes", () => {
    expect(resolveDesktopThemeDark({ mode: "dark", systemDark: false })).toBe(
      true
    )
    expect(resolveDesktopThemeDark({ mode: "light", systemDark: true })).toBe(
      false
    )
    expect(resolveDesktopThemeDark({ mode: "system", systemDark: true })).toBe(
      true
    )
  })

  it("merges light, dark, and draft variables in cascade order", () => {
    expect(resolveDesktopThemeVariables({ snapshot, systemDark: false })).toMatchObject({
      "--background": "#ffffff",
      "--foreground": "#111111",
      "--radius": "0.75rem",
    })
    expect(resolveDesktopThemeVariables({ snapshot, systemDark: true })).toMatchObject({
      "--background": "#111111",
      "--foreground": "#eeeeee",
      "--radius": "0.75rem",
    })
  })

  it("tracks system changes, replaces root tokens, and cleans up", () => {
    let matches = false
    let listener: (() => void) | undefined
    const toggle = vi.fn()
    const removeProperty = vi.fn()
    const setProperty = vi.fn()
    const mediaQuery = {
      addEventListener(type: string, nextListener: () => void) {
        expect(type).toBe("change")
        listener = nextListener
      },
      get matches() {
        return matches
      },
      removeEventListener(type: string, nextListener: () => void) {
        expect(type).toBe("change")
        expect(nextListener).toBe(listener)
        listener = undefined
      },
    } as unknown as MediaQueryList

    const cleanup = watchDesktopTheme({
      matchMedia(query) {
        expect(query).toBe(desktopDarkModeMediaQuery)
        return mediaQuery
      },
      root: {
        classList: { toggle },
        style: { removeProperty, setProperty },
      } as unknown as HTMLElement,
      snapshot,
    })

    expect(toggle).toHaveBeenLastCalledWith("dark", false)
    expect(setProperty).toHaveBeenCalledWith("--background", "#ffffff")

    matches = true
    listener?.()

    expect(toggle).toHaveBeenLastCalledWith("dark", true)
    expect(setProperty).toHaveBeenLastCalledWith("--radius", "0.75rem")
    expect(removeProperty).toHaveBeenCalledWith("--background")

    cleanup?.()
    expect(listener).toBeUndefined()
  })

  it("accepts messages only from the active runtime frame and origin", () => {
    const source = {} as MessageEventSource
    const message = createCanvasThemeChangeMessage(snapshot)
    const event = {
      data: message,
      origin: "http://127.0.0.1:4312",
      source,
    } as MessageEvent<unknown>

    expect(
      readTrustedDesktopThemeMessage({
        event,
        expectedOrigin: event.origin,
        expectedSource: source,
      })
    ).toEqual(snapshot)
    expect(
      readTrustedDesktopThemeMessage({
        event,
        expectedOrigin: "http://127.0.0.1:9999",
        expectedSource: source,
      })
    ).toBeNull()
    expect(
      readTrustedDesktopThemeMessage({
        event,
        expectedOrigin: event.origin,
        expectedSource: {} as MessageEventSource,
      })
    ).toBeNull()
  })
})
