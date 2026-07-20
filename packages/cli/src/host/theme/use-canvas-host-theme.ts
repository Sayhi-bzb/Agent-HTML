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
import { publishCanvasTheme } from "./publish-canvas-theme"
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
  const [systemThemeRevision, setSystemThemeRevision] = React.useState(0)
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

    return watchCanvasSystemThemeMode(() => {
      applyCanvasThemeMode(activeThemeMode)
      setSystemThemeRevision((revision) => revision + 1)
    })
  }, [activeThemeMode])

  React.useEffect(() => {
    applyCanvasThemeEditorPreview(themeDraft)
  }, [themeDraft])

  React.useEffect(() => {
    publishCanvasTheme({
      draft: themeDraft,
      mode: activeThemeMode,
      preset: activeThemePreset,
    })

    const frameId = window.requestAnimationFrame(() => {
      setThemeRuntimeVariables(
        readCanvasThemeRuntimeVariables(
          window.getComputedStyle(document.documentElement)
        )
      )
    })
    return () => window.cancelAnimationFrame(frameId)
  }, [
    activeThemeMode,
    activeThemePreset,
    systemThemeRevision,
    themeDraft,
  ])

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
