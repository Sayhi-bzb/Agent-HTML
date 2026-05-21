import type { BuildRunSummary, SessionDetail } from "@/lib/types"

import {
  ShellBuildStatusBadge,
  ShellCardHeader,
  ShellLoadingRow,
} from "@/features/app-shell/components/shell-content"
import { PreviewFrame } from "./preview-frame"
import { WorkbenchCard } from "./workbench-card"

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
    <WorkbenchCard
      header={
        <ShellCardHeader
          action={<ShellBuildStatusBadge status={build.status} />}
          description={session.previewPath ?? "preview"}
          title={session.summary.name}
        />
      }
    >
      {building ? <ShellLoadingRow>Building preview</ShellLoadingRow> : null}
      <PreviewFrame empty="Empty" html={previewHtml} title={`${session.summary.name} preview`} />
    </WorkbenchCard>
  )
}
