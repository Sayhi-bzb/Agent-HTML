import { describe, expect, it } from "vitest"

import {
  canvasThemeBootstrapMessageType,
  canvasThemeChangeMessageType,
  canvasThemeRequestMessageType,
  canvasThemeSnapshotVersion,
  canvasThemeSyncVariableNames,
  createCanvasThemeBootstrapMessage,
  createCanvasThemeChangeMessage,
  createCanvasThemeRequestMessage,
  readCanvasThemeBootstrapMessage,
  readCanvasThemeChangeMessage,
  readCanvasThemeRequestMessage,
  type CanvasThemeSnapshot,
} from "./theme-sync-contract"
import { canvasThemeVariableNames } from "#agent-html-playground/theme/theme-variables"

const snapshot: CanvasThemeSnapshot = {
  darkCssVariables: { "--background": "oklch(0.2 0 0)" },
  draftCssVariables: { "--radius": "0.75rem" },
  fontStylesheetPaths: [
    "/__agent-html/font-stylesheet?url=https%3A%2F%2Ffonts.googleapis.com%2Fcss2%3Ffamily%3DInter",
  ],
  lightCssVariables: { "--background": "oklch(1 0 0)" },
  mode: "system",
  presetId: "claude-plus",
  version: canvasThemeSnapshotVersion,
}
const requestId = "desktop-theme-request-1"

describe("canvas theme sync contract", () => {
  it("keeps the runtime protocol aligned with Canvas theme variables", () => {
    expect(canvasThemeSyncVariableNames).toBe(canvasThemeVariableNames)
  })

  it("round-trips a canonical theme snapshot", () => {
    const message = createCanvasThemeChangeMessage(snapshot)

    expect(message.type).toBe(canvasThemeChangeMessageType)
    expect(readCanvasThemeChangeMessage(message)).toEqual(message)
  })

  it("round-trips request and bootstrap messages", () => {
    const request = createCanvasThemeRequestMessage(requestId)
    const bootstrap = createCanvasThemeBootstrapMessage({ requestId, snapshot })

    expect(request.type).toBe(canvasThemeRequestMessageType)
    expect(bootstrap.type).toBe(canvasThemeBootstrapMessageType)
    expect(readCanvasThemeRequestMessage(request)).toEqual(request)
    expect(readCanvasThemeBootstrapMessage(bootstrap)).toEqual(bootstrap)
    expect(
      readCanvasThemeBootstrapMessage(
        createCanvasThemeBootstrapMessage({ requestId, snapshot: null })
      )
    ).toMatchObject({ requestId, snapshot: null })
  })

  it("rejects malformed bootstrap requests and payloads", () => {
    expect(
      readCanvasThemeRequestMessage({
        ...createCanvasThemeRequestMessage(requestId),
        requestId: "short",
      })
    ).toBeNull()
    expect(
      readCanvasThemeBootstrapMessage({
        ...createCanvasThemeBootstrapMessage({ requestId, snapshot }),
        snapshot: { ...snapshot, version: 2 },
      })
    ).toBeNull()
  })

  it("normalizes legacy snapshots without font stylesheets", () => {
    const legacySnapshot: Partial<CanvasThemeSnapshot> = { ...snapshot }
    delete legacySnapshot.fontStylesheetPaths

    expect(
      readCanvasThemeChangeMessage({
        snapshot: legacySnapshot,
        type: canvasThemeChangeMessageType,
      })?.snapshot.fontStylesheetPaths
    ).toEqual([])
  })

  it("rejects unsafe or unsupported font stylesheet paths", () => {
    for (const fontStylesheetPaths of [
      ["https://fonts.googleapis.com/css2?family=Inter"],
      ["//example.com/__agent-html/font-stylesheet?url=x"],
      [
        "/__agent-html/font-asset?url=https%3A%2F%2Ffonts.gstatic.com%2Fx.woff2",
      ],
      [
        "/__agent-html/font-stylesheet?url=https%3A%2F%2Fexample.com%2Ffont.css",
      ],
      [
        "/__agent-html/font-stylesheet?url=https%3A%2F%2Ffonts.googleapis.com%2Fcss2%3Ffamily%3DInter&next=https%3A%2F%2Fexample.com",
      ],
    ]) {
      expect(
        readCanvasThemeChangeMessage(
          createCanvasThemeChangeMessage({
            ...snapshot,
            fontStylesheetPaths,
          })
        )
      ).toBeNull()
    }
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
