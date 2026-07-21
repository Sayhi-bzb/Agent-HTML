import { describe, expect, it, vi } from "vitest"

import {
  canvasThemeSnapshotVersion,
  createCanvasThemeChangeMessage,
  createCanvasThemeRequestMessage,
  type CanvasThemeSnapshot,
} from "../../../packages/cli/src/host/theme/theme-sync-contract"
import {
  desktopDarkModeMediaQuery,
  readTrustedDesktopThemeMessage,
  readTrustedDesktopThemeRequest,
  resolveDesktopRuntimeOrigin,
  resolveDesktopThemeFontStylesheetHrefs,
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
  fontStylesheetPaths: [
    "/__agent-html/font-stylesheet?url=https%3A%2F%2Ffonts.googleapis.com%2Fcss2%3Ffamily%3DInter",
  ],
  lightCssVariables: {
    "--background": "#ffffff",
    "--foreground": "#111111",
  },
  mode: "system",
  presetId: "test",
  version: canvasThemeSnapshotVersion,
}

function createFontDocumentMock() {
  const links: Array<{
    crossOrigin: string | null
    dataset: Record<string, string>
    href: string
    rel: string
    remove: () => void
  }> = []

  const fontDocument = {
    createElement(tagName: string) {
      expect(tagName).toBe("link")
      const link = {
        crossOrigin: null,
        dataset: {},
        href: "",
        rel: "",
        remove() {
          const index = links.indexOf(link)
          if (index >= 0) links.splice(index, 1)
        },
      }
      return link
    },
    head: {
      appendChild(link: (typeof links)[number]) {
        links.push(link)
      },
    },
    querySelectorAll(selector: string) {
      expect(selector).toBe('link[data-desktop-canvas-theme-font="true"]')
      return links.filter(
        (link) => link.dataset.desktopCanvasThemeFont === "true"
      )
    },
  } as unknown as Document

  return { fontDocument, links }
}

function createRootMock() {
  return {
    classList: { toggle: vi.fn() },
    style: { removeProperty: vi.fn(), setProperty: vi.fn() },
  } as unknown as HTMLElement
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

  it("accepts only loopback runtime origins and resolves proxied stylesheets", () => {
    const runtimeOrigin = "http://127.0.0.1:4312"

    expect(resolveDesktopRuntimeOrigin(`${runtimeOrigin}/bootstrap`)).toBe(
      runtimeOrigin
    )
    expect(resolveDesktopRuntimeOrigin("http://localhost:4312")).toBeNull()
    expect(resolveDesktopRuntimeOrigin("https://127.0.0.1:4312")).toBeNull()
    expect(
      resolveDesktopThemeFontStylesheetHrefs({
        paths: snapshot.fontStylesheetPaths,
        runtimeOrigin,
      })
    ).toEqual([`${runtimeOrigin}${snapshot.fontStylesheetPaths[0]}`])
    expect(
      resolveDesktopThemeFontStylesheetHrefs({
        paths: ["https://example.com/font.css"],
        runtimeOrigin,
      })
    ).toEqual([])
  })

  it("creates, deduplicates, and removes managed theme font links", () => {
    const { fontDocument, links } = createFontDocumentMock()
    const options = {
      fontDocument,
      matchMedia: () => ({ matches: false }) as MediaQueryList,
      root: createRootMock(),
      runtimeOrigin: "http://127.0.0.1:4312",
      snapshot: { ...snapshot, mode: "light" as const },
    }

    watchDesktopTheme(options)
    watchDesktopTheme(options)

    expect(links).toHaveLength(1)
    expect(links[0]).toMatchObject({
      crossOrigin: "anonymous",
      dataset: { desktopCanvasThemeFont: "true" },
      href: expect.stringContaining(
        "http://127.0.0.1:4312/__agent-html/font-stylesheet"
      ),
      rel: "stylesheet",
    })

    watchDesktopTheme({ ...options, runtimeOrigin: null })
    expect(links).toHaveLength(0)
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

  it("accepts bootstrap requests only from the active runtime frame and origin", () => {
    const source = {} as MessageEventSource
    const request = createCanvasThemeRequestMessage("desktop-theme-request-1")
    const event = {
      data: request,
      origin: "http://127.0.0.1:4312",
      source,
    } as MessageEvent<unknown>

    expect(
      readTrustedDesktopThemeRequest({
        event,
        expectedOrigin: event.origin,
        expectedSource: source,
      })
    ).toEqual(request)
    expect(
      readTrustedDesktopThemeRequest({
        event,
        expectedOrigin: "http://127.0.0.1:9999",
        expectedSource: source,
      })
    ).toBeNull()
  })
})
