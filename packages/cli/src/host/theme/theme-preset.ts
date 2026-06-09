import type { CanvasThemePreset } from "#agent-html-playground/theme/presets"
import type { CanvasHostThemeMode } from "../preferences/canvas-host-preferences"

const canvasThemePresetStyleId = "react-canvas-theme-preset"
const darkColorSchemeQuery = "(prefers-color-scheme: dark)"

function formatCssVariables(variables: CanvasThemePreset["lightCssVariables"]) {
  return Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n")
}

export function getCanvasThemePresetCss(preset: CanvasThemePreset) {
  if (preset.id === "default") {
    return ""
  }

  const lightVariables = formatCssVariables(preset.lightCssVariables)
  const darkVariables = preset.darkCssVariables
    ? formatCssVariables(preset.darkCssVariables)
    : ""

  return [
    lightVariables ? `:root {\n${lightVariables}\n}` : null,
    darkVariables ? `.dark {\n${darkVariables}\n}` : null,
  ].filter(Boolean).join("\n\n")
}

export function applyCanvasThemePreset(preset: CanvasThemePreset) {
  const css = getCanvasThemePresetCss(preset)
  const existingStyle = document.getElementById(canvasThemePresetStyleId)

  if (!css) {
    existingStyle?.remove()
    return
  }

  const styleElement = existingStyle ?? document.createElement("style")
  styleElement.id = canvasThemePresetStyleId
  styleElement.textContent = css

  if (!existingStyle) {
    document.head.appendChild(styleElement)
  }
}

export function resolveCanvasThemeModeDark({
  matchMedia = window.matchMedia.bind(window),
  mode,
}: {
  matchMedia?: typeof window.matchMedia
  mode: CanvasHostThemeMode
}) {
  if (mode === "dark") {
    return true
  }
  if (mode === "light") {
    return false
  }

  return matchMedia(darkColorSchemeQuery).matches
}

export function applyCanvasThemeMode(mode: CanvasHostThemeMode) {
  document.documentElement.classList.toggle(
    "dark",
    resolveCanvasThemeModeDark({ mode })
  )
}

export function watchCanvasSystemThemeMode(
  onChange: () => void
): (() => void) | undefined {
  const query = window.matchMedia(darkColorSchemeQuery)

  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}
