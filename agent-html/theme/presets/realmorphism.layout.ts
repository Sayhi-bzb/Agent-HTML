import type { CanvasThemePresetLayout } from "../presets"

export const layout = {
  bodyClassName: "antialiased",
  fonts: [
    { family: "Inter", provider: "google", variable: "--font-sans" },
    { family: "Georgia", provider: "system", variable: "--font-serif" },
    { family: "JetBrains Mono", provider: "google", variable: "--font-mono" },
  ],
} satisfies CanvasThemePresetLayout
