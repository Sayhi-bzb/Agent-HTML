import type { CanvasThemePresetLayout } from "../presets"

export const layout = {
  bodyClassName: "antialiased",
  fonts: [
    { family: "Poppins", provider: "google", variable: "--font-sans" },
    { family: "Lora", provider: "google", variable: "--font-serif" },
    { family: "Fira Code", provider: "google", variable: "--font-mono" },
  ],
} satisfies CanvasThemePresetLayout
