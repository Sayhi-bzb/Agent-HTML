import { canvasThemeVariableNames } from "#agent-html-playground/theme/theme-variables"
import { hostApiRoutes } from "../api/api"

type CanvasThemeCssVariables = Partial<Record<`--${string}`, string>>

export const canvasThemeChangeMessageType = "agent-html:canvas-theme-change"
export const canvasThemeRequestMessageType = "agent-html:canvas-theme-request"
export const canvasThemeBootstrapMessageType =
  "agent-html:canvas-theme-bootstrap"
export const canvasThemeSnapshotVersion = 1

export const canvasThemeSyncVariableNames = canvasThemeVariableNames
export const canvasThemeFontStylesheetPath = hostApiRoutes.fontStylesheet

export type CanvasThemeMode = "dark" | "light" | "system"

export type CanvasThemeSnapshot = {
  darkCssVariables: CanvasThemeCssVariables
  draftCssVariables: CanvasThemeCssVariables
  fontStylesheetPaths: string[]
  lightCssVariables: CanvasThemeCssVariables
  mode: CanvasThemeMode
  presetId: string
  version: typeof canvasThemeSnapshotVersion
}

export type CanvasThemeChangeMessage = {
  snapshot: CanvasThemeSnapshot
  type: typeof canvasThemeChangeMessageType
}

export type CanvasThemeRequestMessage = {
  requestId: string
  type: typeof canvasThemeRequestMessageType
  version: typeof canvasThemeSnapshotVersion
}

export type CanvasThemeBootstrapMessage = {
  requestId: string
  snapshot: CanvasThemeSnapshot | null
  type: typeof canvasThemeBootstrapMessageType
  version: typeof canvasThemeSnapshotVersion
}

const canvasThemeVariableNameSet = new Set<string>(
  canvasThemeSyncVariableNames
)
const unsafeCssValue = /[;{}@]|url\s*\(/i
const maximumCssValueLength = 512
const validRequestId = /^[a-zA-Z0-9_-]{16,128}$/
const fontStylesheetPathPrefix = `${canvasThemeFontStylesheetPath}?url=`
const maximumFontStylesheetPathCount = 8
const maximumFontStylesheetPathLength = 2048
const themeRuntimeValidationOrigin = "https://agent-html-runtime.invalid"

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

function isAllowedFontStylesheetSource(value: string) {
  let sourceUrl: URL
  try {
    sourceUrl = new URL(value)
  } catch {
    return false
  }

  return (
    sourceUrl.protocol === "https:" &&
    ((sourceUrl.hostname === "fonts.googleapis.com" &&
      sourceUrl.pathname === "/css2") ||
      (sourceUrl.hostname === "fontsapi.zeoseven.com" &&
        sourceUrl.pathname.endsWith("/result.css")))
  )
}

function readFontStylesheetPaths(value: unknown): string[] | null {
  if (value === undefined) {
    return []
  }
  if (!Array.isArray(value) || value.length > maximumFontStylesheetPathCount) {
    return null
  }

  const paths: string[] = []
  for (const rawPath of value) {
    if (
      typeof rawPath !== "string" ||
      rawPath.length === 0 ||
      rawPath.length > maximumFontStylesheetPathLength ||
      rawPath !== rawPath.trim() ||
      !rawPath.startsWith(fontStylesheetPathPrefix)
    ) {
      return null
    }

    let pathUrl: URL
    try {
      pathUrl = new URL(rawPath, themeRuntimeValidationOrigin)
    } catch {
      return null
    }

    const sourceUrls = pathUrl.searchParams.getAll("url")
    if (
      pathUrl.origin !== themeRuntimeValidationOrigin ||
      pathUrl.pathname !== canvasThemeFontStylesheetPath ||
      pathUrl.hash ||
      Array.from(pathUrl.searchParams.keys()).some((key) => key !== "url") ||
      sourceUrls.length !== 1 ||
      !isAllowedFontStylesheetSource(sourceUrls[0])
    ) {
      return null
    }

    if (!paths.includes(rawPath)) {
      paths.push(rawPath)
    }
  }

  return paths
}

export function createCanvasThemeChangeMessage(
  snapshot: CanvasThemeSnapshot
): CanvasThemeChangeMessage {
  return {
    snapshot,
    type: canvasThemeChangeMessageType,
  }
}

export function createCanvasThemeRequestMessage(
  requestId: string
): CanvasThemeRequestMessage {
  return {
    requestId,
    type: canvasThemeRequestMessageType,
    version: canvasThemeSnapshotVersion,
  }
}

export function createCanvasThemeBootstrapMessage({
  requestId,
  snapshot,
}: {
  requestId: string
  snapshot: CanvasThemeSnapshot | null
}): CanvasThemeBootstrapMessage {
  return {
    requestId,
    snapshot,
    type: canvasThemeBootstrapMessageType,
    version: canvasThemeSnapshotVersion,
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

export function readCanvasThemeRequestMessage(
  value: unknown
): CanvasThemeRequestMessage | null {
  if (
    !isRecord(value) ||
    value.type !== canvasThemeRequestMessageType ||
    value.version !== canvasThemeSnapshotVersion ||
    typeof value.requestId !== "string" ||
    !validRequestId.test(value.requestId)
  ) {
    return null
  }

  return createCanvasThemeRequestMessage(value.requestId)
}

export function readCanvasThemeBootstrapMessage(
  value: unknown
): CanvasThemeBootstrapMessage | null {
  if (
    !isRecord(value) ||
    value.type !== canvasThemeBootstrapMessageType ||
    value.version !== canvasThemeSnapshotVersion ||
    typeof value.requestId !== "string" ||
    !validRequestId.test(value.requestId)
  ) {
    return null
  }

  if (value.snapshot === null) {
    return createCanvasThemeBootstrapMessage({
      requestId: value.requestId,
      snapshot: null,
    })
  }

  const snapshot = readCanvasThemeSnapshot(value.snapshot)
  return snapshot
    ? createCanvasThemeBootstrapMessage({
        requestId: value.requestId,
        snapshot,
      })
    : null
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
  const fontStylesheetPaths = readFontStylesheetPaths(
    snapshot.fontStylesheetPaths
  )

  if (
    !lightCssVariables ||
    !darkCssVariables ||
    !draftCssVariables ||
    !fontStylesheetPaths
  ) {
    return null
  }

  return {
    darkCssVariables,
    draftCssVariables,
    fontStylesheetPaths,
    lightCssVariables,
    mode: snapshot.mode,
    presetId: snapshot.presetId,
    version: canvasThemeSnapshotVersion,
  }
}
