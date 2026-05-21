import type { BuildRunSummary, SessionDetail } from "@/lib/types"

import {
  ShellLoadingRow,
} from "@/features/app-shell/components/shell-content"
import { PreviewFrame } from "./preview-frame"
import { PreviewHeader } from "./preview-header"
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
      header={<PreviewHeader build={build} />}
    >
      {building ? <ShellLoadingRow>Build</ShellLoadingRow> : null}
      <PreviewFrame empty="Blank" html={previewHtml} title={`${session.summary.name} preview`} />
    </WorkbenchCard>
  )
}
