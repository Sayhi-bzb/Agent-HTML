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

      @custom-variant dark (&:is(.dark *));

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

  it("normalizes preset layout fonts into css variables", () => {
    const normalizedPreset = createCanvasThemePresetFromCss({
      css: `
        :root {
          --background: #ffffff;
          --font-sans: Inter, sans-serif;
        }
      `,
      id: "source",
      label: "Source",
      layout: {
        fonts: [
          {
            family: "Architects Daughter",
            provider: "google",
            variable: "--font-sans",
          },
          {
            family: "JetBrains Mono",
            provider: "google",
            variable: "--font-mono",
          },
          {
            families: [
              { family: "Architects Daughter", provider: "google" },
              {
                family: "Fusion Pixel 12px Mono latin",
                provider: "zeoseven",
                stylesheetUrl:
                  "https://fontsapi.zeoseven.com/570/main/result.css",
              },
            ],
            variable: "--font-heading",
          },
        ],
      },
    })

    expect(normalizedPreset.lightCssVariables).toMatchObject({
      "--background": "#ffffff",
      "--font-heading":
        '"Architects Daughter", "Fusion Pixel 12px Mono latin", sans-serif',
      "--font-mono": '"JetBrains Mono", ui-monospace, monospace',
      "--font-sans": '"Architects Daughter", ui-sans-serif, sans-serif',
    })
  })

  it("loads css registered presets without sidebar overrides", () => {
    const presetIds = canvasThemePresets.map((themePreset) => themePreset.id)

    expect(presetIds).toContain("claude-plus")
    expect(presetIds).toContain("pixel-quest")
    expect(presetIds).not.toContain("realmorphism")
    expect(presetIds).not.toContain("sulav")
    expect(presetIds).not.toContain("vscode")
    expect(
      canvasThemePresets
        .find((themePreset) => themePreset.id === "pixel-quest")
        ?.layout?.fonts?.find((font) => font.variable === "--font-sans")
    ).toMatchObject({
      family: "Fusion Pixel 12px Mono latin",
      provider: "zeoseven",
      stylesheetUrl: "https://fontsapi.zeoseven.com/570/main/result.css",
      variable: "--font-sans",
    })
    expect(
      canvasThemePresets.find(
        (themePreset) => themePreset.id === "pixel-quest"
      )?.darkCssVariables
    ).toMatchObject({
      "--font-heading": '"Fusion Pixel 12px Mono latin", sans-serif',
      "--font-sans": '"Fusion Pixel 12px Mono latin", ui-sans-serif, sans-serif',
    })
    const mangaFonts = canvasThemePresets.find(
      (themePreset) => themePreset.id === "manga"
    )?.layout?.fonts

    expect(
      mangaFonts?.find((font) => font.variable === "--font-sans")
    ).toMatchObject({
      families: [
        { family: "Architects Daughter", provider: "google" },
        {
          family: "Acy",
          provider: "zeoseven",
          stylesheetUrl: "https://fontsapi.zeoseven.com/250/main/result.css",
        },
      ],
      variable: "--font-sans",
    })
    expect(
      mangaFonts?.find((font) => font.variable === "--font-mono")
    ).toMatchObject({
      family: "Geist Mono",
      provider: "google",
      variable: "--font-mono",
    })
  })

  it("normalizes manga Chinese handwriting fonts into css variables", () => {
    const mangaPreset = canvasThemePresets.find(
      (themePreset) => themePreset.id === "manga"
    )

    expect(mangaPreset?.lightCssVariables).toMatchObject({
      "--font-heading": '"Architects Daughter", Acy, sans-serif',
      "--font-mono": '"Geist Mono", ui-monospace, monospace',
      "--font-sans": '"Architects Daughter", Acy, ui-sans-serif, sans-serif',
      "--font-serif": '"Architects Daughter", Acy, ui-serif, serif',
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
