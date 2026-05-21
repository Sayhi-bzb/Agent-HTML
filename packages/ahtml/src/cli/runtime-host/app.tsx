import React from "react"

import generatedDocument from "./document.generated.json"
import runtimeStateSource from "./runtime-state.generated.json"
import runtimeVerificationState from "./render-verification.generated.json"
import {
  createArtifactShellCss,
  createDocumentLayoutPolicyCss,
  createGalleryLayoutPolicyCss,
  DocumentArtifactShell,
  type ArtifactProfile,
} from "./artifact-shell"
import { DocumentApp } from "./features/document/app"
import { GalleryApp } from "./features/gallery/app"
import { createDocumentStyleCss } from "./profile-theme"
import type { AgentDocument, RuntimeVerificationState } from "./renderer/types"

type RuntimeState = {
  kind?: string
  version?: number
  mode?: "document" | "gallery"
  gallery?: {
    availableArtifactProfileReferences: string[]
    artifactProfileReference: string
    artifactProfile: ArtifactProfile
    builtinArtifactProfileReferences: string[]
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
        availableArtifactProfileReferences={
          runtimeState.gallery.availableArtifactProfileReferences
        }
        builtinArtifactProfileReferences={
          runtimeState.gallery.builtinArtifactProfileReferences
        }
        initialProfile={runtimeState.gallery.artifactProfile}
        runtimeRendererVerification={runtimeRendererVerification}
        artifactProfileReference={runtimeState.gallery.artifactProfileReference}
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

function getDocumentTitle(document: AgentDocument) {
  const page = document.components.find(
    (node): node is Extract<AgentDocument["components"][number], { type: "component" }> =>
      node.type === "component" && node.name === "page",
  )

  return page?.props.title
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
