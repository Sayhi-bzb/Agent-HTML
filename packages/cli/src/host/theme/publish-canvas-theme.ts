import type { CanvasThemeDraft } from "./theme-draft"
import {
  canvasThemeSnapshotVersion,
  createCanvasThemeChangeMessage,
  type CanvasThemeMode,
} from "./theme-sync-contract"
import type { CanvasThemePreset } from "#agent-html-playground/theme/presets"

type ThemeMessageTarget = Pick<Window, "postMessage">

export function publishCanvasTheme({
  draft,
  mode,
  preset,
  target = window.parent,
}: {
  draft: CanvasThemeDraft
  mode: CanvasThemeMode
  preset: CanvasThemePreset
  target?: ThemeMessageTarget
}) {
  const message = createCanvasThemeChangeMessage({
    darkCssVariables: preset.darkCssVariables ?? {},
    draftCssVariables: draft.cssVariables,
    lightCssVariables: preset.lightCssVariables,
    mode,
    presetId: preset.id,
    version: canvasThemeSnapshotVersion,
  })

  target.postMessage(message, "*")
  return message
}
