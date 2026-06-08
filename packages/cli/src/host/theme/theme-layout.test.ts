import { afterEach, describe, expect, it, vi } from "vitest"

import {
  applyCanvasThemePresetLayout,
  getCanvasThemePresetFontUrl,
} from "./theme-layout"
import type { CanvasThemePreset } from "#agent-html-playground/theme/presets"

const preset: CanvasThemePreset = {
  id: "test",
  label: "Test",
  layout: {
    bodyClassName: "antialiased ignored-class",
    fonts: [
      { family: "Inter", provider: "google", variable: "--font-sans" },
      { family: "Inter", provider: "google", variable: "--font-heading" },
      { family: "Geist Mono", provider: "google", variable: "--font-mono" },
      { family: "Georgia", provider: "system", variable: "--font-serif" },
    ],
  },
  lightCssVariables: {},
}

function createDocumentMock() {
  let linkElement:
    | {
        href: string
        id: string
        rel: string
        remove: () => void
      }
    | null = null
  const classes = new Set<string>()

  return {
    body: {
      classList: {
        add(className: string) {
          classes.add(className)
        },
        contains(className: string) {
          return classes.has(className)
        },
        remove(className: string) {
          classes.delete(className)
        },
      },
    },
    createElement(tagName: string) {
      expect(tagName).toBe("link")

      return {
        href: "",
        id: "",
        rel: "",
        remove() {
          if (linkElement === this) {
            linkElement = null
          }
        },
      }
    },
    getElementById(id: string) {
      return linkElement?.id === id ? linkElement : null
    },
    head: {
      appendChild(element: typeof linkElement) {
        linkElement = element
      },
    },
  } as unknown as Document
}

describe("canvas theme preset layout", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("creates a google font stylesheet url from preset layout metadata", () => {
    const fontUrl = getCanvasThemePresetFontUrl(preset)

    expect(fontUrl).toContain("family=Inter:wght@400;500;600;700")
    expect(fontUrl).toContain("family=Geist+Mono:wght@400;500;600;700")
    expect(fontUrl).not.toContain("Georgia")
  })

  it("writes font link and allowed body classes", () => {
    vi.stubGlobal("HTMLLinkElement", Object)
    vi.stubGlobal("document", createDocumentMock())

    applyCanvasThemePresetLayout(preset)

    expect(
      document.getElementById("react-canvas-theme-preset-fonts")
    ).toMatchObject({
      rel: "stylesheet",
    })
    expect(document.body.classList.contains("antialiased")).toBe(true)
    expect(document.body.classList.contains("ignored-class")).toBe(false)
  })

  it("clears managed layout artifacts for presets without layout", () => {
    vi.stubGlobal("HTMLLinkElement", Object)
    vi.stubGlobal("document", createDocumentMock())

    applyCanvasThemePresetLayout(preset)
    applyCanvasThemePresetLayout({
      id: "default",
      label: "Default",
      lightCssVariables: {},
    })

    expect(document.getElementById("react-canvas-theme-preset-fonts")).toBeNull()
    expect(document.body.classList.contains("antialiased")).toBe(false)
  })
})
