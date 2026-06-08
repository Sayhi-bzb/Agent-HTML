import { afterEach, describe, expect, it, vi } from "vitest"

import {
  applyCanvasThemePreset,
  getCanvasThemePresetCss,
} from "./theme-preset"
import {
  createCanvasThemePresetFromCss,
  parseCanvasThemePresetCss,
} from "#agent-html-playground/theme/preset-css"
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

  it("normalizes shadcn css files into canvas theme variables", () => {
    const parsed = parseCanvasThemePresetCss(`
      @import "tailwindcss";

      :root {
        --background: #ffffff;
        --foreground: #111111;
        --sidebar: #eeeeee;
        --radius: 0.5rem;
      }

      .dark {
        --background: #111111;
        --sidebar: #000000;
      }

      @theme inline {
        --color-background: var(--background);
      }

      @layer base {
        body {
          @apply bg-background text-foreground;
        }
      }
    `)

    expect(parsed.lightCssVariables).toEqual({
      "--background": "#ffffff",
      "--foreground": "#111111",
      "--radius": "0.5rem",
    })
    expect(parsed.darkCssVariables).toEqual({
      "--background": "#111111",
    })
  })

  it("creates registered presets from shadcn css sources", () => {
    const normalizedPreset = createCanvasThemePresetFromCss({
      css: `
        :root {
          --background: #ffffff;
        }
      `,
      id: "source",
      label: "Source",
    })

    expect(normalizedPreset).toEqual({
      id: "source",
      label: "Source",
      lightCssVariables: {
        "--background": "#ffffff",
      },
    })
  })

  it("loads css registered presets without sidebar overrides", () => {
    const presetIds = canvasThemePresets.map((themePreset) => themePreset.id)

    expect(presetIds).toContain("claude-plus")
    expect(presetIds).toContain("vscode")
    expect(
      canvasThemePresets.find((themePreset) => themePreset.id === "manga")
        ?.layout
    ).toMatchObject({
      bodyClassName: "antialiased",
      fonts: [
        {
          family: "Architects Daughter",
          provider: "google",
          variable: "--font-sans",
        },
        {
          family: "Architects Daughter",
          provider: "google",
          variable: "--font-serif",
        },
        {
          family: "Architects Daughter",
          provider: "google",
          variable: "--font-mono",
        },
      ],
    })
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
