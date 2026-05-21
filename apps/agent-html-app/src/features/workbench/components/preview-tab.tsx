import type { BuildRunSummary, SessionDetail } from "@/lib/types"

import {
  ShellBuildStatusBadge,
  ShellLoadingRow,
  ShellMetaRow,
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
    <WorkbenchCard>
      {build.status !== "succeeded" ? (
        <ShellMetaRow action={<ShellBuildStatusBadge status={build.status} />} />
      ) : null}
      {building ? <ShellLoadingRow>Build</ShellLoadingRow> : null}
      <PreviewFrame empty="Empty" html={previewHtml} title={`${session.name} preview`} />
    </WorkbenchCard>
  )
}
