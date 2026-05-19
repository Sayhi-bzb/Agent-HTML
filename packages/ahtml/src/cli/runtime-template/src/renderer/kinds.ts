export const runtimeRendererKinds = [
  "accordion",
  "choice-group",
  "choice-inline",
  "choice-overlay",
  "collection",
  "combobox-input",
  "compound",
  "primitive",
  "range-field",
  "select-overlay",
  "slider-field",
  "table",
  "tabs",
  "text-field",
  "toggle-field",
] as const

export type RendererKind = (typeof runtimeRendererKinds)[number]
