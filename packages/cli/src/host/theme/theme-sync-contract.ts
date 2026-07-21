type CanvasThemeCssVariables = Partial<Record<`--${string}`, string>>

export const canvasThemeChangeMessageType = "agent-html:canvas-theme-change"
export const canvasThemeSnapshotVersion = 1

export const canvasThemeSyncVariableNames = [
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
  "--success",
  "--success-foreground",
  "--warning",
  "--warning-foreground",
  "--info",
  "--info-foreground",
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
  "--font-sans",
  "--font-heading",
  "--font-serif",
  "--font-mono",
  "--tracking-normal",
  "--radius",
  "--spacing",
  "--canvas-artifact-max-width",
  "--canvas-artifact-block-gap",
  "--shadow-2xs",
  "--shadow-xs",
  "--shadow-sm",
  "--shadow",
  "--shadow-md",
  "--shadow-lg",
  "--shadow-xl",
  "--shadow-2xl",
] as const

export type CanvasThemeMode = "dark" | "light" | "system"

export type CanvasThemeSnapshot = {
  darkCssVariables: CanvasThemeCssVariables
  draftCssVariables: CanvasThemeCssVariables
  lightCssVariables: CanvasThemeCssVariables
  mode: CanvasThemeMode
  presetId: string
  version: typeof canvasThemeSnapshotVersion
}

export type CanvasThemeChangeMessage = {
  snapshot: CanvasThemeSnapshot
  type: typeof canvasThemeChangeMessageType
}

const canvasThemeVariableNameSet = new Set<string>(
  canvasThemeSyncVariableNames
)
const unsafeCssValue = /[;{}@]|url\s*\(/i
const maximumCssValueLength = 512

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readCssVariables(value: unknown): CanvasThemeCssVariables | null {
  if (!isRecord(value)) {
    return null
  }

  const variables: CanvasThemeCssVariables = {}
  for (const [name, rawValue] of Object.entries(value)) {
    if (
      !canvasThemeVariableNameSet.has(name) ||
      typeof rawValue !== "string"
    ) {
      return null
    }

    const cssValue = rawValue.trim()
    if (
      !cssValue ||
      cssValue.length > maximumCssValueLength ||
      unsafeCssValue.test(cssValue)
    ) {
      return null
    }

    variables[name as keyof CanvasThemeCssVariables] = cssValue
  }

  return variables
}

function isCanvasThemeMode(value: unknown): value is CanvasThemeMode {
  return value === "dark" || value === "light" || value === "system"
}

export function createCanvasThemeChangeMessage(
  snapshot: CanvasThemeSnapshot
): CanvasThemeChangeMessage {
  return {
    snapshot,
    type: canvasThemeChangeMessageType,
  }
}

export function readCanvasThemeChangeMessage(
  value: unknown
): CanvasThemeChangeMessage | null {
  if (!isRecord(value) || value.type !== canvasThemeChangeMessageType) {
    return null
  }

  const snapshot = readCanvasThemeSnapshot(value.snapshot)
  return snapshot ? createCanvasThemeChangeMessage(snapshot) : null
}

export function readCanvasThemeSnapshot(
  value: unknown
): CanvasThemeSnapshot | null {
  const snapshot = value
  if (
    !isRecord(snapshot) ||
    snapshot.version !== canvasThemeSnapshotVersion ||
    !isCanvasThemeMode(snapshot.mode) ||
    typeof snapshot.presetId !== "string" ||
    !/^[a-z0-9][a-z0-9-]{0,63}$/.test(snapshot.presetId)
  ) {
    return null
  }

  const lightCssVariables = readCssVariables(snapshot.lightCssVariables)
  const darkCssVariables = readCssVariables(snapshot.darkCssVariables)
  const draftCssVariables = readCssVariables(snapshot.draftCssVariables)

  if (!lightCssVariables || !darkCssVariables || !draftCssVariables) {
    return null
  }

  return {
    darkCssVariables,
    draftCssVariables,
    lightCssVariables,
    mode: snapshot.mode,
    presetId: snapshot.presetId,
    version: canvasThemeSnapshotVersion,
  }
}
