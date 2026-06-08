import type { CanvasThemePresetLayout } from "../presets"

export const layout = {
  bodyClassName: "antialiased",
  fonts: [
    { family: "Architects Daughter", provider: "google", variable: "--font-sans" },
    { family: "Architects Daughter", provider: "google", variable: "--font-serif" },
    { family: "Architects Daughter", provider: "google", variable: "--font-mono" },
  ],
} satisfies CanvasThemePresetLayout
