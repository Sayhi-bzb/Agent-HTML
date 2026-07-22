import * as React from "react"

import {
  writeCanvasHostPreferences,
  type CanvasCreateArtifactJob,
  type CanvasHostLanguage,
  type CanvasHostThemeMode,
} from "./canvas-host-preferences"
import type { CanvasThemePresetId } from "#agent-html-playground/theme/presets"
import type { CanvasThemeEditorSectionId } from "../theme/theme-editor-contract"
import type { WorkspaceTabSession } from "../navigation/workspace-tabs"

export type CanvasHostPreferenceState = {
  activeCodexThreadId: string | null
  activeFilePath?: string | null
  activeLanguage: CanvasHostLanguage
  activeThemeEditorSectionId: CanvasThemeEditorSectionId
  activeThemeMode: CanvasHostThemeMode
  activeThemePresetId: CanvasThemePresetId
  createArtifactJob: CanvasCreateArtifactJob | null
  workspaceTabSession: WorkspaceTabSession
}

export function useCanvasHostPreferencesPersistence({
  activeCodexThreadId,
  activeFilePath,
  activeLanguage,
  activeThemeEditorSectionId,
  activeThemeMode,
  activeThemePresetId,
  createArtifactJob,
  workspaceTabSession,
}: CanvasHostPreferenceState) {
  React.useEffect(() => {
    writeCanvasHostPreferences(
      createCanvasHostPreferencesPatch({
        activeCodexThreadId,
        activeFilePath,
        activeLanguage,
        activeThemeEditorSectionId,
        activeThemeMode,
        activeThemePresetId,
        createArtifactJob,
        workspaceTabSession,
      })
    )
  }, [
    activeCodexThreadId,
    activeFilePath,
    activeLanguage,
    activeThemeEditorSectionId,
    activeThemeMode,
    activeThemePresetId,
    createArtifactJob,
    workspaceTabSession,
  ])
}

export function createCanvasHostPreferencesPatch({
  activeCodexThreadId,
  activeFilePath,
  activeLanguage,
  activeThemeEditorSectionId,
  activeThemeMode,
  activeThemePresetId,
  createArtifactJob,
  workspaceTabSession,
}: CanvasHostPreferenceState) {
  const activeFilePathPatch =
    activeFilePath === undefined ? {} : { activeFilePath }

  return {
    activeCodexThreadId,
    ...activeFilePathPatch,
    activeLanguage,
    activeThemeEditorSectionId,
    activeThemeMode,
    activeThemePresetId,
    createArtifactJob,
    workspaceTabSession,
  }
}
