import type { CanvasThemePresetLayout } from "../presets"

const mimiSansFontFamilies = [
  { family: "Poppins", provider: "google" },
  {
    family: "Nowar Rounded TW Wc",
    provider: "zeoseven",
    stylesheetUrl: "https://fontsapi.zeoseven.com/387/main/result.css",
  },
] as const

const mimiSerifFontFamilies = [
  { family: "Lora", provider: "google" },
  {
    family: "Noto Serif CJK",
    provider: "zeoseven",
    stylesheetUrl: "https://fontsapi.zeoseven.com/285/main/result.css",
  },
] as const

export const layout = {
  bodyClassName: "antialiased",
  fonts: [
    { families: mimiSansFontFamilies, variable: "--font-sans" },
    { families: mimiSansFontFamilies, variable: "--font-heading" },
    { families: mimiSerifFontFamilies, variable: "--font-serif" },
    { family: "Fira Code", provider: "google", variable: "--font-mono" },
  ],
} satisfies CanvasThemePresetLayout
