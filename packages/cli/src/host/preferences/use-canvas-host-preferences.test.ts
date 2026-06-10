import { describe, expect, it } from "vitest"

import { createCanvasHostPreferencesPatch } from "./use-canvas-host-preferences"

describe("createCanvasHostPreferencesPatch", () => {
  const baseState = {
    activeCodexThreadId: "thread-1",
    activeLanguage: "zh" as const,
    activeSidebarView: "gallery" as const,
    activeThemeEditorSectionId: "color" as const,
    activeThemeMode: "dark" as const,
    activeThemePresetId: "claude-plus" as const,
    createArtifactJob: null,
    leftSidebarOpen: false,
  }

  it("omits activeFilePath when there are no artifacts to persist", () => {
    expect(
      createCanvasHostPreferencesPatch({
        ...baseState,
        activeFilePath: undefined,
      })
    ).not.toHaveProperty("activeFilePath")
  })

  it("persists activeFilePath when artifact selection is available", () => {
    expect(
      createCanvasHostPreferencesPatch({
        ...baseState,
        activeFilePath: "agent-html/artifacts/example.artifact.tsx",
      })
    ).toMatchObject({
      activeFilePath: "agent-html/artifacts/example.artifact.tsx",
    })
  })
})
