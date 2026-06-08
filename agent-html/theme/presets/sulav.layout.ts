import type { CanvasThemePresetLayout } from "../presets"

export const layout = {
  bodyClassName: "antialiased",
  fonts: [
    { family: "Quicksand", provider: "google", variable: "--font-sans" },
    { family: "Libre Baskerville", provider: "google", variable: "--font-serif" },
    { family: "JetBrains Mono", provider: "google", variable: "--font-mono" },
  ],
} satisfies CanvasThemePresetLayout
