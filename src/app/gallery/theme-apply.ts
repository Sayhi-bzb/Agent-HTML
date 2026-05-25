import colors from "tailwindcss/colors"

import type {
  GalleryColorFamily,
  GalleryColorStep,
  GalleryColorTokenName,
  GalleryColorTokenValues,
  GalleryThemeCssVariables,
  GalleryThemePresetId,
} from "@/app/gallery/editor-panels"
import {
  galleryColorFamilies,
  galleryColorSteps,
  galleryColorTokenDefaults,
  galleryThemePresets,
} from "@/app/gallery/editor-panels"

type TailwindColorScale = Record<GalleryColorStep, string>

export type GalleryTokenThemeDraft = {
  colorTokenValues: GalleryColorTokenValues
  kind: "tokens"
}

export type GalleryPresetThemeDraft = {
  darkCssVariables: GalleryThemeCssVariables
  id: GalleryThemePresetId
  kind: "preset"
  lightCssVariables: GalleryThemeCssVariables
}

export type GalleryThemeDraft =
  | GalleryPresetThemeDraft
  | GalleryTokenThemeDraft

const appliedGalleryThemeStorageKey = "gallery:applied-theme"
const legacyAppliedGalleryThemeStorageKey = "gallery:applied-color-token-values"
const galleryAppliedThemeStyleId = "gallery-applied-theme-vars"
const galleryColorFamilySet = new Set<string>(galleryColorFamilies)
const galleryColorStepSet = new Set<string>(galleryColorSteps)
const managedRootVariableNames = [
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

const tailwindColorFamilies = Object.fromEntries(
  (Object.keys(colors) as GalleryColorFamily[]).map((family) => [
    family,
    colors[family] as TailwindColorScale,
  ])
) as Record<GalleryColorFamily, TailwindColorScale>

function resolveTokenColor(
  values: GalleryColorTokenValues,
  tokenName: keyof GalleryColorTokenValues
) {
  const token = values[tokenName]
  return (
    tailwindColorFamilies[token.family]?.[token.step] ??
    tailwindColorFamilies.zinc[500]
  )
}

function isCssVariables(value: unknown): value is GalleryThemeCssVariables {
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

function getManagedThemeStyleElement() {
  let styleElement = document.getElementById(galleryAppliedThemeStyleId)

  if (!styleElement) {
    styleElement = document.createElement("style")
    styleElement.id = galleryAppliedThemeStyleId
    document.head.appendChild(styleElement)
  }

  return styleElement
}

function formatCssVariables(variables: GalleryThemeCssVariables) {
  return Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join("\n")
}

function applyManagedPresetTheme(
  lightCssVariables: GalleryThemeCssVariables,
  darkCssVariables: GalleryThemeCssVariables
) {
  const styleElement = getManagedThemeStyleElement()
  const lightVariables = formatCssVariables(lightCssVariables)
  const darkVariables = formatCssVariables(darkCssVariables)

  styleElement.textContent = `:root {\n${lightVariables}\n}\n\n.dark {\n${darkVariables}\n}\n`
}

function clearManagedPresetTheme() {
  const styleElement = document.getElementById(galleryAppliedThemeStyleId)
  styleElement?.remove()
}

function parseTokenThemeDraft(value: unknown): GalleryTokenThemeDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  const parsedValue = value as Partial<
    Record<GalleryColorTokenName, Partial<{ family: string; step: string }>>
  >
  const nextValues = { ...galleryColorTokenDefaults }

  for (const tokenName of Object.keys(
    galleryColorTokenDefaults
  ) as GalleryColorTokenName[]) {
    const token = parsedValue[tokenName]
    if (
      !token ||
      !galleryColorFamilySet.has(token.family ?? "") ||
      !galleryColorStepSet.has(token.step ?? "")
    ) {
      return null
    }

    nextValues[tokenName] = {
      family: token.family as GalleryColorFamily,
      step: token.step as GalleryColorStep,
    }
  }

  return {
    colorTokenValues: nextValues,
    kind: "tokens",
  }
}

function parseThemeDraft(value: unknown): GalleryThemeDraft | null {
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
    galleryThemePresets.some((preset) => preset.id === draft.id) &&
    isCssVariables(draft.lightCssVariables) &&
    isCssVariables(draft.darkCssVariables)
  ) {
    return {
      darkCssVariables: draft.darkCssVariables,
      id: draft.id as GalleryThemePresetId,
      kind: "preset",
      lightCssVariables: draft.lightCssVariables,
    }
  }

  return parseTokenThemeDraft(value)
}

export function createDefaultGalleryThemeDraft(): GalleryThemeDraft {
  return {
    colorTokenValues: galleryColorTokenDefaults,
    kind: "tokens",
  }
}

export function createGalleryPresetThemeDraft(
  presetId: GalleryThemePresetId
): GalleryThemeDraft | null {
  const preset = galleryThemePresets.find((item) => item.id === presetId)

  if (!preset) {
    return null
  }

  if (preset.id === "default") {
    return createDefaultGalleryThemeDraft()
  }

  return {
    darkCssVariables: preset.darkCssVariables ?? preset.lightCssVariables ?? {},
    id: preset.id,
    kind: "preset",
    lightCssVariables: preset.lightCssVariables ?? {},
  }
}

export function resolveGalleryColorTokenCssVariables(
  values: GalleryColorTokenValues
) {
  return Object.fromEntries(
    Object.keys(values).map((tokenName) => [
      `--${tokenName}`,
      resolveTokenColor(values, tokenName as keyof GalleryColorTokenValues),
    ])
  ) as Record<`--${string}`, string>
}

export function resolveGalleryThemeCssVariables(
  draft: GalleryThemeDraft,
  resolvedMode: "dark" | "light" = "light"
) {
  if (draft.kind === "preset") {
    return resolvedMode === "dark"
      ? draft.darkCssVariables
      : draft.lightCssVariables
  }

  return resolveGalleryColorTokenCssVariables(draft.colorTokenValues)
}

export function areGalleryThemeDraftsEqual(
  left: GalleryThemeDraft,
  right: GalleryThemeDraft
) {
  return JSON.stringify(left) === JSON.stringify(right)
}

export function applyGalleryTheme(draft: GalleryThemeDraft) {
  const root = document.documentElement

  if (draft.kind === "preset") {
    for (const name of managedRootVariableNames) {
      root.style.removeProperty(name)
    }

    applyManagedPresetTheme(draft.lightCssVariables, draft.darkCssVariables)
    return
  }

  clearManagedPresetTheme()
  const variables = resolveGalleryColorTokenCssVariables(draft.colorTokenValues)

  for (const [name, value] of Object.entries(variables)) {
    root.style.setProperty(name, value)
  }
}

export function loadAppliedGalleryTheme() {
  const storedValue =
    localStorage.getItem(appliedGalleryThemeStorageKey) ??
    localStorage.getItem(legacyAppliedGalleryThemeStorageKey)

  if (!storedValue) {
    return null
  }

  try {
    return parseThemeDraft(JSON.parse(storedValue))
  } catch {
    return null
  }
}

export function saveAppliedGalleryTheme(draft: GalleryThemeDraft) {
  localStorage.setItem(appliedGalleryThemeStorageKey, JSON.stringify(draft))
}
