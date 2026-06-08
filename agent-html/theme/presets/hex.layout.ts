import type { CanvasThemePresetLayout } from "../presets"

const hexSansFontFamilies = [
  { family: "Inter", provider: "google" },
  {
    family: "Maple Mono NF CN",
    provider: "zeoseven",
    stylesheetUrl: "https://fontsapi.zeoseven.com/442/main/result.css",
  },
] as const

export const layout = {
  bodyClassName: "antialiased",
  fonts: [
    { families: hexSansFontFamilies, variable: "--font-sans" },
    { families: hexSansFontFamilies, variable: "--font-heading" },
  ],
} satisfies CanvasThemePresetLayout
