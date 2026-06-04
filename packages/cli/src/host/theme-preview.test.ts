import { afterEach, describe, expect, it, vi } from "vitest"

import {
  applyCanvasThemeEditorPreview,
  canvasThemeEditorPreviewStyleId,
  clearCanvasThemeEditorPreview,
  getCanvasThemeEditorPreviewCss,
} from "./theme-preview"
import type { CanvasThemeDraft } from "./theme-draft"

const draft: CanvasThemeDraft = {
  cssVariables: {
    "--background": "#ffffff",
    "--canvas-artifact-block-gap": "2rem",
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

describe("canvas theme editor preview", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("formats preview css variables", () => {
    expect(getCanvasThemeEditorPreviewCss(draft)).toContain(":root")
    expect(getCanvasThemeEditorPreviewCss(draft)).toContain(
      "--canvas-artifact-block-gap: 2rem;"
    )
  })

  it("writes, updates, and clears the managed preview style element", () => {
    vi.stubGlobal("document", createDocumentMock())

    applyCanvasThemeEditorPreview(draft)

    expect(
      document.getElementById(canvasThemeEditorPreviewStyleId)?.textContent
    ).toContain("--background: #ffffff;")

    applyCanvasThemeEditorPreview({
      cssVariables: {
        "--background": "#111111",
      },
    })

    expect(
      document.getElementById(canvasThemeEditorPreviewStyleId)?.textContent
    ).toContain("--background: #111111;")

    clearCanvasThemeEditorPreview()

    expect(document.getElementById(canvasThemeEditorPreviewStyleId)).toBeNull()
  })
})
