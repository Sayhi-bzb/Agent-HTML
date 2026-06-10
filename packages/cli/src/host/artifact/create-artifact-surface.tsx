import { publicAssetUrl } from "../api/api"
import { PromptComposer } from "../prompt/floating-prompt"
import { useHostI18n } from "../i18n/host-i18n"

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
  const { t } = useHostI18n()

  return (
    <main className="canvas-surface-root">
      <div className="canvas-create-artifact-frame">
        <div className="canvas-create-artifact">
          <div className="canvas-create-artifact-brand">
            <img
              alt=""
              aria-hidden="true"
              className="canvas-create-artifact-brand-icon"
              src={publicAssetUrl("ghost.svg")}
            />
            <span>Agent-HTML</span>
          </div>
          {pending ? (
            <div className="canvas-create-artifact-pending" role="status">
              {t("artifact.createPending")}
            </div>
          ) : null}
          <PromptComposer
            disabled={disabled}
            onDraftChange={onDraftChange}
            onSubmit={onSubmit}
            placeholder={t("artifact.createPlaceholder")}
            status={status}
            targetId="new-artifact"
            value={draft}
          />
        </div>
      </div>
    </main>
  )
}
