import { afterEach, describe, expect, it, vi } from "vitest"

import {
  applyCanvasThemePreset,
  getCanvasThemePresetCss,
} from "./theme-preset"
import {
  canvasThemePresets,
  type CanvasThemePreset,
} from "#agent-html-playground/theme/presets"

const preset: CanvasThemePreset = {
  darkCssVariables: {
    "--background": "#111111",
  },
  id: "test",
  label: "Test",
  lightCssVariables: {
    "--background": "#ffffff",
    "--foreground": "#111111",
  },
}

function createDocumentMock() {
  let styleElement:
    | {
        id: string
        remove: () => void
        textContent: string
      }
    | null = null

  return {
    createElement(tagName: string) {
      expect(tagName).toBe("style")

      return {
        id: "",
        remove() {
          if (styleElement === this) {
            styleElement = null
          }
        },
        textContent: "",
      }
    },
    getElementById(id: string) {
      return styleElement?.id === id ? styleElement : null
    },
    head: {
      appendChild(element: typeof styleElement) {
        styleElement = element
      },
    },
  } as unknown as Document
}

describe("canvas theme preset", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("formats light and dark css variable scopes", () => {
    expect(getCanvasThemePresetCss(preset)).toContain(":root")
    expect(getCanvasThemePresetCss(preset)).toContain(".dark")
    expect(getCanvasThemePresetCss(preset)).toContain("--background: #ffffff;")
    expect(getCanvasThemePresetCss(preset)).toContain("--background: #111111;")
  })

  it("keeps sidebar tokens derived from the base theme pipeline", () => {
    const css = canvasThemePresets
      .map((themePreset) => getCanvasThemePresetCss(themePreset))
      .join("\n")

    expect(css).not.toMatch(/--sidebar(?:-[\w-]+)?:/)
  })

  it("writes and clears the managed theme style element", () => {
    vi.stubGlobal("document", createDocumentMock())

    applyCanvasThemePreset(preset)

    expect(document.getElementById("react-canvas-theme-preset")?.textContent).toContain(
      "--foreground: #111111;"
    )

    applyCanvasThemePreset({
      id: "default",
      label: "Default",
      lightCssVariables: {},
    })

    expect(document.getElementById("react-canvas-theme-preset")).toBeNull()
  })
})
