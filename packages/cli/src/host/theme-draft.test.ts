import { describe, expect, it } from "vitest"

import {
  createCanvasThemeDraftFromPreset,
  findNearestTailwindColor,
  formatCanvasThemeCssNumber,
  getCanvasThemeCssVariableValue,
  parseCanvasThemeCssNumber,
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
  it("creates a draft from a preset and resolves edited variables", () => {
    const draft = updateCanvasThemeDraftVariable({
      draft: createCanvasThemeDraftFromPreset(preset),
      name: "--canvas-artifact-max-width",
      value: "52rem",
    })

    expect(
      getCanvasThemeCssVariableValue({
        draft,
        name: "--background",
        preset,
      })
    ).toBe("#ffffff")
    expect(
      getCanvasThemeCssVariableValue({
        draft,
        name: "--canvas-artifact-max-width",
        preset,
      })
    ).toBe("52rem")
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
