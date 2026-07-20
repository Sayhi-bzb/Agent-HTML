import { describe, expect, it } from "vitest"

import {
  canvasThemeChangeMessageType,
  canvasThemeSnapshotVersion,
  canvasThemeSyncVariableNames,
  createCanvasThemeChangeMessage,
  readCanvasThemeChangeMessage,
  type CanvasThemeSnapshot,
} from "./theme-sync-contract"
import { canvasThemeVariableNames } from "#agent-html-playground/theme/theme-variables"

const snapshot: CanvasThemeSnapshot = {
  darkCssVariables: { "--background": "oklch(0.2 0 0)" },
  draftCssVariables: { "--radius": "0.75rem" },
  lightCssVariables: { "--background": "oklch(1 0 0)" },
  mode: "system",
  presetId: "claude-plus",
  version: canvasThemeSnapshotVersion,
}

describe("canvas theme sync contract", () => {
  it("keeps the runtime protocol aligned with Canvas theme variables", () => {
    expect(canvasThemeSyncVariableNames).toEqual(canvasThemeVariableNames)
  })

  it("round-trips a canonical theme snapshot", () => {
    const message = createCanvasThemeChangeMessage(snapshot)

    expect(message.type).toBe(canvasThemeChangeMessageType)
    expect(readCanvasThemeChangeMessage(message)).toEqual(message)
  })

  it("rejects unknown tokens and declaration escapes", () => {
    expect(
      readCanvasThemeChangeMessage(
        createCanvasThemeChangeMessage({
          ...snapshot,
          lightCssVariables: { "--unknown": "red" },
        })
      )
    ).toBeNull()
    expect(
      readCanvasThemeChangeMessage(
        createCanvasThemeChangeMessage({
          ...snapshot,
          lightCssVariables: { "--background": "red; color: transparent" },
        })
      )
    ).toBeNull()
    expect(
      readCanvasThemeChangeMessage(
        createCanvasThemeChangeMessage({
          ...snapshot,
          lightCssVariables: { "--background": "url(https://example.com/x)" },
        })
      )
    ).toBeNull()
  })

  it("rejects incompatible versions and preset identifiers", () => {
    expect(
      readCanvasThemeChangeMessage({
        snapshot: { ...snapshot, version: 2 },
        type: canvasThemeChangeMessageType,
      })
    ).toBeNull()
    expect(
      readCanvasThemeChangeMessage(
        createCanvasThemeChangeMessage({ ...snapshot, presetId: "../unsafe" })
      )
    ).toBeNull()
  })
})
