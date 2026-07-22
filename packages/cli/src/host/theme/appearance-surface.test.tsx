import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { canvasThemePresets } from "#agent-html-playground/theme/presets"
import { HostI18nProvider } from "../i18n/host-i18n"
import { createEmptyCanvasThemeDraft } from "./theme-draft"
import { AppearanceSurface } from "./appearance-surface"

describe("AppearanceSurface", () => {
  it("keeps the Gallery editor flow in a workspace surface", () => {
    const markup = renderToStaticMarkup(
      createElement(
        HostI18nProvider,
        { language: "en" },
        createElement(AppearanceSurface, {
          activePresetId: "claude-plus",
          activeSectionId: "color",
          draft: createEmptyCanvasThemeDraft(),
          onResetPreview: vi.fn(),
          onSelectPreset: vi.fn(),
          onSelectSection: vi.fn(),
          onVariableChange: vi.fn(),
          presets: canvasThemePresets,
          preview: createElement("div", null, "Artifact preview"),
          previewDirty: false,
          runtimeVariables: {},
        })
      )
    )

    expect(markup).toContain('class="workspace-split-view"')
    expect(markup).toContain('aria-label="Controls"')
    expect(markup).toContain('aria-label="Preview"')
    expect(markup).toContain("Artifact preview")
    expect(markup).toContain("Theme preset")
    expect(markup).toContain("Theme section")
    expect(markup).toContain("Preview clean")
    expect(markup).not.toContain('data-slot="sidebar"')
  })
})
