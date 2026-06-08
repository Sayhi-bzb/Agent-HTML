import colors from "tailwindcss/colors"

import type {
  CanvasThemeCssVariables,
  CanvasThemePreset,
} from "#agent-html-playground/theme/presets"
import {
  canvasThemeVariableNames,
  type CanvasThemeVariableName,
} from "#agent-html-playground/theme/theme-variables"

export type { CanvasThemeVariableName }

export type CanvasThemeDraft = {
  cssVariables: CanvasThemeCssVariables
}

export type CanvasThemeResolvedVariables = Partial<
  Record<CanvasThemeVariableName, string>
>

export type TailwindColorFamily = (typeof tailwindColorFamilies)[number]
export type TailwindColorStep = (typeof tailwindColorSteps)[number]

export type TailwindColorTokenValue = {
  family: TailwindColorFamily
  step: TailwindColorStep
}

export const tailwindColorFamilies = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "pink",
  "rose",
] as const

export const tailwindColorSteps = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const

type TailwindColorScale = Record<TailwindColorStep, string>

const tailwindColorScales = Object.fromEntries(
  tailwindColorFamilies.map((family) => [
    family,
    colors[family] as TailwindColorScale,
  ])
) as Record<TailwindColorFamily, TailwindColorScale>

const hexColorPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

function normalizeHexColor(value: string) {
  const match = value.trim().match(hexColorPattern)
  if (!match) {
    return null
  }

  const hex = match[1]
  return hex.length === 3
    ? `#${hex
        .split("")
        .map((character) => `${character}${character}`)
        .join("")}`.toLowerCase()
    : `#${hex.toLowerCase()}`
}

function parseHexColor(value: string) {
  const normalized = normalizeHexColor(value)
  if (!normalized) {
    return null
  }

  return {
    blue: Number.parseInt(normalized.slice(5, 7), 16),
    green: Number.parseInt(normalized.slice(3, 5), 16),
    red: Number.parseInt(normalized.slice(1, 3), 16),
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

function parseOklchColor(value: string) {
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
  const hue =
    match[3].toLowerCase() === "none" ? 0 : Number.parseFloat(match[3])
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

function parseColor(value: string) {
  return parseHexColor(value) ?? parseOklchColor(value)
}

function getColorDistance(left: ReturnType<typeof parseColor>, right: ReturnType<typeof parseColor>) {
  if (!left || !right) {
    return Number.POSITIVE_INFINITY
  }

  return (
    (left.red - right.red) ** 2 +
    (left.green - right.green) ** 2 +
    (left.blue - right.blue) ** 2
  )
}

const tailwindHexEntries = tailwindColorFamilies.flatMap((family) =>
  tailwindColorSteps.flatMap((step) => {
    const color = tailwindColorScales[family][step]
    const parsedColor = parseColor(color)

    return parsedColor
      ? [
          {
            color: parsedColor,
            value: { family, step },
          },
        ]
      : []
  })
)

export function createCanvasThemeDraftFromPreset(
  preset: CanvasThemePreset
): CanvasThemeDraft {
  return {
    cssVariables: { ...preset.lightCssVariables },
  }
}

export function createEmptyCanvasThemeDraft(): CanvasThemeDraft {
  return {
    cssVariables: {},
  }
}

export function resolveCanvasThemeCssVariables({
  draft,
  preset,
  runtimeVariables = {},
}: {
  draft: CanvasThemeDraft
  preset: CanvasThemePreset
  runtimeVariables?: CanvasThemeResolvedVariables
}) {
  return {
    ...runtimeVariables,
    ...preset.lightCssVariables,
    ...draft.cssVariables,
  } satisfies CanvasThemeCssVariables
}

export function getCanvasThemeCssVariableValue({
  draft,
  name,
  preset,
  runtimeVariables = {},
}: {
  draft: CanvasThemeDraft
  name: CanvasThemeVariableName
  preset: CanvasThemePreset
  runtimeVariables?: CanvasThemeResolvedVariables
}) {
  return (
    draft.cssVariables[name] ??
    preset.lightCssVariables[name] ??
    runtimeVariables[name] ??
    ""
  )
}

export function readCanvasThemeRuntimeVariables(
  style: CSSStyleDeclaration
): CanvasThemeResolvedVariables {
  return Object.fromEntries(
    canvasThemeVariableNames.flatMap((name) => {
      const value = style.getPropertyValue(name).trim()
      return value ? [[name, value]] : []
    })
  ) as CanvasThemeResolvedVariables
}

export function updateCanvasThemeDraftVariable({
  draft,
  name,
  value,
}: {
  draft: CanvasThemeDraft
  name: CanvasThemeVariableName
  value: string
}): CanvasThemeDraft {
  return {
    cssVariables: {
      ...draft.cssVariables,
      [name]: value,
    },
  }
}

export function isCanvasThemeDraftDirty(draft: CanvasThemeDraft) {
  return Object.keys(draft.cssVariables).length > 0
}

export function getTailwindColorValue({
  family,
  step,
}: TailwindColorTokenValue) {
  return tailwindColorScales[family][step]
}

export function findNearestTailwindColor(
  value: string
): TailwindColorTokenValue | null {
  const parsedColor = parseColor(value)
  if (!parsedColor) {
    return null
  }

  let nearest: TailwindColorTokenValue | null = null
  let nearestDistance = Number.POSITIVE_INFINITY

  for (const entry of tailwindHexEntries) {
    const distance = getColorDistance(parsedColor, entry.color)
    if (distance < nearestDistance) {
      nearest = entry.value
      nearestDistance = distance
    }
  }

  return nearest
}

export function parseCanvasThemeCssNumber(
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

export function formatCanvasThemeCssNumber(value: number, unit: string) {
  const rounded = Number(value.toFixed(3))
  return `${rounded}${unit}`
}

export function isCssColorPreviewable(value: string) {
  const trimmed = value.trim()
  return (
    trimmed.startsWith("#") ||
    trimmed.startsWith("rgb") ||
    trimmed.startsWith("hsl") ||
    trimmed.startsWith("oklch") ||
    trimmed.startsWith("color-mix") ||
    trimmed.startsWith("var(")
  )
}
