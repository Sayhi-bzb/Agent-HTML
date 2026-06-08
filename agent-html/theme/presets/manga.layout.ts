import type { CanvasThemePresetLayout } from "../presets"

const mangaHandwritingFontFamilies = [
  { family: "Architects Daughter", provider: "google" },
  {
    family: "Acy",
    provider: "zeoseven",
    stylesheetUrl: "https://fontsapi.zeoseven.com/250/main/result.css",
  },
] as const

export const layout = {
  bodyClassName: "antialiased",
  fonts: [
    { families: mangaHandwritingFontFamilies, variable: "--font-sans" },
    { families: mangaHandwritingFontFamilies, variable: "--font-heading" },
    { families: mangaHandwritingFontFamilies, variable: "--font-serif" },
    { family: "Geist Mono", provider: "google", variable: "--font-mono" },
  ],
} satisfies CanvasThemePresetLayout
