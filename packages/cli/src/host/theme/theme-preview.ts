import type { CanvasThemeDraft } from "./theme-draft"

export const canvasThemeEditorPreviewStyleId =
  "react-canvas-theme-editor-preview"

export function getCanvasThemeEditorPreviewCss(draft: CanvasThemeDraft) {
  const variables = Object.entries(draft.cssVariables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n")

  return variables ? `:root {\n${variables}\n}` : ""
}

export function clearCanvasThemeEditorPreview() {
  document.getElementById(canvasThemeEditorPreviewStyleId)?.remove()
}

export function applyCanvasThemeEditorPreview(draft: CanvasThemeDraft) {
  const css = getCanvasThemeEditorPreviewCss(draft)
  const existingStyle = document.getElementById(canvasThemeEditorPreviewStyleId)

  if (!css) {
    existingStyle?.remove()
    return
  }

  const styleElement = existingStyle ?? document.createElement("style")
  styleElement.id = canvasThemeEditorPreviewStyleId
  styleElement.textContent = css

  if (!existingStyle) {
    document.head.appendChild(styleElement)
  }
}
