import type { AgentHtmlColorCssVariables } from "@/agent-html"

export type ExampleThemeId =
  | "default"
  | "claude"
  | "brutalist"
  | "whatsapp"
  | "hex"

export const exampleThemeStorageKey = "agent-html-example-theme"

export const exampleThemeOptions: ReadonlyArray<{
  label: string
  value: ExampleThemeId
}> = [
  { label: "Default", value: "default" },
  { label: "Claude+", value: "claude" },
  { label: "Brutalist", value: "brutalist" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Hex", value: "hex" },
]

export const exampleThemePresets: Record<
  ExampleThemeId,
  AgentHtmlColorCssVariables
> = {
  brutalist: {
    "--background": "oklch(0.9923 0.0104 91.4994)",
    "--foreground": "oklch(0.1759 0.0275 161.2531)",
    "--card": "oklch(1.0000 0 0)",
    "--card-foreground": "oklch(0.1759 0.0275 161.2531)",
    "--popover": "oklch(1.0000 0 0)",
    "--popover-foreground": "oklch(0.1759 0.0275 161.2531)",
    "--primary": "oklch(0.5687 0.1498 151.9380)",
    "--primary-foreground": "oklch(1.0000 0 0)",
    "--secondary": "oklch(0.6088 0.2498 29.2339)",
    "--secondary-foreground": "oklch(1.0000 0 0)",
    "--muted": "oklch(0.9465 0.0314 91.6628)",
    "--muted-foreground": "oklch(0.3525 0.0379 91.7268)",
    "--accent": "oklch(0.7721 0.1727 64.1585)",
    "--accent-foreground": "oklch(0.1759 0.0275 161.2531)",
    "--destructive": "oklch(0.5799 0.2380 29.2339)",
    "--destructive-foreground": "oklch(1.0000 0 0)",
    "--border": "oklch(0 0 0)",
    "--input": "oklch(1.0000 0 0)",
    "--ring": "oklch(0.5687 0.1498 151.9380)",
    "--chart-1": "oklch(0.5687 0.1498 151.9380)",
    "--chart-2": "oklch(0.6088 0.2498 29.2339)",
    "--chart-3": "oklch(0.7721 0.1727 64.1585)",
    "--chart-4": "oklch(0.6829 0.2615 345.7533)",
    "--chart-5": "oklch(0.7443 0.1347 219.0676)",
    "--sidebar": "oklch(0.3167 0.0793 154.3757)",
    "--sidebar-foreground": "oklch(1.0000 0 0)",
    "--sidebar-primary": "oklch(0.7721 0.1727 64.1585)",
    "--sidebar-primary-foreground": "oklch(0.3167 0.0793 154.3757)",
    "--sidebar-accent": "oklch(0.4156 0.1071 152.9714)",
    "--sidebar-accent-foreground": "oklch(1.0000 0 0)",
    "--sidebar-border": "oklch(0 0 0)",
    "--sidebar-ring": "oklch(0.7721 0.1727 64.1585)",
    "--font-sans": "'Montserrat', sans-serif",
    "--font-serif": "'Lora', serif",
    "--font-mono": "'Space Mono', monospace",
    "--radius": "0px",
    "--shadow-x": "4px",
    "--shadow-y": "4px",
    "--shadow-blur": "0px",
    "--shadow-spread": "0px",
    "--shadow-opacity": "1",
    "--shadow-color": "hsl(0, 0%, 0%)",
    "--shadow-2xs": "4px 4px 0px 0px hsl(0 0% 0% / 0.50)",
    "--shadow-xs": "4px 4px 0px 0px hsl(0 0% 0% / 0.50)",
    "--shadow-sm":
      "4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 1px 2px -1px hsl(0 0% 0% / 1.00)",
    "--shadow":
      "4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 1px 2px -1px hsl(0 0% 0% / 1.00)",
    "--shadow-md":
      "4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 2px 4px -1px hsl(0 0% 0% / 1.00)",
    "--shadow-lg":
      "4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 4px 6px -1px hsl(0 0% 0% / 1.00)",
    "--shadow-xl":
      "4px 4px 0px 0px hsl(0 0% 0% / 1.00), 4px 8px 10px -1px hsl(0 0% 0% / 1.00)",
    "--shadow-2xl": "4px 4px 0px 0px hsl(0 0% 0% / 2.50)",
    "--tracking-normal": "0.02em",
    "--spacing": "0.25rem",
  },
  default: {},
  claude: {
    "--background": "oklch(0.9818 0.0054 95.0986)",
    "--foreground": "oklch(0.3438 0.0269 95.7226)",
    "--card": "oklch(0.9665 0.0067 97.3521)",
    "--card-foreground": "oklch(0.1908 0.0020 106.5859)",
    "--popover": "oklch(1.0000 0 0)",
    "--popover-foreground": "oklch(0.2671 0.0196 98.9390)",
    "--primary": "oklch(0.6171 0.1375 39.0427)",
    "--primary-foreground": "oklch(1.0000 0 0)",
    "--secondary": "oklch(0.9245 0.0138 92.9892)",
    "--secondary-foreground": "oklch(0.4334 0.0177 98.6048)",
    "--muted": "oklch(0.9341 0.0153 90.2390)",
    "--muted-foreground": "oklch(0.5341 0.0078 97.4503)",
    "--accent": "oklch(0.9245 0.0138 92.9892)",
    "--accent-foreground": "oklch(0.2671 0.0196 98.9390)",
    "--destructive": "oklch(0.1908 0.0020 106.5859)",
    "--destructive-foreground": "oklch(1.0000 0 0)",
    "--border": "oklch(0.8847 0.0069 97.3627)",
    "--input": "oklch(0.7621 0.0156 98.3528)",
    "--ring": "oklch(0.6171 0.1375 39.0427)",
    "--chart-1": "oklch(0.5583 0.1276 42.9956)",
    "--chart-2": "oklch(0.6898 0.1581 290.4107)",
    "--chart-3": "oklch(0.8816 0.0276 93.1280)",
    "--chart-4": "oklch(0.8822 0.0403 298.1792)",
    "--chart-5": "oklch(0.5608 0.1348 42.0584)",
    "--sidebar": "oklch(0.9663 0.0080 98.8792)",
    "--sidebar-foreground": "oklch(0.3590 0.0051 106.6524)",
    "--sidebar-primary": "oklch(0.6171 0.1375 39.0427)",
    "--sidebar-primary-foreground": "oklch(0.9881 0 0)",
    "--sidebar-accent": "oklch(0.9245 0.0138 92.9892)",
    "--sidebar-accent-foreground": "oklch(0.3250 0 0)",
    "--sidebar-border": "oklch(0.9401 0 0)",
    "--sidebar-ring": "oklch(0.7731 0 0)",
    "--font-sans": "Outfit, sans-serif",
    "--font-serif": 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    "--font-mono": "Geist Mono, ui-monospace, monospace",
    "--radius": "1rem",
    "--shadow-2xs": "0 1px 3px 0px hsl(0 0% 0% / 0.05)",
    "--shadow-xs": "0 1px 3px 0px hsl(0 0% 0% / 0.05)",
    "--shadow-sm":
      "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)",
    "--shadow":
      "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)",
    "--shadow-md":
      "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10)",
    "--shadow-lg":
      "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10)",
    "--shadow-xl":
      "0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10)",
    "--shadow-2xl": "0 1px 3px 0px hsl(0 0% 0% / 0.25)",
  },
  whatsapp: {
    "--background": "oklch(0.9605 0.0046 258.3248)",
    "--foreground": "oklch(0.2153 0.0187 235.1251)",
    "--card": "oklch(1.0000 0 0)",
    "--card-foreground": "oklch(0.2153 0.0187 235.1251)",
    "--popover": "oklch(1.0000 0 0)",
    "--popover-foreground": "oklch(0.2153 0.0187 235.1251)",
    "--primary": "oklch(0.4335 0.0754 182.2315)",
    "--primary-foreground": "oklch(1.0000 0 0)",
    "--secondary": "oklch(0.9644 0.0208 166.1014)",
    "--secondary-foreground": "oklch(0.4335 0.0754 182.2315)",
    "--muted": "oklch(0.9605 0.0046 258.3248)",
    "--muted-foreground": "oklch(0.5589 0.0255 233.7233)",
    "--accent": "oklch(0.7610 0.2015 149.7403)",
    "--accent-foreground": "oklch(1.0000 0 0)",
    "--destructive": "oklch(0.6257 0.2058 29.0773)",
    "--destructive-foreground": "oklch(1.0000 0 0)",
    "--border": "oklch(0.9436 0.0051 228.8204)",
    "--input": "oklch(0.9436 0.0051 228.8204)",
    "--ring": "oklch(0.7610 0.2015 149.7403)",
    "--chart-1": "oklch(0.7610 0.2015 149.7403)",
    "--chart-2": "oklch(0.4335 0.0754 182.2315)",
    "--chart-3": "oklch(0.5762 0.0995 182.3964)",
    "--chart-4": "oklch(0.7356 0.1370 232.8053)",
    "--chart-5": "oklch(0.6509 0.1283 170.4258)",
    "--sidebar": "oklch(1.0000 0 0)",
    "--sidebar-foreground": "oklch(0.2153 0.0187 235.1251)",
    "--sidebar-primary": "oklch(0.4335 0.0754 182.2315)",
    "--sidebar-primary-foreground": "oklch(1.0000 0 0)",
    "--sidebar-accent": "oklch(0.9644 0.0208 166.1014)",
    "--sidebar-accent-foreground": "oklch(0.4335 0.0754 182.2315)",
    "--sidebar-border": "oklch(0.9436 0.0051 228.8204)",
    "--sidebar-ring": "oklch(0.7610 0.2015 149.7403)",
    "--font-sans":
      "Segoe UI, Helvetica Neue, Helvetica, Lucida Grande, Arial, Ubuntu, Cantarell, Fira Sans, sans-serif",
    "--font-serif": "Georgia, serif",
    "--font-mono":
      "SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
    "--radius": "1rem",
    "--shadow-x": "0px",
    "--shadow-y": "2px",
    "--shadow-blur": "10px",
    "--shadow-spread": "0px",
    "--shadow-opacity": "0.1",
    "--shadow-color": "rgba(0,0,0,0.1)",
    "--shadow-2xs": "0px 2px 10px 0px hsl(0 0% 0% / 0.05)",
    "--shadow-xs": "0px 2px 10px 0px hsl(0 0% 0% / 0.05)",
    "--shadow-sm":
      "0px 2px 10px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10)",
    "--shadow":
      "0px 2px 10px 0px hsl(0 0% 0% / 0.10), 0px 1px 2px -1px hsl(0 0% 0% / 0.10)",
    "--shadow-md":
      "0px 2px 10px 0px hsl(0 0% 0% / 0.10), 0px 2px 4px -1px hsl(0 0% 0% / 0.10)",
    "--shadow-lg":
      "0px 2px 10px 0px hsl(0 0% 0% / 0.10), 0px 4px 6px -1px hsl(0 0% 0% / 0.10)",
    "--shadow-xl":
      "0px 2px 10px 0px hsl(0 0% 0% / 0.10), 0px 8px 10px -1px hsl(0 0% 0% / 0.10)",
    "--shadow-2xl": "0px 2px 10px 0px hsl(0 0% 0% / 0.25)",
    "--tracking-normal": "0em",
    "--spacing": "0.25rem",
  },
  hex: {
    "--background": "oklch(0 0 0)",
    "--foreground": "oklch(1.0000 0 0)",
    "--card": "oklch(0.1684 0 0)",
    "--card-foreground": "oklch(1.0000 0 0)",
    "--popover": "oklch(0.1684 0 0)",
    "--popover-foreground": "oklch(1.0000 0 0)",
    "--primary": "oklch(0.8141 0.2609 142.5342)",
    "--primary-foreground": "oklch(0.1684 0 0)",
    "--secondary": "oklch(0.2858 0.0036 286.1693)",
    "--secondary-foreground": "oklch(1.0000 0 0)",
    "--muted": "oklch(0.2230 0.0038 286.0840)",
    "--muted-foreground": "oklch(0.8230 0.0385 134.1394)",
    "--accent": "oklch(0.2230 0.0038 286.0840)",
    "--accent-foreground": "oklch(1.0000 0 0)",
    "--destructive": "oklch(0.6717 0.2204 37.7568)",
    "--destructive-foreground": "oklch(1.0000 0 0)",
    "--border": "oklch(0.2742 0.0111 278.1296)",
    "--input": "oklch(0.2230 0.0038 286.0840)",
    "--ring": "oklch(0.8141 0.2609 142.5342)",
    "--chart-1": "oklch(0.8141 0.2609 142.5342)",
    "--chart-2": "oklch(0.7711 0.1689 62.0881)",
    "--chart-3": "oklch(0.7066 0.1735 45.7092)",
    "--chart-4": "oklch(0.6717 0.2204 37.7568)",
    "--chart-5": "oklch(0.5450 0.0207 135.0186)",
    "--sidebar": "oklch(0 0 0)",
    "--sidebar-foreground": "oklch(1.0000 0 0)",
    "--sidebar-primary": "oklch(0.8141 0.2609 142.5342)",
    "--sidebar-primary-foreground": "oklch(0.1684 0 0)",
    "--sidebar-accent": "oklch(0.2230 0.0038 286.0840)",
    "--sidebar-accent-foreground": "oklch(1.0000 0 0)",
    "--sidebar-border": "oklch(0.2742 0.0111 278.1296)",
    "--sidebar-ring": "oklch(0.8141 0.2609 142.5342)",
    "--font-sans":
      '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    "--font-serif":
      'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    "--font-mono":
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    "--radius": "0.25rem",
    "--shadow-x": "0",
    "--shadow-y": "1px",
    "--shadow-blur": "24px",
    "--shadow-spread": "0px",
    "--shadow-opacity": "0.08",
    "--shadow-color": "#000000",
    "--shadow-2xs": "0 1px 24px 0px hsl(0 0% 0% / 0.04)",
    "--shadow-xs": "0 1px 24px 0px hsl(0 0% 0% / 0.04)",
    "--shadow-sm":
      "0 1px 24px 0px hsl(0 0% 0% / 0.08), 0 1px 2px -1px hsl(0 0% 0% / 0.08)",
    "--shadow":
      "0 1px 24px 0px hsl(0 0% 0% / 0.08), 0 1px 2px -1px hsl(0 0% 0% / 0.08)",
    "--shadow-md":
      "0 1px 24px 0px hsl(0 0% 0% / 0.08), 0 2px 4px -1px hsl(0 0% 0% / 0.08)",
    "--shadow-lg":
      "0 1px 24px 0px hsl(0 0% 0% / 0.08), 0 4px 6px -1px hsl(0 0% 0% / 0.08)",
    "--shadow-xl":
      "0 1px 24px 0px hsl(0 0% 0% / 0.08), 0 8px 10px -1px hsl(0 0% 0% / 0.08)",
    "--shadow-2xl": "0 1px 24px 0px hsl(0 0% 0% / 0.20)",
    "--tracking-normal": "0em",
    "--spacing": "0.25rem",
  },
}

export function isExampleThemeId(value: string): value is ExampleThemeId {
  return Object.hasOwn(exampleThemePresets, value)
}
