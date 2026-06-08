import type { CanvasThemePresetLayout } from "../presets"

export const layout = {
  bodyClassName: "antialiased",
  fonts: [
    { family: "Segoe UI", provider: "system", variable: "--font-sans" },
    { family: "Georgia", provider: "system", variable: "--font-serif" },
    { family: "SFMono Regular", provider: "system", variable: "--font-mono" },
  ],
} satisfies CanvasThemePresetLayout
