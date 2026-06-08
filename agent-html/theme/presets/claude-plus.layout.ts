import type { CanvasThemePresetLayout } from "../presets"

const claudePlusSansFontFamilies = [
  { family: "Outfit", provider: "google" },
  {
    family: "Maple Mono NF CN",
    provider: "zeoseven",
    stylesheetUrl: "https://fontsapi.zeoseven.com/442/main/result.css",
  },
] as const

export const layout = {
  bodyClassName: "antialiased",
  fonts: [
    { families: claudePlusSansFontFamilies, variable: "--font-sans" },
    { families: claudePlusSansFontFamilies, variable: "--font-heading" },
    { family: "Geist Mono", provider: "google", variable: "--font-mono" },
  ],
} satisfies CanvasThemePresetLayout
