import type { AppThemeCssVariables } from "@/app/shared/app-theme/tokens"

export const managedRootVariableNames = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--destructive-foreground",
  "--border",
  "--input",
  "--ring",
  "--chart-1",
  "--chart-2",
  "--chart-3",
  "--chart-4",
  "--chart-5",
  "--sidebar",
  "--sidebar-foreground",
  "--sidebar-primary",
  "--sidebar-primary-foreground",
  "--sidebar-accent",
  "--sidebar-accent-foreground",
  "--sidebar-border",
  "--sidebar-ring",
  "--font-sans",
  "--font-serif",
  "--font-mono",
  "--radius",
  "--shadow-x",
  "--shadow-y",
  "--shadow-blur",
  "--shadow-spread",
  "--shadow-opacity",
  "--shadow-color",
  "--shadow-2xs",
  "--shadow-xs",
  "--shadow-sm",
  "--shadow",
  "--shadow-md",
  "--shadow-lg",
  "--shadow-xl",
  "--shadow-2xl",
  "--tracking-normal",
  "--spacing",
] as const

export type AppThemeVariableName = (typeof managedRootVariableNames)[number]

export const appThemeVariableDefaults: AppThemeCssVariables = {
  "--font-sans":
    '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  "--font-serif": 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  "--font-mono":
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  "--radius": "0.625rem",
  "--shadow-x": "0px",
  "--shadow-y": "1px",
  "--shadow-blur": "3px",
  "--shadow-spread": "0px",
  "--shadow-opacity": "0.1",
  "--shadow-color": "#000000",
  "--shadow-2xs": "0px 1px 3px 0px rgb(0 0 0 / 0.05)",
  "--shadow-xs": "0px 1px 3px 0px rgb(0 0 0 / 0.05)",
  "--shadow-sm":
    "0px 1px 3px 0px rgb(0 0 0 / 0.10), 0px 1px 2px -1px rgb(0 0 0 / 0.10)",
  "--shadow": "0px 1px 3px 0px rgb(0 0 0 / 0.10)",
  "--shadow-md":
    "0px 1px 3px 0px rgb(0 0 0 / 0.10), 0px 2px 4px -1px rgb(0 0 0 / 0.10)",
  "--shadow-lg":
    "0px 1px 3px 0px rgb(0 0 0 / 0.10), 0px 4px 6px -1px rgb(0 0 0 / 0.10)",
  "--shadow-xl":
    "0px 1px 3px 0px rgb(0 0 0 / 0.10), 0px 8px 10px -1px rgb(0 0 0 / 0.10)",
  "--shadow-2xl": "0px 1px 3px 0px rgb(0 0 0 / 0.25)",
  "--tracking-normal": "0em",
  "--spacing": "0.25rem",
}

export type AppThemeEditableVariableName =
  | "--font-sans"
  | "--font-serif"
  | "--font-mono"
  | "--radius"
  | "--shadow-x"
  | "--shadow-y"
  | "--shadow-blur"
  | "--shadow-spread"
  | "--shadow-opacity"
  | "--shadow-color"
  | "--shadow-2xs"
  | "--shadow-xs"
  | "--shadow-sm"
  | "--shadow"
  | "--shadow-md"
  | "--shadow-lg"
  | "--shadow-xl"
  | "--shadow-2xl"
  | "--tracking-normal"
  | "--spacing"

export const appThemeFontOptions = [
  {
    label: "Inter",
    value:
      '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  {
    label: "Geist",
    value: "Geist, ui-sans-serif, system-ui, sans-serif",
  },
  {
    label: "System",
    value: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  {
    label: "Serif",
    value: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },
  {
    label: "Mono",
    value:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
] as const

export function getAppThemeCssVariableValue(
  cssVariables: AppThemeCssVariables,
  name: AppThemeVariableName
) {
  return cssVariables[name] ?? appThemeVariableDefaults[name] ?? ""
}

export function parseAppThemeCssNumber(
  value: string | undefined,
  fallback: number
) {
  const match = value?.match(/-?\d+(?:\.\d+)?/)
  if (!match) {
    return fallback
  }

  const number = Number.parseFloat(match[0])
  return Number.isFinite(number) ? number : fallback
}

export function formatAppThemeCssNumber(value: number, unit: string) {
  const rounded = Number(value.toFixed(3))
  return `${rounded}${unit}`
}

function parseHexColorChannels(value: string) {
  const match = value.trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  if (!match) {
    return null
  }

  const normalized =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : match[1]

  return {
    blue: Number.parseInt(normalized.slice(4, 6), 16),
    green: Number.parseInt(normalized.slice(2, 4), 16),
    red: Number.parseInt(normalized.slice(0, 2), 16),
  }
}

function formatShadowColor(color: string, opacity: number) {
  const channels = parseHexColorChannels(color)
  if (channels) {
    return `rgb(${channels.red} ${channels.green} ${channels.blue} / ${opacity.toFixed(2)})`
  }

  return `color-mix(in srgb, ${color} ${Math.round(opacity * 100)}%, transparent)`
}

export function createAppThemeShadowScaleVariables(
  cssVariables: AppThemeCssVariables,
  changes: Partial<Record<AppThemeEditableVariableName, string>>
) {
  const nextVariables = {
    ...cssVariables,
    ...changes,
  }
  const x = getAppThemeCssVariableValue(nextVariables, "--shadow-x")
  const y = getAppThemeCssVariableValue(nextVariables, "--shadow-y")
  const blur = getAppThemeCssVariableValue(nextVariables, "--shadow-blur")
  const spread = getAppThemeCssVariableValue(nextVariables, "--shadow-spread")
  const color = getAppThemeCssVariableValue(nextVariables, "--shadow-color")
  const opacity = parseAppThemeCssNumber(
    getAppThemeCssVariableValue(nextVariables, "--shadow-opacity"),
    0.1
  )
  const shadowColor = formatShadowColor(color, opacity)
  const halfShadowColor = formatShadowColor(color, opacity * 0.5)
  const largeShadowColor = formatShadowColor(color, opacity * 2.5)

  return {
    ...changes,
    "--shadow-2xs": `${x} ${y} ${blur} ${spread} ${halfShadowColor}`,
    "--shadow-xs": `${x} ${y} ${blur} ${spread} ${halfShadowColor}`,
    "--shadow-sm": `${x} ${y} ${blur} ${spread} ${shadowColor}, ${x} 1px 2px -1px ${shadowColor}`,
    "--shadow": `${x} ${y} ${blur} ${spread} ${shadowColor}`,
    "--shadow-md": `${x} ${y} ${blur} ${spread} ${shadowColor}, ${x} 2px 4px -1px ${shadowColor}`,
    "--shadow-lg": `${x} ${y} ${blur} ${spread} ${shadowColor}, ${x} 4px 6px -1px ${shadowColor}`,
    "--shadow-xl": `${x} ${y} ${blur} ${spread} ${shadowColor}, ${x} 8px 10px -1px ${shadowColor}`,
    "--shadow-2xl": `${x} ${y} ${blur} ${spread} ${largeShadowColor}`,
  } satisfies Partial<Record<AppThemeEditableVariableName, string>>
}
