import { DocumentArtifactShell } from "../../artifact-shell"
import { RuntimeStyleElements } from "../../host-styles"
import { createDocumentStyleCss } from "../../profile-theme"
import { createRendererNode } from "../../renderer/render-node"
import type {
  AgentDocument,
  RuntimeVerificationState,
} from "../../renderer/types"

export function DocumentApp({
  document,
  rendererVerificationState,
}: {
  document: AgentDocument
  rendererVerificationState: RuntimeVerificationState
}) {
  const documentStyleCss = createDocumentStyleCss(document.meta.artifactProfile)
  const RendererNode = createRendererNode(
    new Map(
      rendererVerificationState.rendererMapping.components.map((component) => [
        component.name,
        component,
      ]),
    ),
    document.meta.artifactProfile,
  )

  return (
    <>
      <RuntimeStyleElements documentStyleCss={documentStyleCss} />
      <main
        className="ahtml-runtime-host ahtml-runtime-document"
        data-artifact-profile={document.meta.artifactProfile.id}
      >
        <DocumentArtifactShell
          artifactProfile={document.meta.artifactProfile}
          layoutPolicy="gallery"
        >
          {document.components.map((node, index) => (
            <RendererNode key={index} node={node} path={[index]} />
          ))}
        </DocumentArtifactShell>
      </main>
    </>
  )
}
