import { PromptComposer } from "../prompt/floating-prompt"

export function CreateArtifactSurface({
  draft,
  onDraftChange,
  onSubmit,
  status,
}: {
  draft: string
  onDraftChange: (draft: string) => void
  onSubmit: (request: string) => Promise<void>
  status: string
}) {
  return (
    <main className="canvas-surface-root">
      <div className="canvas-create-artifact-frame">
        <div className="canvas-create-artifact">
          <div className="canvas-create-artifact-brand">
            <img
              alt=""
              aria-hidden="true"
              className="canvas-create-artifact-brand-icon"
              src="/__agent-html/public/ghost.svg"
            />
            <span>Agent-HTML</span>
          </div>
          <PromptComposer
            onDraftChange={onDraftChange}
            onSubmit={onSubmit}
            placeholder="Describe the artifact to build..."
            status={status}
            targetId="new-artifact"
            value={draft}
          />
        </div>
      </div>
    </main>
  )
}
