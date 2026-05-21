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
  artifactProfileReference?: string
  artifactProfile?: ArtifactProfile
  document?: AgentDocument
  diagnostics?: {
    severity?: string
    code?: string
    path?: string
    message?: string
  }[]
  inputPath?: string
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
  const activeDocument = runtimeState.document ?? agentDocument
  const title =
    runtimeState.mode === "diagnostics"
      ? "Preview Diagnostics"
      : getDocumentTitle(activeDocument)

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

  if (runtimeState.mode === "diagnostics" && runtimeState.artifactProfile) {
    return (
      <PreviewDiagnosticsApp
        artifactProfile={runtimeState.artifactProfile}
        diagnostics={runtimeState.diagnostics ?? []}
        inputPath={runtimeState.inputPath}
      />
    )
  }

  return (
    <DocumentApp
      document={activeDocument}
      rendererVerificationState={runtimeRendererVerification}
    />
  )
}

function PreviewDiagnosticsApp({
  artifactProfile,
  diagnostics,
  inputPath,
}: {
  artifactProfile: ArtifactProfile
  diagnostics: {
    severity?: string
    code?: string
    path?: string
    message?: string
  }[]
  inputPath?: string
}) {
  const documentStyleCss = createDocumentStyleCss(artifactProfile)

  return (
    <>
      <RuntimeStyleElements documentStyleCss={documentStyleCss} />
      <main
        className="ahtml-runtime-host ahtml-runtime-document"
        data-artifact-profile={artifactProfile.id}
      >
        <DocumentArtifactShell
          artifactProfile={artifactProfile}
          layoutPolicy="document"
        >
          <section className="bg-card text-card-foreground flex flex-col gap-4 rounded-2xl border border-border p-6 shadow-sm">
            <header className="flex flex-col gap-2">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Preview Diagnostics
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                Fix the source document to resume rendering.
              </h1>
              {inputPath ? (
                <p className="text-sm text-muted-foreground">{inputPath}</p>
              ) : null}
            </header>
            <div className="grid gap-3">
              {diagnostics.map((diagnostic, index) => (
                <article
                  className="rounded-xl border border-border bg-background/80 p-4"
                  key={`${diagnostic.code ?? "diagnostic"}-${index}`}
                >
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold uppercase tracking-[0.08em] text-foreground">
                      {diagnostic.severity ?? "info"}
                    </span>
                    {diagnostic.code ? (
                      <span className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground">
                        {diagnostic.code}
                      </span>
                    ) : null}
                    {diagnostic.path ? (
                      <span className="font-mono text-xs text-muted-foreground">
                        {diagnostic.path}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground">
                    {diagnostic.message ?? "Preview could not render the document."}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </DocumentArtifactShell>
      </main>
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
