import { colorTokenSections, focusableThemeTokenEntries } from "./config"
import type {
  ArtifactProfile,
  GalleryPreviewMode,
  ThemeTokenName,
} from "./types"

export function formatThemeTokenLabel(tokenName: ThemeTokenName) {
  return tokenName
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function getThemeTokenControlLabel(tokenName: ThemeTokenName) {
  switch (tokenName) {
    case "primary":
    case "secondary":
    case "accent":
    case "background":
    case "card":
    case "popover":
    case "muted":
    case "destructive":
    case "sidebar":
    case "sidebarPrimary":
    case "sidebarAccent":
    case "chart1":
    case "chart2":
    case "chart3":
    case "chart4":
    case "chart5":
      return "Background"
    case "primaryForeground":
    case "secondaryForeground":
    case "accentForeground":
    case "foreground":
    case "cardForeground":
    case "popoverForeground":
    case "mutedForeground":
    case "destructiveForeground":
    case "sidebarForeground":
    case "sidebarPrimaryForeground":
    case "sidebarAccentForeground":
      return "Foreground"
    case "border":
    case "sidebarBorder":
      return "Border"
    case "input":
      return "Input"
    case "ring":
    case "sidebarRing":
      return "Ring"
    default:
      return formatThemeTokenLabel(tokenName)
  }
}

export function extractFontName(value: string) {
  return value.split(",")[0]?.trim().replace(/^"|"$/g, "") || value
}

export function pickThemeTokens(
  tokens: ArtifactProfile["globalStyle"]["tokenSets"]["light"],
  tokenNames: ThemeTokenName[],
) {
  return tokenNames.reduce<
    Partial<ArtifactProfile["globalStyle"]["tokenSets"]["light"]>
  >((result, tokenName) => {
    result[tokenName] = tokens[tokenName]
    return result
  }, {})
}

export function getManualCardProps(
  profile: ArtifactProfile,
  path: string,
  className?: string,
) {
  const treatment = profile.componentStyle.treatments.card

  return {
    className: [className, "ahtml-gallery-workbench-card"]
      .filter(Boolean)
      .join(" "),
    "data-agent-html-component": "card",
    "data-ahtml-path": path,
    "data-ahtml-render-kind": "compound",
    "data-ahtml-source": "shadcn",
    ...(treatment ? { "data-ahtml-treatment": treatment } : {}),
  } as const
}

export function createGallerySurfaceShadow(artifactProfile: ArtifactProfile) {
  const typography = artifactProfile.globalStyle.typography

  return `${typography.shadowOffsetX} ${typography.shadowOffsetY} ${typography.shadowBlur} ${typography.shadowSpread} color-mix(in srgb, ${typography.shadowColor} calc(${typography.shadowOpacity} * 100%), transparent)`
}

type InspectorTarget = {
  dataset: {
    ahtmlTreatment?: string
    ahtmlSource?: string
    ahtmlRenderKind?: string
    slot?: string
  }
  getAttribute(name: string): string | null
}

export function collectInspectorSourceTokens(target: InspectorTarget) {
  const values = [
    target.dataset.ahtmlTreatment,
    target.dataset.ahtmlSource,
    target.dataset.ahtmlRenderKind,
    target.dataset.slot,
    target.getAttribute("data-slot") ?? undefined,
  ]

  return Array.from(new Set(values.filter(Boolean) as string[]))
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function resolveFocusableThemeToken(token: string): ThemeTokenName | null {
  const normalizedToken = token
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase()

  for (const [sourceToken, tokenName] of focusableThemeTokenEntries) {
    const matcher = new RegExp(
      `(^|[^a-z0-9-])${escapeRegExp(sourceToken)}($|[^a-z0-9-])`,
    )

    if (matcher.test(normalizedToken)) {
      return tokenName
    }
  }

  return null
}

export function getColorSectionIdForToken(tokenName: ThemeTokenName) {
  return (
    colorTokenSections.find((section) => section.tokenNames.includes(tokenName))
      ?.id ?? "base-tokens"
  )
}

export function isBuiltinArtifactProfileReference(
  artifactProfileReference: string,
  builtinArtifactProfileReferences: string[],
) {
  return builtinArtifactProfileReferences.includes(artifactProfileReference)
}

export function getPreviewModeLabel(previewMode: GalleryPreviewMode) {
  if (previewMode === "full") {
    return "component-gallery"
  }

  if (previewMode === "colors") {
    return "color-palette"
  }

  if (previewMode === "custom") {
    return "custom-preview"
  }

  if (previewMode === "dashboard") {
    return "dashboard-preview"
  }

  if (previewMode === "mail") {
    return "mail-preview"
  }

  if (previewMode === "pricing") {
    return "pricing-preview"
  }

  if (previewMode === "selection") {
    return "selection-preview"
  }

  return previewMode
}
