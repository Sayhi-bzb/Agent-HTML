import type { CanvasThemePresetLayout } from "../presets"

export const layout = {
  bodyClassName: "antialiased",
  fonts: [
    { family: "Oxanium", provider: "google", variable: "--font-sans" },
    { family: "Source Serif 4", provider: "google", variable: "--font-serif" },
    { family: "Geist Mono", provider: "google", variable: "--font-mono" },
  ],
} satisfies CanvasThemePresetLayout
