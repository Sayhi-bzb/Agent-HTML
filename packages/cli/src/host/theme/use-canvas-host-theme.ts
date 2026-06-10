import * as React from "react"

import {
  createEmptyCanvasThemeDraft,
  readCanvasThemeRuntimeVariables,
  updateCanvasThemeDraftVariable,
  type CanvasThemeDraft,
  type CanvasThemeResolvedVariables,
  type CanvasThemeVariableName,
} from "./theme-draft"
import { applyCanvasThemeEditorPreview } from "./theme-preview"
import { applyCanvasThemePresetLayout } from "./theme-layout"
import {
  applyCanvasThemeMode,
  applyCanvasThemePreset,
  watchCanvasSystemThemeMode,
} from "./theme-preset"
import {
  canvasThemePresets,
  type CanvasThemePresetId,
} from "#agent-html-playground/theme/presets"
import type { CanvasHostThemeMode } from "../preferences/canvas-host-preferences"

export function useCanvasHostTheme({
  activeThemeMode,
  activeThemePresetId,
}: {
  activeThemeMode: CanvasHostThemeMode
  activeThemePresetId: CanvasThemePresetId
}) {
  const [themeDraft, setThemeDraft] = React.useState<CanvasThemeDraft>(() =>
    createEmptyCanvasThemeDraft()
  )
  const [themeRuntimeVariables, setThemeRuntimeVariables] =
    React.useState<CanvasThemeResolvedVariables>({})
  const activeThemePreset =
    canvasThemePresets.find((preset) => preset.id === activeThemePresetId) ??
    canvasThemePresets[0]

  React.useEffect(() => {
    applyCanvasThemePreset(activeThemePreset)
    applyCanvasThemePresetLayout(activeThemePreset)
  }, [activeThemePreset])

  React.useEffect(() => {
    applyCanvasThemeMode(activeThemeMode)

    if (activeThemeMode !== "system") {
      return
    }

    return watchCanvasSystemThemeMode(() => applyCanvasThemeMode(activeThemeMode))
  }, [activeThemeMode])

  React.useEffect(() => {
    setThemeRuntimeVariables(
      readCanvasThemeRuntimeVariables(
        window.getComputedStyle(document.documentElement)
      )
    )
  }, [activeThemePreset])

  React.useEffect(() => {
    applyCanvasThemeEditorPreview(themeDraft)
  }, [themeDraft])

  const resetThemePreview = React.useCallback(() => {
    setThemeDraft(createEmptyCanvasThemeDraft())
  }, [])

  const updateThemeVariable = React.useCallback(
    (name: CanvasThemeVariableName, value: string) => {
      setThemeDraft((current) =>
        updateCanvasThemeDraftVariable({
          draft: current,
          name,
          value,
        })
      )
    },
    []
  )

  return {
    activeThemePreset,
    resetThemePreview,
    themeDraft,
    themePresets: canvasThemePresets,
    themeRuntimeVariables,
    updateThemeVariable,
  }
}
