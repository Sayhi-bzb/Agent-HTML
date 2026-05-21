import React from "react"

import generatedDocument from "./document.generated.json"
import runtimeStateSource from "./runtime-state.generated.json"
import runtimeVerificationState from "./render-verification.generated.json"
import { DocumentApp, type ArtifactProfile } from "./features/document/app"
import { GalleryApp } from "./features/gallery/app"
import type { AgentDocument, RuntimeVerificationState } from "./renderer/types"

type RuntimeState = {
  kind?: string
  version?: number
  mode?: "document" | "gallery"
  gallery?: {
    availableArtifactProfileReferences: string[]
    artifactProfileReference: string
    artifactProfile: ArtifactProfile
    availableStyleReferences?: string[]
    styleReference?: string
  }
}

const agentDocument = generatedDocument as AgentDocument
const runtimeState = runtimeStateSource as RuntimeState
const runtimeRendererVerification =
  runtimeVerificationState as RuntimeVerificationState

export function App() {
  const title = getDocumentTitle(agentDocument)

  React.useEffect(() => {
    if (title && typeof document !== "undefined") {
      document.title = title
    }
  }, [title])

  if (runtimeState.mode === "gallery" && runtimeState.gallery) {
    return (
      <GalleryApp
        availableStyleReferences={
          runtimeState.gallery.availableArtifactProfileReferences
        }
        initialProfile={runtimeState.gallery.artifactProfile}
        runtimeRendererVerification={runtimeRendererVerification}
        styleReference={runtimeState.gallery.artifactProfileReference}
      />
    )
  }

  return (
    <DocumentApp
      createDocumentArtifactShell={DocumentArtifactShell}
      createDocumentStyleCss={createDocumentStyleCss}
      createRuntimeStyleElements={RuntimeStyleElements}
      document={agentDocument}
      rendererVerificationState={runtimeRendererVerification}
    />
  )
}

export function RuntimeStyleElements({
  documentStyleCss,
  galleryPreviewThemeCss,
  includeGalleryShell = false,
}: {
  documentStyleCss: string
  galleryPreviewThemeCss?: string
  includeGalleryShell?: boolean
}) {
  return (
    <>
      <style>{createRuntimeHostCss()}</style>
      <style>{createArtifactShellCss()}</style>
      <style>{createDocumentLayoutPolicyCss()}</style>
      <style>{createGalleryLayoutPolicyCss()}</style>
      {includeGalleryShell ? <style>{createGalleryShellCss()}</style> : null}
      {galleryPreviewThemeCss ? <style>{galleryPreviewThemeCss}</style> : null}
      <style>{documentStyleCss}</style>
    </>
  )
}

export function DocumentArtifactShell({
  children,
  className,
  artifactProfile,
  layoutPolicy = "document",
}: React.PropsWithChildren<{
  className?: string
  artifactProfile?: ArtifactProfile
  layoutPolicy?: "document" | "gallery"
}>) {
  const classes = [
    "ahtml-artifact-root",
    layoutPolicy === "document"
      ? "ahtml-layout-policy-document"
      : "ahtml-layout-policy-gallery",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      className={classes}
      style={resolveArtifactShellStyle(artifactProfile, layoutPolicy)}
    >
      {children}
    </div>
  )
}

function getDocumentTitle(document: AgentDocument) {
  const page = document.components.find(
    (node): node is Extract<AgentDocument["components"][number], { type: "component" }> =>
      node.type === "component" && node.name === "page",
  )

  return page?.props.title
}

export function createDocumentStyleCss(artifactProfile: ArtifactProfile) {
  const globalStyle = artifactProfile.globalStyle

  return [
    `:root{${createGlobalStyleDeclarations(globalStyle, "light")}}`,
    `@media (prefers-color-scheme: dark){:root{${createGlobalStyleDeclarations(
      globalStyle,
      "dark",
    )}}}`,
  ].join("")
}

function createRuntimeHostCss() {
  return `
    .ahtml-runtime-host {
      min-height: 100vh;
      background: var(--background);
      color: var(--foreground);
      font-family: var(--font-sans);
    }
  `
}

function createArtifactShellCss() {
  return `
    .ahtml-artifact-root {
      display: grid;
      gap: var(--ahtml-page-gap, calc(var(--spacing) * 4));
    }
  `
}

function createDocumentLayoutPolicyCss() {
  return `
    .ahtml-layout-policy-document {
      width: min(var(--ahtml-page-max-width, 72rem), calc(100vw - calc(var(--ahtml-page-padding-inline, 1rem) * 2)));
      margin: 0 auto;
      padding:
        var(--ahtml-page-padding-block-start, 1.5rem)
        var(--ahtml-page-padding-inline, 1rem)
        var(--ahtml-page-padding-block-end, 3rem);
    }
  `
}

function createGalleryLayoutPolicyCss() {
  return `
    .ahtml-layout-policy-gallery {
      display: grid;
      gap: 1rem;
    }
  `
}

function createGalleryShellCss() {
  return `
    .ahtml-gallery-shell {
      display: grid;
      min-height: 100vh;
      grid-template-rows: auto auto 1fr;
      background:
        radial-gradient(circle at top, color-mix(in srgb, var(--primary) 10%, transparent), transparent 42%),
        linear-gradient(180deg, color-mix(in srgb, var(--muted) 36%, transparent), transparent 28%);
    }
  `
}

function createGlobalStyleDeclarations(
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

function resolveArtifactShellStyle(
  artifactProfile: ArtifactProfile | undefined,
  layoutPolicy: "document" | "gallery",
) {
  if (!artifactProfile) {
    return undefined
  }

  const pageLayout = artifactProfile.componentLayout.page
  const frameLayout = artifactProfile.globalLayout.frame

  return {
    "--ahtml-page-gap": pageLayout.gap,
    ...(layoutPolicy === "document"
      ? {
          "--ahtml-page-max-width": frameLayout.pageMaxWidth,
          "--ahtml-page-padding-inline": frameLayout.pagePaddingInline,
          "--ahtml-page-padding-block-start": frameLayout.pagePaddingBlockStart,
          "--ahtml-page-padding-block-end": frameLayout.pagePaddingBlockEnd,
        }
      : {}),
  } as React.CSSProperties
}
