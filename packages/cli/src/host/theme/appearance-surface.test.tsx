// @vitest-environment jsdom

import { act, createElement } from "react"
import { createRoot } from "react-dom/client"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { canvasThemePresets } from "#agent-html-playground/theme/presets"
import { HostI18nProvider } from "../i18n/host-i18n"
import { createEmptyCanvasThemeDraft } from "./theme-draft"
import { AppearanceSurface } from "./appearance-surface"

globalThis.IS_REACT_ACT_ENVIRONMENT = true

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
    expect(markup).not.toContain("Preview clean")
    expect(markup).not.toContain("workspace-split-view__pane-footer")
    expect(markup).not.toContain('data-slot="sidebar"')
  })

  it("renders a fixed full-width reset action only for a dirty preview", () => {
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
          previewDirty: true,
          runtimeVariables: {},
        })
      )
    )

    expect(markup).toContain("workspace-split-view__pane-footer")
    expect(markup).toContain("appearance-surface__reset-preview")
    expect(markup).toContain("Reset preview")
    expect(markup).toContain("lucide-rotate-ccw")
    expect(markup).not.toContain("Preview clean")
  })

  it("resets a dirty preview from the pane footer", () => {
    const container = document.createElement("div")
    const root = createRoot(container)
    const onResetPreview = vi.fn()

    act(() =>
      root.render(
        createElement(
          HostI18nProvider,
          { language: "en" },
          createElement(AppearanceSurface, {
            activePresetId: "claude-plus",
            activeSectionId: "color",
            draft: createEmptyCanvasThemeDraft(),
            onResetPreview,
            onSelectPreset: vi.fn(),
            onSelectSection: vi.fn(),
            onVariableChange: vi.fn(),
            presets: canvasThemePresets,
            preview: createElement("div", null, "Artifact preview"),
            previewDirty: true,
            runtimeVariables: {},
          })
        )
      )
    )

    act(() =>
      container
        .querySelector<HTMLButtonElement>(
          ".appearance-surface__reset-preview"
        )!
        .click()
    )
    expect(onResetPreview).toHaveBeenCalledOnce()

    act(() => root.unmount())
  })
})
