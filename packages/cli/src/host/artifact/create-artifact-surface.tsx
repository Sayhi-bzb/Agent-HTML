import { PromptComposer } from "../prompt/floating-prompt"

export function CreateArtifactSurface({
  disabled = false,
  draft,
  onDraftChange,
  onSubmit,
  pending,
  status,
}: {
  disabled?: boolean
  draft: string
  onDraftChange: (draft: string) => void
  onSubmit: (request: string) => Promise<void>
  pending: boolean
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
          {pending ? (
            <div className="canvas-create-artifact-pending" role="status">
              Creating artifact
            </div>
          ) : null}
          <PromptComposer
            disabled={disabled}
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
