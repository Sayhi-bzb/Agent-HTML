export type CanvasThemeCssVariables = Partial<Record<`--${string}`, string>>

export type CanvasThemePreset = {
  darkCssVariables?: CanvasThemeCssVariables
  id: string
  label: string
  lightCssVariables: CanvasThemeCssVariables
}

export const canvasThemePresets = [
  {
    id: "default",
    label: "Default",
    lightCssVariables: {},
  },
  {
    id: "claude-plus",
    label: "Claude +",
    lightCssVariables: {
      "--background": "#faf9f5",
      "--foreground": "#3d3929",
      "--card": "#f5f4ef",
      "--card-foreground": "#141413",
      "--popover": "#ffffff",
      "--popover-foreground": "#28261b",
      "--primary": "#c96442",
      "--primary-foreground": "#ffffff",
      "--secondary": "#e9e6dc",
      "--secondary-foreground": "#535146",
      "--muted": "#ede9de",
      "--muted-foreground": "#6e6d68",
      "--accent": "#e9e6dc",
      "--accent-foreground": "#28261b",
      "--success": "#3f8f5f",
      "--success-foreground": "#ffffff",
      "--warning": "#b7791f",
      "--warning-foreground": "#ffffff",
      "--info": "#5f6ee8",
      "--info-foreground": "#ffffff",
      "--destructive": "#141413",
      "--border": "#dad9d4",
      "--input": "#b4b2a7",
      "--ring": "#c96442",
      "--chart-1": "#b05730",
      "--chart-2": "#9c87f5",
      "--chart-3": "#ded8c4",
      "--chart-4": "#dbd3f0",
      "--chart-5": "#b4552d",
      "--radius": "1rem",
    },
    darkCssVariables: {
      "--background": "#262624",
      "--foreground": "#f1f1ef",
      "--card": "#2c2c2b",
      "--card-foreground": "#faf9f5",
      "--popover": "#30302e",
      "--popover-foreground": "#e5e5e2",
      "--primary": "#d97757",
      "--primary-foreground": "#141413",
      "--secondary": "#faf9f5",
      "--secondary-foreground": "#30302e",
      "--muted": "#1b1b19",
      "--muted-foreground": "#b7b5a9",
      "--accent": "#1a1915",
      "--accent-foreground": "#f5f4ee",
      "--success": "#5fbf7a",
      "--success-foreground": "#141413",
      "--warning": "#d89b35",
      "--warning-foreground": "#141413",
      "--info": "#8f9cff",
      "--info-foreground": "#141413",
      "--destructive": "#ef4444",
      "--border": "#3e3e38",
      "--input": "#52514a",
      "--ring": "#d97757",
      "--chart-1": "#b05730",
      "--chart-2": "#9c87f5",
      "--chart-3": "#1a1915",
      "--chart-4": "#2f2b48",
      "--chart-5": "#b4552d",
      "--radius": "1rem",
    },
  },
] as const satisfies readonly CanvasThemePreset[]

export type CanvasThemePresetId = (typeof canvasThemePresets)[number]["id"]
