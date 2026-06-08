import {
  canvasThemeVariableNames,
  type CanvasThemeVariableName,
} from "./theme-variables"
import type { CanvasThemeCssVariables, CanvasThemePreset } from "./presets"

const cssVariableDeclarationPattern = /(--[a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g
const themeVariableNames = new Set<string>(canvasThemeVariableNames)

function extractCssBlock(source: string, selector: string) {
  const selectorIndex = source.indexOf(selector)
  if (selectorIndex < 0) {
    return ""
  }

  const openingBraceIndex = source.indexOf("{", selectorIndex)
  if (openingBraceIndex < 0) {
    return ""
  }

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
}: {
  css: string
  id: string
  label: string
}): CanvasThemePreset {
  const parsedPreset = parseCanvasThemePresetCss(css)

  return {
    id,
    label,
    lightCssVariables: parsedPreset.lightCssVariables,
    ...(Object.keys(parsedPreset.darkCssVariables).length
      ? { darkCssVariables: parsedPreset.darkCssVariables }
      : {}),
  }
}
