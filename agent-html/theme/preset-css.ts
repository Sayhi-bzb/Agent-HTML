import {
  canvasThemeVariableNames,
  type CanvasThemeVariableName,
} from "./theme-variables"
import type {
  CanvasThemeCssVariables,
  CanvasThemePreset,
  CanvasThemePresetLayout,
} from "./presets"

const cssVariableDeclarationPattern = /(--[a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g
const themeVariableNames = new Set<string>(canvasThemeVariableNames)
const fontFallbacks = {
  "--font-heading": "sans-serif",
  "--font-mono": "ui-monospace, monospace",
  "--font-sans": "ui-sans-serif, sans-serif",
  "--font-serif": "ui-serif, serif",
} as const satisfies Record<
  NonNullable<CanvasThemePresetLayout["fonts"]>[number]["variable"],
  string
>

function extractCssBlock(source: string, selector: string) {
  let searchIndex = 0

  while (searchIndex < source.length) {
    const selectorIndex = source.indexOf(selector, searchIndex)
    if (selectorIndex < 0) {
      return ""
    }

    const afterSelectorIndex = selectorIndex + selector.length
    const selectorSuffix = source.slice(afterSelectorIndex)
    const match = selectorSuffix.match(/^\s*\{/)

    if (!match) {
      searchIndex = afterSelectorIndex
      continue
    }

    const openingBraceIndex = afterSelectorIndex + match[0].lastIndexOf("{")
    let depth = 0

    for (let index = openingBraceIndex; index < source.length; index += 1) {
      const character = source[index]

      if (character === "{") {
        depth += 1
      }

      if (character === "}") {
        depth -= 1

        if (depth === 0) {
          return source.slice(openingBraceIndex + 1, index)
        }
      }
    }

    return ""
  }

  return ""
}

function parseThemeVariables(block: string): CanvasThemeCssVariables {
  return Object.fromEntries(
    Array.from(block.matchAll(cssVariableDeclarationPattern)).flatMap(
      ([, name, value]) => {
        if (!name || !value || !themeVariableNames.has(name)) {
          return []
        }

        return [[name as CanvasThemeVariableName, value.trim()]]
      }
    )
  ) satisfies CanvasThemeCssVariables
}

function quoteFontFamily(family: string) {
  const trimmedFamily = family.trim()

  if (!trimmedFamily) {
    return ""
  }

  if (/^["'].*["']$/.test(trimmedFamily)) {
    return trimmedFamily
  }

  return /\s/.test(trimmedFamily)
    ? `"${trimmedFamily.replaceAll('"', '\\"')}"`
    : trimmedFamily
}

function createLayoutFontVariables(
  layout: CanvasThemePresetLayout | undefined
): CanvasThemeCssVariables {
  return Object.fromEntries(
    (layout?.fonts ?? []).flatMap((font) => {
      const family = quoteFontFamily(font.family)

      if (!family) {
        return []
      }

      return [[font.variable, `${family}, ${fontFallbacks[font.variable]}`]]
    })
  ) satisfies CanvasThemeCssVariables
}

export function parseCanvasThemePresetCss(source: string) {
  return {
    darkCssVariables: parseThemeVariables(extractCssBlock(source, ".dark")),
    lightCssVariables: parseThemeVariables(extractCssBlock(source, ":root")),
  } satisfies Pick<
    CanvasThemePreset,
    "darkCssVariables" | "lightCssVariables"
  >
}

export function createCanvasThemePresetFromCss({
  css,
  id,
  label,
  layout,
  lightCssVariables: lightCssVariableOverrides,
  mirrorLightToDark,
}: {
  css: string
  id: string
  label: string
  layout?: CanvasThemePresetLayout
  lightCssVariables?: CanvasThemeCssVariables
  mirrorLightToDark?: boolean
}): CanvasThemePreset {
  const parsedPreset = parseCanvasThemePresetCss(css)
  const layoutFontVariables = createLayoutFontVariables(layout)
  const lightCssVariables = {
    ...layoutFontVariables,
    ...parsedPreset.lightCssVariables,
    ...lightCssVariableOverrides,
  }
  const darkCssVariables = mirrorLightToDark
    ? lightCssVariables
    : parsedPreset.darkCssVariables

  return {
    id,
    label,
    ...(layout ? { layout } : {}),
    lightCssVariables,
    ...(Object.keys(darkCssVariables).length
      ? { darkCssVariables }
      : {}),
  }
}
