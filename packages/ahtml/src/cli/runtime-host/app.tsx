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
    availableStyleReferences: string[]
    styleReference: string
    artifactProfile: ArtifactProfile
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
        availableStyleReferences={runtimeState.gallery.availableStyleReferences}
        initialProfile={runtimeState.gallery.artifactProfile}
        runtimeRendererVerification={runtimeRendererVerification}
        styleReference={runtimeState.gallery.styleReference}
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
  const { cssVariableMap, radiusScale, tokenSets, typography } =
    artifactProfile.globalStyle
  const lightThemeVars = Object.entries(tokenSets.light)
    .map(
      ([tokenName, value]) =>
        `  ${cssVariableMap[tokenName as keyof typeof cssVariableMap]}: ${value};`,
    )
    .join("\n")
  const darkThemeVars = Object.entries(tokenSets.dark)
    .map(
      ([tokenName, value]) =>
        `  ${cssVariableMap[tokenName as keyof typeof cssVariableMap]}: ${value};`,
    )
    .join("\n")

  return `
    :root {
${lightThemeVars}
      ${cssVariableMap.radius}: ${radiusScale.base};
      ${cssVariableMap.fontSans}: ${typography.fontSans};
      ${cssVariableMap.fontHeading}: ${typography.fontHeading};
      ${cssVariableMap.fontSerif}: ${typography.fontSerif};
      ${cssVariableMap.fontMono}: ${typography.fontMono};
      ${cssVariableMap.letterSpacing}: ${typography.letterSpacing};
      ${cssVariableMap.spacing}: ${typography.spacing};
      ${cssVariableMap.shadowColor}: ${typography.shadowColor};
      ${cssVariableMap.shadowOpacity}: ${typography.shadowOpacity};
      ${cssVariableMap.shadowBlur}: ${typography.shadowBlur};
      ${cssVariableMap.shadowSpread}: ${typography.shadowSpread};
      ${cssVariableMap.shadowOffsetX}: ${typography.shadowOffsetX};
      ${cssVariableMap.shadowOffsetY}: ${typography.shadowOffsetY};
      --radius-sm: ${radiusScale.sm};
      --radius-md: ${radiusScale.md};
      --radius-lg: ${radiusScale.lg};
      --radius-xl: ${radiusScale.xl};
      --radius-2xl: ${radiusScale["2xl"]};
      --radius-3xl: ${radiusScale["3xl"]};
      --radius-4xl: ${radiusScale["4xl"]};
      --font-heading: ${typography.fontHeading};
      --font-serif: ${typography.fontSerif};
      --font-mono: ${typography.fontMono};
      --letter-spacing-tight: ${typography.letterSpacing};
      --surface-shadow:
        ${typography.shadowOffsetX}
        ${typography.shadowOffsetY}
        ${typography.shadowBlur}
        ${typography.shadowSpread}
        color-mix(in srgb, ${typography.shadowColor} calc(${typography.shadowOpacity} * 100%), transparent);
    }
    [data-theme-mode="dark"] {
${darkThemeVars}
    }
  `
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
