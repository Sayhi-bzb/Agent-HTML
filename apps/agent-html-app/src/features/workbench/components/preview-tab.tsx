import type { BuildRunSummary, SessionDetail } from "@/lib/types"

import {
  ShellBuildStatusBadge,
  ShellCardHeader,
  ShellEmptyCanvas,
  ShellLoadingRow,
  ShellWorkbenchCard,
} from "@/features/app-shell/components/shell-content"

type PreviewTabProps = {
  session: SessionDetail
  build: BuildRunSummary
  previewHtml?: string
  building: boolean
}

export function PreviewTab({
  session,
  build,
  previewHtml,
  building,
}: PreviewTabProps) {
  return (
    <ShellWorkbenchCard
      header={
        <ShellCardHeader
          action={<ShellBuildStatusBadge status={build.status} />}
          description={session.previewPath ?? "preview"}
          title={session.summary.name}
        />
      }
    >
      {building ? <ShellLoadingRow>Building preview</ShellLoadingRow> : null}
      <div className="app-shell-preview-frame">
        {previewHtml ? (
          <iframe
            className="app-shell-preview-canvas"
            srcDoc={previewHtml}
            title={`${session.summary.name} preview`}
          />
        ) : (
          <ShellEmptyCanvas>Empty</ShellEmptyCanvas>
        )}
      </div>
    </ShellWorkbenchCard>
  )
}
