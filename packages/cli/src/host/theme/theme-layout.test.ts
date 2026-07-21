import { afterEach, describe, expect, it, vi } from "vitest"

import {
  applyCanvasThemePresetLayout,
  getCanvasThemePresetFontStylesheetPaths,
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
  const linkElements: Array<{
    as: string
    crossOrigin: string | null
    dataset: Record<string, string>
    href: string
    id: string
    onload: (() => void) | null
    rel: string
    remove: () => void
    removeAttribute: (name: string) => void
  }> = []
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
        as: "",
        crossOrigin: null,
        dataset: {},
        href: "",
        id: "",
        onload: null,
        rel: "",
        remove() {
          const index = linkElements.indexOf(this)
          if (index >= 0) {
            linkElements.splice(index, 1)
          }
        },
        removeAttribute(name: string) {
          if (name === "as") {
            this.as = ""
          }
          if (name === "crossorigin") {
            this.crossOrigin = null
          }
        },
      }
    },
    getElementById(id: string) {
      return linkElements.find((linkElement) => linkElement.id === id) ?? null
    },
    head: {
      appendChild(element: (typeof linkElements)[number]) {
        linkElements.push(element)
      },
    },
    querySelectorAll(selector: string) {
      expect(selector).toBe('link[data-canvas-theme-preset-font="true"]')

      return linkElements.filter(
        (linkElement) =>
          linkElement.dataset.canvasThemePresetFont === "true"
      )
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
    expect(getCanvasThemePresetFontStylesheetPaths(preset)).toEqual([
      `/__agent-html/font-stylesheet?url=${encodeURIComponent(fontUrl)}`,
    ])
  })

  it("writes font link and allowed body classes", () => {
    vi.stubGlobal("HTMLLinkElement", Object)
    vi.stubGlobal("document", createDocumentMock())

    applyCanvasThemePresetLayout(preset)

    expect(
      document.getElementById("react-canvas-theme-preset-fonts")
    ).toMatchObject({
      href: expect.stringMatching(
        /^\/__agent-html\/font-stylesheet\?url=https%3A%2F%2Ffonts\.googleapis\.com/
      ),
      rel: "stylesheet",
    })
    expect(document.body.classList.contains("antialiased")).toBe(true)
    expect(document.body.classList.contains("ignored-class")).toBe(false)
  })

  it("writes zeoseven preload links once per stylesheet url", () => {
    vi.stubGlobal("HTMLLinkElement", Object)
    vi.stubGlobal("document", createDocumentMock())

    applyCanvasThemePresetLayout({
      id: "pixel-test",
      label: "Pixel Test",
      layout: {
        fonts: [
          {
            family: "Fusion Pixel 12px Mono latin",
            provider: "zeoseven",
            stylesheetUrl: "https://fontsapi.zeoseven.com/570/main/result.css",
            variable: "--font-sans",
          },
          {
            family: "Fusion Pixel 12px Mono latin",
            provider: "zeoseven",
            stylesheetUrl: "https://fontsapi.zeoseven.com/570/main/result.css",
            variable: "--font-heading",
          },
        ],
      },
      lightCssVariables: {},
    })

    const linkElement = document.getElementById(
      "react-canvas-theme-preset-fonts-zeoseven-0"
    ) as HTMLLinkElement

    expect(linkElement).toMatchObject({
      as: "",
      crossOrigin: "anonymous",
      href: "/__agent-html/font-stylesheet?url=https%3A%2F%2Ffontsapi.zeoseven.com%2F570%2Fmain%2Fresult.css",
      rel: "stylesheet",
    })
    expect(
      document.getElementById("react-canvas-theme-preset-fonts-zeoseven-1")
    ).toBeNull()
  })

  it("loads google and zeoseven fonts from one font stack", () => {
    vi.stubGlobal("HTMLLinkElement", Object)
    vi.stubGlobal("document", createDocumentMock())

    applyCanvasThemePresetLayout({
      id: "stack-test",
      label: "Stack Test",
      layout: {
        fonts: [
          {
            families: [
              { family: "Architects Daughter", provider: "google" },
              {
                family: "Acy",
                provider: "zeoseven",
                stylesheetUrl:
                  "https://fontsapi.zeoseven.com/250/main/result.css",
              },
            ],
            variable: "--font-sans",
          },
        ],
      },
      lightCssVariables: {},
    })

    expect(
      document.getElementById("react-canvas-theme-preset-fonts")
    ).toMatchObject({
      href: expect.stringContaining("family%3DArchitects%2BDaughter"),
      rel: "stylesheet",
    })
    expect(
      document.getElementById(
        "react-canvas-theme-preset-fonts-zeoseven-0"
      )
    ).toMatchObject({
      href: "/__agent-html/font-stylesheet?url=https%3A%2F%2Ffontsapi.zeoseven.com%2F250%2Fmain%2Fresult.css",
      rel: "stylesheet",
    })
  })

  it("loads multiple zeoseven stylesheet urls from one preset", () => {
    vi.stubGlobal("HTMLLinkElement", Object)
    vi.stubGlobal("document", createDocumentMock())

    applyCanvasThemePresetLayout({
      id: "multi-zeoseven-test",
      label: "Multi Zeoseven Test",
      layout: {
        fonts: [
          {
            families: [
              { family: "Poppins", provider: "google" },
              {
                family: "Nowar Rounded TW Wc",
                provider: "zeoseven",
                stylesheetUrl:
                  "https://fontsapi.zeoseven.com/387/main/result.css",
              },
            ],
            variable: "--font-sans",
          },
          {
            families: [
              { family: "Lora", provider: "google" },
              {
                family: "Noto Serif CJK",
                provider: "zeoseven",
                stylesheetUrl:
                  "https://fontsapi.zeoseven.com/285/main/result.css",
              },
            ],
            variable: "--font-serif",
          },
        ],
      },
      lightCssVariables: {},
    })

    expect(
      document.getElementById(
        "react-canvas-theme-preset-fonts-zeoseven-0"
      )
    ).toMatchObject({
      href: "/__agent-html/font-stylesheet?url=https%3A%2F%2Ffontsapi.zeoseven.com%2F387%2Fmain%2Fresult.css",
    })
    expect(
      document.getElementById(
        "react-canvas-theme-preset-fonts-zeoseven-1"
      )
    ).toMatchObject({
      href: "/__agent-html/font-stylesheet?url=https%3A%2F%2Ffontsapi.zeoseven.com%2F285%2Fmain%2Fresult.css",
    })
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
