import type { AgentDocument } from "./renderer/types"

export type ArtifactProfile = AgentDocument["meta"]["artifactProfile"]

export function createDocumentStyleCss(artifactProfile: ArtifactProfile) {
  return [
    createScopedThemeCss(":root", artifactProfile, "light"),
    `@media (prefers-color-scheme: dark){${createScopedThemeCss(
      ":root",
      artifactProfile,
      "dark",
    )}}`,
  ].join("")
}

export function createGalleryPreviewThemeCss(artifactProfile: ArtifactProfile) {
  return [
    createScopedThemeCss(
      '.ahtml-gallery-preview-surface[data-theme-mode="light"]',
      artifactProfile,
      "light",
    ),
    createScopedThemeCss(
      '.ahtml-gallery-preview-surface[data-theme-mode="dark"]',
      artifactProfile,
      "dark",
    ),
  ].join("")
}

export function createGlobalStyleDeclarations(
  globalStyle: ArtifactProfile["globalStyle"],
  mode: "light" | "dark",
) {
  return [
    `${globalStyle.cssVariableMap.background}:${globalStyle.tokenSets[mode].background};`,
    `${globalStyle.cssVariableMap.foreground}:${globalStyle.tokenSets[mode].foreground};`,
    `${globalStyle.cssVariableMap.card}:${globalStyle.tokenSets[mode].card};`,
    `${globalStyle.cssVariableMap.cardForeground}:${globalStyle.tokenSets[mode].cardForeground};`,
    `${globalStyle.cssVariableMap.popover}:${globalStyle.tokenSets[mode].popover};`,
    `${globalStyle.cssVariableMap.popoverForeground}:${globalStyle.tokenSets[mode].popoverForeground};`,
    `${globalStyle.cssVariableMap.primary}:${globalStyle.tokenSets[mode].primary};`,
    `${globalStyle.cssVariableMap.primaryForeground}:${globalStyle.tokenSets[mode].primaryForeground};`,
    `${globalStyle.cssVariableMap.secondary}:${globalStyle.tokenSets[mode].secondary};`,
    `${globalStyle.cssVariableMap.secondaryForeground}:${globalStyle.tokenSets[mode].secondaryForeground};`,
    `${globalStyle.cssVariableMap.muted}:${globalStyle.tokenSets[mode].muted};`,
    `${globalStyle.cssVariableMap.mutedForeground}:${globalStyle.tokenSets[mode].mutedForeground};`,
    `${globalStyle.cssVariableMap.accent}:${globalStyle.tokenSets[mode].accent};`,
    `${globalStyle.cssVariableMap.accentForeground}:${globalStyle.tokenSets[mode].accentForeground};`,
    `${globalStyle.cssVariableMap.destructive}:${globalStyle.tokenSets[mode].destructive};`,
    `${globalStyle.cssVariableMap.destructiveForeground}:${globalStyle.tokenSets[mode].destructiveForeground};`,
    `${globalStyle.cssVariableMap.border}:${globalStyle.tokenSets[mode].border};`,
    `${globalStyle.cssVariableMap.input}:${globalStyle.tokenSets[mode].input};`,
    `${globalStyle.cssVariableMap.ring}:${globalStyle.tokenSets[mode].ring};`,
    `${globalStyle.cssVariableMap.chart1}:${globalStyle.tokenSets[mode].chart1};`,
    `${globalStyle.cssVariableMap.chart2}:${globalStyle.tokenSets[mode].chart2};`,
    `${globalStyle.cssVariableMap.chart3}:${globalStyle.tokenSets[mode].chart3};`,
    `${globalStyle.cssVariableMap.chart4}:${globalStyle.tokenSets[mode].chart4};`,
    `${globalStyle.cssVariableMap.chart5}:${globalStyle.tokenSets[mode].chart5};`,
    `${globalStyle.cssVariableMap.sidebar}:${globalStyle.tokenSets[mode].sidebar};`,
    `${globalStyle.cssVariableMap.sidebarForeground}:${globalStyle.tokenSets[mode].sidebarForeground};`,
    `${globalStyle.cssVariableMap.sidebarPrimary}:${globalStyle.tokenSets[mode].sidebarPrimary};`,
    `${globalStyle.cssVariableMap.sidebarPrimaryForeground}:${globalStyle.tokenSets[mode].sidebarPrimaryForeground};`,
    `${globalStyle.cssVariableMap.sidebarAccent}:${globalStyle.tokenSets[mode].sidebarAccent};`,
    `${globalStyle.cssVariableMap.sidebarAccentForeground}:${globalStyle.tokenSets[mode].sidebarAccentForeground};`,
    `${globalStyle.cssVariableMap.sidebarBorder}:${globalStyle.tokenSets[mode].sidebarBorder};`,
    `${globalStyle.cssVariableMap.sidebarRing}:${globalStyle.tokenSets[mode].sidebarRing};`,
    `${globalStyle.cssVariableMap.radius}:${globalStyle.radiusScale.base};`,
    `${globalStyle.cssVariableMap.fontSans}:${globalStyle.typography.fontSans};`,
    `${globalStyle.cssVariableMap.fontHeading}:${globalStyle.typography.fontHeading};`,
    `${globalStyle.cssVariableMap.fontSerif}:${globalStyle.typography.fontSerif};`,
    `${globalStyle.cssVariableMap.fontMono}:${globalStyle.typography.fontMono};`,
    `${globalStyle.cssVariableMap.letterSpacing}:${globalStyle.typography.letterSpacing};`,
    `${globalStyle.cssVariableMap.spacing}:${globalStyle.typography.spacing};`,
    `${globalStyle.cssVariableMap.shadowColor}:${globalStyle.typography.shadowColor};`,
    `${globalStyle.cssVariableMap.shadowOpacity}:${globalStyle.typography.shadowOpacity};`,
    `${globalStyle.cssVariableMap.shadowBlur}:${globalStyle.typography.shadowBlur};`,
    `${globalStyle.cssVariableMap.shadowSpread}:${globalStyle.typography.shadowSpread};`,
    `${globalStyle.cssVariableMap.shadowOffsetX}:${globalStyle.typography.shadowOffsetX};`,
    `${globalStyle.cssVariableMap.shadowOffsetY}:${globalStyle.typography.shadowOffsetY};`,
    `--radius-sm:${globalStyle.radiusScale.sm};`,
    `--radius-md:${globalStyle.radiusScale.md};`,
    `--radius-lg:${globalStyle.radiusScale.lg};`,
    `--radius-xl:${globalStyle.radiusScale.xl};`,
    `--radius-2xl:${globalStyle.radiusScale["2xl"]};`,
    `--radius-3xl:${globalStyle.radiusScale["3xl"]};`,
    `--radius-4xl:${globalStyle.radiusScale["4xl"]};`,
    `--font-heading:${globalStyle.typography.fontHeading};`,
    `--font-serif:${globalStyle.typography.fontSerif};`,
    `--font-mono:${globalStyle.typography.fontMono};`,
    `--letter-spacing-tight:${globalStyle.typography.letterSpacing};`,
    `--surface-shadow:${globalStyle.typography.shadowOffsetX} ${globalStyle.typography.shadowOffsetY} ${globalStyle.typography.shadowBlur} ${globalStyle.typography.shadowSpread} color-mix(in srgb, ${globalStyle.typography.shadowColor} calc(${globalStyle.typography.shadowOpacity} * 100%), transparent);`,
    `color-scheme:${mode};`,
  ].join("")
}

function createScopedThemeCss(
  selector: string,
  artifactProfile: ArtifactProfile,
  mode: "light" | "dark",
) {
  return `${selector}{${createGlobalStyleDeclarations(
    artifactProfile.globalStyle,
    mode,
  )}}`
}
