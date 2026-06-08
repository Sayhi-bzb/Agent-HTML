import { createCanvasThemePresetFromCss } from "./preset-css"
import { layout as claudePlusLayout } from "./presets/claude-plus.layout"
import claudePlusCss from "./presets/claude-plus.css?raw"
import hexCss from "./presets/hex.css?raw"
import { layout as hexLayout } from "./presets/hex.layout"
import mangaCss from "./presets/manga.css?raw"
import { layout as mangaLayout } from "./presets/manga.layout"
import mimiCss from "./presets/mimi.css?raw"
import { layout as mimiLayout } from "./presets/mimi.layout"
import whatsappCss from "./presets/whatsapp.css?raw"
import { layout as whatsappLayout } from "./presets/whatsapp.layout"
import wondrousCss from "./presets/wondrous.css?raw"
import { layout as wondrousLayout } from "./presets/wondrous.layout"
import pixelQuestCss from "./presets/pixel-quest.css?raw"
import { layout as pixelQuestLayout } from "./presets/pixel-quest.layout"
import { lightCssVariables as pixelQuestLightCssVariables } from "./presets/pixel-quest.tokens"

export type CanvasThemeCssVariables = Partial<Record<`--${string}`, string>>

export type CanvasThemePreset = {
  darkCssVariables?: CanvasThemeCssVariables
  id: string
  label: string
  layout?: CanvasThemePresetLayout
  lightCssVariables: CanvasThemeCssVariables
}

export type CanvasThemePresetFontVariable =
  | "--font-heading"
  | "--font-mono"
  | "--font-sans"
  | "--font-serif"

type CanvasThemePresetBaseFont = {
  family: string
  variable: CanvasThemePresetFontVariable
}

export type CanvasThemePresetFont =
  | (CanvasThemePresetBaseFont & {
      provider: "google" | "system"
    })
  | (CanvasThemePresetBaseFont & {
      provider: "zeoseven"
      stylesheetUrl: string
    })

export type CanvasThemePresetLayout = {
  bodyClassName?: string
  fonts?: readonly CanvasThemePresetFont[]
}

type CanvasThemeCssPresetRegistration = {
  css: string
  id: string
  label: string
  layout?: CanvasThemePresetLayout
  lightCssVariables?: CanvasThemeCssVariables
  mirrorLightToDark?: boolean
}

const cssPresetRegistrations = [
  {
    css: claudePlusCss,
    id: "claude-plus",
    label: "Claude +",
    layout: claudePlusLayout,
  },
  {
    css: whatsappCss,
    id: "whatsapp",
    label: "WhatsApp",
    layout: whatsappLayout,
  },
  {
    css: wondrousCss,
    id: "wondrous",
    label: "Wondrous",
    layout: wondrousLayout,
  },
  {
    css: pixelQuestCss,
    id: "pixel-quest",
    label: "Pixel Quest",
    layout: pixelQuestLayout,
    lightCssVariables: pixelQuestLightCssVariables,
    mirrorLightToDark: true,
  },
  {
    css: mimiCss,
    id: "mimi",
    label: "Mimi",
    layout: mimiLayout,
  },
  {
    css: mangaCss,
    id: "manga",
    label: "Manga",
    layout: mangaLayout,
  },
  {
    css: hexCss,
    id: "hex",
    label: "Hex",
    layout: hexLayout,
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
