import React from "react"

import generatedDocument from "./document.generated.json"
import runtimeStateSource from "./runtime-state.generated.json"
import runtimeVerificationState from "./render-verification.generated.json"
import { type ArtifactProfile } from "./artifact-shell"
import { DocumentApp } from "./features/document/app"
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
      document={agentDocument}
      rendererVerificationState={runtimeRendererVerification}
    />
  )
}

function getDocumentTitle(document: AgentDocument) {
  const page = document.components.find(
    (node): node is Extract<AgentDocument["components"][number], { type: "component" }> =>
      node.type === "component" && node.name === "page",
  )

  return page?.props.title
}
