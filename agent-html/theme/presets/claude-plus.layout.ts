import type { CanvasThemePresetLayout } from "../presets"

export const layout = {
  bodyClassName: "antialiased",
  fonts: [
    { family: "Outfit", provider: "google", variable: "--font-sans" },
    { family: "Geist Mono", provider: "google", variable: "--font-mono" },
  ],
} satisfies CanvasThemePresetLayout
