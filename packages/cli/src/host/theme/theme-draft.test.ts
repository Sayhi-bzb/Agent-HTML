import { describe, expect, it } from "vitest"

import {
  createCanvasThemeDraftFromPreset,
  createEmptyCanvasThemeDraft,
  findNearestTailwindColor,
  formatCanvasThemeCssNumber,
  getCanvasThemeCssVariableValue,
  parseCanvasThemeCssNumber,
  readCanvasThemeRuntimeVariables,
  updateCanvasThemeDraftVariable,
} from "./theme-draft"
import type { CanvasThemePreset } from "#agent-html-playground/theme/presets"

const preset: CanvasThemePreset = {
  id: "test",
  label: "Test",
  lightCssVariables: {
    "--background": "#ffffff",
    "--canvas-artifact-max-width": "44rem",
  },
}

describe("canvas theme draft", () => {
  it("resolves css variables from draft, preset, then runtime css", () => {
    const draft = updateCanvasThemeDraftVariable({
      draft: createEmptyCanvasThemeDraft(),
      name: "--canvas-artifact-max-width",
      value: "52rem",
    })
    const runtimeVariables = {
      "--background": "oklch(1 0 0)",
      "--canvas-artifact-block-gap": "2rem",
      "--canvas-artifact-max-width": "42rem",
    }

    expect(
      getCanvasThemeCssVariableValue({
        draft,
        name: "--background",
        preset,
        runtimeVariables,
      })
    ).toBe("#ffffff")
    expect(
      getCanvasThemeCssVariableValue({
        draft,
        name: "--canvas-artifact-max-width",
        preset,
        runtimeVariables,
      })
    ).toBe("52rem")
    expect(
      getCanvasThemeCssVariableValue({
        draft,
        name: "--canvas-artifact-block-gap",
        preset,
        runtimeVariables,
      })
    ).toBe("2rem")
  })

  it("creates a preview draft from preset variables", () => {
    expect(createCanvasThemeDraftFromPreset(preset).cssVariables).toEqual(
      preset.lightCssVariables
    )
  })

  it("reads runtime variables from computed style", () => {
    const values: Record<string, string> = {
      "--canvas-artifact-block-gap": " 2rem ",
      "--font-serif": " Georgia, serif ",
      "--success": " oklch(0.62 0.17 145) ",
      "--font-sans-source": " ignored ",
      "--shadow-opacity": " 0.5 ",
      "--sidebar": " ignored ",
    }
    const style = {
      getPropertyValue(name: string) {
        return values[name] ?? ""
      },
    } as CSSStyleDeclaration

    expect(readCanvasThemeRuntimeVariables(style)).toEqual({
      "--canvas-artifact-block-gap": "2rem",
      "--font-serif": "Georgia, serif",
      "--success": "oklch(0.62 0.17 145)",
    })
  })

  it("maps hex values to Tailwind color tokens", () => {
    expect(findNearestTailwindColor("#3b82f6")).toEqual({
      family: "blue",
      step: "500",
    })
  })

  it("parses and formats numeric css values", () => {
    expect(parseCanvasThemeCssNumber("42rem", 10)).toBe(42)
    expect(formatCanvasThemeCssNumber(1.23456, "rem")).toBe("1.235rem")
  })
})
