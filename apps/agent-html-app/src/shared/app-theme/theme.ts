import colors from "tailwindcss/colors"

import type {
  AppColorFamily,
  AppColorStep,
  AppColorTokenName,
  AppColorTokenValue,
  AppColorTokenValues,
  AppThemeCssVariables,
  AppThemePresetId,
} from "@/app/shared/app-theme/tokens"
import {
  appColorFamilies,
  appColorSteps,
  appColorTokenDefaults,
  appThemePresets,
} from "@/app/shared/app-theme/tokens"
import {
  appThemeVariableDefaults,
  managedRootVariableNames,
  type AppThemeEditableVariableName,
  type AppThemeVariableName,
} from "@/app/shared/app-theme/variables"

type TailwindColorScale = Record<AppColorStep, string>

export type AppTokenThemeDraft = {
  colorTokenValues: AppColorTokenValues
  cssVariables: AppThemeCssVariables
  kind: "tokens"
}

type AppPresetThemeDraft = {
  darkCssVariables: AppThemeCssVariables
  id: AppThemePresetId
  kind: "preset"
  lightCssVariables: AppThemeCssVariables
}

export type AppThemeDraft = AppPresetThemeDraft | AppTokenThemeDraft

const appliedAppThemeStorageKey = "app:applied-theme"
const appAppliedThemeStyleId = "app-applied-theme-vars"
const appColorFamilySet = new Set<string>(appColorFamilies)
const appColorStepSet = new Set<string>(appColorSteps)

const tailwindColorFamilies = Object.fromEntries(
  (Object.keys(colors) as AppColorFamily[]).map((family) => [
    family,
    colors[family] as TailwindColorScale,
  ])
) as Record<AppColorFamily, TailwindColorScale>

type RgbColor = {
  blue: number
  green: number
  red: number
}

function parseHexColor(value: string | undefined): RgbColor | null {
  if (!value) {
    return null
  }

  const hexMatch = value.trim().match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  if (!hexMatch) {
    return null
  }

  const hexValue = hexMatch[1]
  const normalizedHex =
    hexValue.length === 3
      ? hexValue
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : hexValue

  return {
    blue: Number.parseInt(normalizedHex.slice(4, 6), 16),
    green: Number.parseInt(normalizedHex.slice(2, 4), 16),
    red: Number.parseInt(normalizedHex.slice(0, 2), 16),
  }
}

function clampColorChannel(value: number) {
  return Math.min(255, Math.max(0, Math.round(value * 255)))
}

function linearSrgbToSrgb(value: number) {
  return value >= 0.0031308
    ? 1.055 * value ** (1 / 2.4) - 0.055
    : 12.92 * value
}

function parseOklchColor(value: string | undefined): RgbColor | null {
  if (!value) {
    return null
  }

  const match = value
    .trim()
    .match(
      /^oklch\(\s*([0-9.]+)%?\s+([0-9.]+)\s+([0-9.]+|none)(?:deg)?(?:\s*\/\s*[0-9.]+%?)?\s*\)$/i
    )
  if (!match) {
    return null
  }

  const lightnessValue = Number.parseFloat(match[1])
  const lightness = match[1].includes("%")
    ? lightnessValue / 100
    : lightnessValue > 1
      ? lightnessValue / 100
      : lightnessValue
  const chroma = Number.parseFloat(match[2])
  const hue = match[3].toLowerCase() === "none" ? 0 : Number.parseFloat(match[3])
  const hueRadians = (hue * Math.PI) / 180

  const a = chroma * Math.cos(hueRadians)
  const b = chroma * Math.sin(hueRadians)
  const lPrime = lightness + 0.3963377774 * a + 0.2158037573 * b
  const mPrime = lightness - 0.1055613458 * a - 0.0638541728 * b
  const sPrime = lightness - 0.0894841775 * a - 1.291485548 * b
  const l = lPrime ** 3
  const m = mPrime ** 3
  const s = sPrime ** 3

  return {
    blue: clampColorChannel(
      linearSrgbToSrgb(
        0.055710120445510616 * l -
          0.2040210505984867 * m +
          1.0572251689370704 * s
      )
    ),
    green: clampColorChannel(
      linearSrgbToSrgb(
        -1.2684380040921763 * l +
          2.6097574006633715 * m -
          0.3413193963102197 * s
      )
    ),
    red: clampColorChannel(
      linearSrgbToSrgb(
        4.076741661347994 * l -
          3.307711590408193 * m +
          0.230969928729428 * s
      )
    ),
  }
}

function parseColor(value: string | undefined): RgbColor | null {
  return parseHexColor(value) ?? parseOklchColor(value)
}

const tailwindColorEntries = appColorFamilies.flatMap((family) =>
  appColorSteps.flatMap((step) => {
    const color = parseColor(tailwindColorFamilies[family]?.[step])

    return color
      ? [
          {
            color,
            value: { family, step },
          },
        ]
      : []
  })
)

function getColorDistance(left: RgbColor, right: RgbColor) {
  return (
    (left.red - right.red) ** 2 +
    (left.green - right.green) ** 2 +
    (left.blue - right.blue) ** 2
  )
}

function findNearestTailwindColor(value: string): AppColorTokenValue | null {
  const color = parseColor(value)
  if (!color) {
    return null
  }

  let nearestValue: AppColorTokenValue | null = null
  let nearestDistance = Number.POSITIVE_INFINITY

  for (const entry of tailwindColorEntries) {
    const distance = getColorDistance(color, entry.color)
    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestValue = entry.value
    }
  }

  return nearestValue
}

function resolveTokenColor(
  values: AppColorTokenValues,
  tokenName: keyof AppColorTokenValues
) {
  const token = values[tokenName]
  return (
    tailwindColorFamilies[token.family]?.[token.step] ??
    tailwindColorFamilies.zinc[500]
  )
}

function resolveTokenValueColor(value: AppColorTokenValue) {
  return (
    tailwindColorFamilies[value.family]?.[value.step] ??
    tailwindColorFamilies.zinc[500]
  )
}

function isCssVariables(value: unknown): value is AppThemeCssVariables {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  return Object.entries(value).every(([name, cssValue]) => {
    return (
      name.startsWith("--") &&
      typeof cssValue === "string" &&
      cssValue.trim().length > 0
    )
  })
}

function normalizeAppThemeCssVariables(
  value: unknown,
  defaults: AppThemeCssVariables = {}
) {
  const nextVariables = { ...defaults }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return nextVariables
  }

  for (const [name, cssValue] of Object.entries(value)) {
    if (
      managedRootVariableNames.includes(name as AppThemeVariableName) &&
      typeof cssValue === "string" &&
      cssValue.trim().length > 0
    ) {
      nextVariables[name as AppThemeVariableName] = cssValue
    }
  }

  return nextVariables
}

function parseTokenThemePayload(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  const parsedValue = value as Partial<{
    colorTokenValues: unknown
    cssVariables: unknown
  }>

  if (parsedValue.colorTokenValues) {
    return {
      colorTokenValues: parsedValue.colorTokenValues,
      cssVariables: parsedValue.cssVariables,
    }
  }

  return {
    colorTokenValues: value,
    cssVariables: undefined,
  }
}

function getManagedThemeStyleElement() {
  let styleElement = document.getElementById(appAppliedThemeStyleId)

  if (!styleElement) {
    styleElement = document.createElement("style")
    styleElement.id = appAppliedThemeStyleId
    document.head.appendChild(styleElement)
  }

  return styleElement
}

function formatCssVariables(variables: AppThemeCssVariables) {
  return Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n")
}

function applyManagedPresetTheme(
  lightCssVariables: AppThemeCssVariables,
  darkCssVariables: AppThemeCssVariables
) {
  const styleElement = getManagedThemeStyleElement()
  const lightVariables = formatCssVariables(lightCssVariables)
  const darkVariables = formatCssVariables(darkCssVariables)

  styleElement.textContent = `:root {\n${lightVariables}\n}\n\n.dark {\n${darkVariables}\n}\n`
}

function clearManagedPresetTheme() {
  const styleElement = document.getElementById(appAppliedThemeStyleId)
  styleElement?.remove()
}

function parseTokenThemeDraft(value: unknown): AppTokenThemeDraft | null {
  const payload = parseTokenThemePayload(value)
  if (!payload) {
    return null
  }

  const parsedValue = payload.colorTokenValues as Partial<
    Record<AppColorTokenName, Partial<{ family: string; step: string }>>
  >
  const nextValues = { ...appColorTokenDefaults }

  for (const tokenName of Object.keys(
    appColorTokenDefaults
  ) as AppColorTokenName[]) {
    const token = parsedValue[tokenName]
    if (
      !token ||
      !appColorFamilySet.has(token.family ?? "") ||
      !appColorStepSet.has(token.step ?? "")
    ) {
      return null
    }

    nextValues[tokenName] = {
      family: token.family as AppColorFamily,
      step: token.step as AppColorStep,
    }
  }

  return {
    colorTokenValues: nextValues,
    cssVariables: normalizeAppThemeCssVariables(
      payload.cssVariables,
      appThemeVariableDefaults
    ),
    kind: "tokens",
  }
}

function parseThemeDraft(value: unknown): AppThemeDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  const draft = value as Partial<{
    colorTokenValues: unknown
    darkCssVariables: unknown
    id: unknown
    kind: unknown
    lightCssVariables: unknown
  }>

  if (draft.kind === "tokens") {
    return parseTokenThemeDraft(draft.colorTokenValues)
  }

  if (
    draft.kind === "preset" &&
    typeof draft.id === "string" &&
    appThemePresets.some((preset) => preset.id === draft.id) &&
    isCssVariables(draft.lightCssVariables) &&
    isCssVariables(draft.darkCssVariables)
  ) {
    return {
      darkCssVariables: draft.darkCssVariables,
      id: draft.id as AppThemePresetId,
      kind: "preset",
      lightCssVariables: draft.lightCssVariables,
    }
  }

  return parseTokenThemeDraft(value)
}

export function createDefaultAppThemeDraft(): AppThemeDraft {
  return {
    colorTokenValues: appColorTokenDefaults,
    cssVariables: appThemeVariableDefaults,
    kind: "tokens",
  }
}

export function createAppPresetThemeDraft(
  presetId: AppThemePresetId
): AppThemeDraft | null {
  const preset = appThemePresets.find((item) => item.id === presetId)

  if (!preset) {
    return null
  }

  if (preset.id === "default") {
    return createDefaultAppThemeDraft()
  }

  return {
    darkCssVariables: preset.darkCssVariables ?? preset.lightCssVariables ?? {},
    id: preset.id,
    kind: "preset",
    lightCssVariables: preset.lightCssVariables ?? {},
  }
}

function resolveAppColorTokenCssVariables(
  values: AppColorTokenValues
) {
  return Object.fromEntries(
    Object.keys(values).map((tokenName) => [
      `--${tokenName}`,
      resolveTokenColor(values, tokenName as keyof AppColorTokenValues),
    ])
  ) as Record<`--${string}`, string>
}

function resolveAppTokenThemeCssVariables(draft: AppTokenThemeDraft) {
  return {
    ...appThemeVariableDefaults,
    ...draft.cssVariables,
    ...resolveAppColorTokenCssVariables(draft.colorTokenValues),
  }
}

function createAppTokenThemeDraftFromCssVariables(
  cssVariables: AppThemeCssVariables
): AppTokenThemeDraft {
  const colorTokenValues = { ...appColorTokenDefaults }

  for (const tokenName of Object.keys(
    appColorTokenDefaults
  ) as AppColorTokenName[]) {
    const cssValue = cssVariables[`--${tokenName}`]
    const tokenValue = cssValue ? findNearestTailwindColor(cssValue) : null

    if (tokenValue) {
      colorTokenValues[tokenName] = tokenValue
    }
  }

  return {
    colorTokenValues,
    cssVariables: normalizeAppThemeCssVariables(
      cssVariables,
      appThemeVariableDefaults
    ),
    kind: "tokens",
  }
}

export function resolveAppThemeColorTokenValues(
  draft: AppThemeDraft,
  resolvedMode: "dark" | "light" = "light"
) {
  if (draft.kind === "tokens") {
    return draft.colorTokenValues
  }

  return createAppTokenThemeDraftFromCssVariables(
    resolvedMode === "dark" ? draft.darkCssVariables : draft.lightCssVariables
  ).colorTokenValues
}

export function updateAppThemeDraftColorTokenValue({
  draft,
  resolvedMode = "light",
  token,
  value,
}: {
  draft: AppThemeDraft
  resolvedMode?: "dark" | "light"
  token: AppColorTokenName
  value: AppColorTokenValue
}): AppThemeDraft {
  if (draft.kind === "tokens") {
    return {
      colorTokenValues: {
        ...draft.colorTokenValues,
        [token]: value,
      },
      cssVariables: draft.cssVariables,
      kind: "tokens",
    }
  }

  const cssVariableName = `--${token}` as const
  const nextCssVariables = {
    ...(resolvedMode === "dark"
      ? draft.darkCssVariables
      : draft.lightCssVariables),
    [cssVariableName]: resolveTokenValueColor(value),
  }

  return {
    ...draft,
    darkCssVariables:
      resolvedMode === "dark" ? nextCssVariables : draft.darkCssVariables,
    lightCssVariables:
      resolvedMode === "light" ? nextCssVariables : draft.lightCssVariables,
  }
}

export function updateAppThemeDraftCssVariable({
  draft,
  name,
  resolvedMode = "light",
  value,
}: {
  draft: AppThemeDraft
  name: AppThemeEditableVariableName
  resolvedMode?: "dark" | "light"
  value: string
}): AppThemeDraft {
  if (draft.kind === "tokens") {
    return {
      colorTokenValues: draft.colorTokenValues,
      cssVariables: {
        ...draft.cssVariables,
        [name]: value,
      },
      kind: "tokens",
    }
  }

  const nextCssVariables = {
    ...(resolvedMode === "dark"
      ? draft.darkCssVariables
      : draft.lightCssVariables),
    [name]: value,
  }

  return {
    ...draft,
    darkCssVariables:
      resolvedMode === "dark" ? nextCssVariables : draft.darkCssVariables,
    lightCssVariables:
      resolvedMode === "light" ? nextCssVariables : draft.lightCssVariables,
  }
}

export function updateAppThemeDraftCssVariables({
  draft,
  resolvedMode = "light",
  values,
}: {
  draft: AppThemeDraft
  resolvedMode?: "dark" | "light"
  values: Partial<Record<AppThemeEditableVariableName, string>>
}): AppThemeDraft {
  if (draft.kind === "tokens") {
    return {
      colorTokenValues: draft.colorTokenValues,
      cssVariables: {
        ...draft.cssVariables,
        ...values,
      },
      kind: "tokens",
    }
  }

  const nextCssVariables = {
    ...(resolvedMode === "dark"
      ? draft.darkCssVariables
      : draft.lightCssVariables),
    ...values,
  }

  return {
    ...draft,
    darkCssVariables:
      resolvedMode === "dark" ? nextCssVariables : draft.darkCssVariables,
    lightCssVariables:
      resolvedMode === "light" ? nextCssVariables : draft.lightCssVariables,
  }
}

export function resolveAppThemeCssVariables(
  draft: AppThemeDraft,
  resolvedMode: "dark" | "light" = "light"
) {
  if (draft.kind === "preset") {
    return resolvedMode === "dark"
      ? draft.darkCssVariables
      : draft.lightCssVariables
  }

  return resolveAppTokenThemeCssVariables(draft)
}

export function areAppThemeDraftsEqual(
  left: AppThemeDraft,
  right: AppThemeDraft
) {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function applyAppTheme(draft: AppThemeDraft) {
  const root = document.documentElement

  if (draft.kind === "preset") {
    for (const name of managedRootVariableNames) {
      root.style.removeProperty(name)
    }

    applyManagedPresetTheme(draft.lightCssVariables, draft.darkCssVariables)
    return
  }

  clearManagedPresetTheme()
  const variables = resolveAppTokenThemeCssVariables(draft)

  for (const [name, value] of Object.entries(variables)) {
    if (typeof value === "string") {
      root.style.setProperty(name, value)
    }
  }
}

export function loadAppliedAppTheme() {
  const storedValue = localStorage.getItem(appliedAppThemeStorageKey)

  if (!storedValue) {
    return null
  }

  try {
    return parseThemeDraft(JSON.parse(storedValue))
  } catch {
    return null
  }
}

export function saveAppliedAppTheme(draft: AppThemeDraft) {
  localStorage.setItem(appliedAppThemeStorageKey, JSON.stringify(draft))
}
