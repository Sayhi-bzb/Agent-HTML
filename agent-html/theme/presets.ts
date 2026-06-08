import { createCanvasThemePresetFromCss } from "./preset-css"
import claudePlusCss from "./presets/claude-plus.css?raw"
import hexCss from "./presets/hex.css?raw"
import mangaCss from "./presets/manga.css?raw"
import mimiCss from "./presets/mimi.css?raw"
import realmorphismCss from "./presets/realmorphism.css?raw"
import sulavCss from "./presets/sulav.css?raw"
import vscodeCss from "./presets/vscode.css?raw"
import whatsappCss from "./presets/whatsapp.css?raw"
import wondrousCss from "./presets/wondrous.css?raw"

export type CanvasThemeCssVariables = Partial<Record<`--${string}`, string>>

export type CanvasThemePreset = {
  darkCssVariables?: CanvasThemeCssVariables
  id: string
  label: string
  lightCssVariables: CanvasThemeCssVariables
}

type CanvasThemeCssPresetRegistration = {
  css: string
  id: string
  label: string
}

const cssPresetRegistrations = [
  {
    css: claudePlusCss,
    id: "claude-plus",
    label: "Claude +",
  },
  {
    css: vscodeCss,
    id: "vscode",
    label: "VS Code",
  },
  {
    css: whatsappCss,
    id: "whatsapp",
    label: "WhatsApp",
  },
  {
    css: realmorphismCss,
    id: "realmorphism",
    label: "Realmorphism",
  },
  {
    css: sulavCss,
    id: "sulav",
    label: "Sulav",
  },
  {
    css: wondrousCss,
    id: "wondrous",
    label: "Wondrous",
  },
  {
    css: mimiCss,
    id: "mimi",
    label: "Mimi",
  },
  {
    css: mangaCss,
    id: "manga",
    label: "Manga",
  },
  {
    css: hexCss,
    id: "hex",
    label: "Hex",
  },
] as const satisfies readonly CanvasThemeCssPresetRegistration[]

export const canvasThemePresets = [
  {
    id: "default",
    label: "Default",
    lightCssVariables: {},
  },
  ...cssPresetRegistrations.map(createCanvasThemePresetFromCss),
] as const satisfies readonly CanvasThemePreset[]

export type CanvasThemePresetId = (typeof canvasThemePresets)[number]["id"]
