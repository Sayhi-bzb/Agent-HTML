import type { CanvasThemePresetLayout } from "../presets"

const fusionPixelFont = {
  family: "Fusion Pixel 12px Mono latin",
  provider: "zeoseven",
  stylesheetUrl: "https://fontsapi.zeoseven.com/570/main/result.css",
} as const

export const layout = {
  bodyClassName: "antialiased",
  fonts: [
    { ...fusionPixelFont, variable: "--font-sans" },
    { ...fusionPixelFont, variable: "--font-heading" },
    { ...fusionPixelFont, variable: "--font-serif" },
    { family: "Geist Mono", provider: "google", variable: "--font-mono" },
  ],
} satisfies CanvasThemePresetLayout
