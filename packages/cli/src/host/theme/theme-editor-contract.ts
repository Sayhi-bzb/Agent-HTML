export const canvasThemeEditorSectionIds = [
  "color",
  "typography",
  "radius",
  "spacing",
  "canvas",
] as const

export type CanvasThemeEditorSectionId =
  (typeof canvasThemeEditorSectionIds)[number]

export function isCanvasThemeEditorSectionId(
  value: unknown
): value is CanvasThemeEditorSectionId {
  return (canvasThemeEditorSectionIds as readonly unknown[]).includes(value)
}
