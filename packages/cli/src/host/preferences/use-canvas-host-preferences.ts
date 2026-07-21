import * as React from "react"

import {
  writeCanvasHostPreferences,
  type CanvasCreateArtifactJob,
  type CanvasHostLanguage,
  type CanvasHostThemeMode,
  type CanvasSidebarView,
} from "./canvas-host-preferences"
import type { CanvasThemePresetId } from "#agent-html-playground/theme/presets"
import type { CanvasThemeEditorSectionId } from "../theme/theme-editor-contract"

export type CanvasHostPreferenceState = {
  activeCodexThreadId: string | null
  activeFilePath?: string | null
  activeLanguage: CanvasHostLanguage
  activeSidebarView: CanvasSidebarView
  activeThemeEditorSectionId: CanvasThemeEditorSectionId
  activeThemeMode: CanvasHostThemeMode
  activeThemePresetId: CanvasThemePresetId
  createArtifactJob: CanvasCreateArtifactJob | null
  leftSidebarOpen: boolean
}

export function useCanvasHostPreferencesPersistence({
  activeCodexThreadId,
  activeFilePath,
  activeLanguage,
  activeSidebarView,
  activeThemeEditorSectionId,
  activeThemeMode,
  activeThemePresetId,
  createArtifactJob,
  leftSidebarOpen,
}: CanvasHostPreferenceState) {
  React.useEffect(() => {
    writeCanvasHostPreferences(
      createCanvasHostPreferencesPatch({
        activeCodexThreadId,
        activeFilePath,
        activeLanguage,
        activeSidebarView,
        activeThemeEditorSectionId,
        activeThemeMode,
        activeThemePresetId,
        createArtifactJob,
        leftSidebarOpen,
      })
    )
  }, [
    activeCodexThreadId,
    activeFilePath,
    activeLanguage,
    activeSidebarView,
    activeThemeEditorSectionId,
    activeThemeMode,
    activeThemePresetId,
    createArtifactJob,
    leftSidebarOpen,
  ])
}

export function createCanvasHostPreferencesPatch({
  activeCodexThreadId,
  activeFilePath,
  activeLanguage,
  activeSidebarView,
  activeThemeEditorSectionId,
  activeThemeMode,
  activeThemePresetId,
  createArtifactJob,
  leftSidebarOpen,
}: CanvasHostPreferenceState) {
  const activeFilePathPatch =
    activeFilePath === undefined ? {} : { activeFilePath }

  return {
    activeCodexThreadId,
    ...activeFilePathPatch,
    activeLanguage,
    activeSidebarView,
    activeThemeEditorSectionId,
    activeThemeMode,
    activeThemePresetId,
    createArtifactJob,
    leftSidebarOpen,
  }
}
