import React from "react"

import { createRendererNode } from "../../renderer/render-node"
import type { AgentDocument, RuntimeVerificationState } from "../../renderer/types"

export type ArtifactProfile = AgentDocument["meta"]["artifactProfile"]

export function DocumentApp({
  document,
  rendererVerificationState,
  createDocumentStyleCss,
  createDocumentArtifactShell,
  createRuntimeStyleElements,
}: {
  document: AgentDocument
  rendererVerificationState: RuntimeVerificationState
  createDocumentStyleCss: (artifactProfile: ArtifactProfile) => string
  createDocumentArtifactShell: React.ComponentType<
    React.PropsWithChildren<{
      className?: string
      artifactProfile?: ArtifactProfile
      layoutPolicy?: "document" | "gallery"
    }>
  >
  createRuntimeStyleElements: React.ComponentType<{
    documentStyleCss: string
    galleryPreviewThemeCss?: string
    includeGalleryShell?: boolean
  }>
}) {
  const documentStyleCss = createDocumentStyleCss(document.meta.artifactProfile)
  const RendererNode = createRendererNode(
    new Map(
      rendererVerificationState.rendererMapping.components.map((component) => [
        component.name,
        component,
      ]),
    ),
    document.meta.artifactProfile.componentStyle.treatments,
    document.meta.artifactProfile,
  )
  const RuntimeStyleElements = createRuntimeStyleElements
  const DocumentArtifactShell = createDocumentArtifactShell

  return (
    <>
      <RuntimeStyleElements documentStyleCss={documentStyleCss} />
      <main
        className="ahtml-runtime-host ahtml-runtime-document"
        data-artifact-profile={document.meta.artifactProfile.id}
        data-style-profile={document.meta.artifactProfile.id}
      >
        <DocumentArtifactShell
          artifactProfile={document.meta.artifactProfile}
          layoutPolicy="document"
        >
          {document.components.map((node, index) => (
            <RendererNode key={index} node={node} path={[index]} />
          ))}
        </DocumentArtifactShell>
      </main>
    </>
  )
}
