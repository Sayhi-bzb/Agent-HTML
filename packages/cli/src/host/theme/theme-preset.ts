import type { CanvasThemePreset } from "#agent-html-playground/theme/presets"

const canvasThemePresetStyleId = "react-canvas-theme-preset"

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
