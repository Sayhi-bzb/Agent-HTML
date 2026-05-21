import type { RuntimeReport } from "@/lib/types"

import {
  ShellMetricList,
  ShellSectionLabel,
  ShellSplitRow,
  ShellRuntimeStatusBadge,
} from "@/features/app-shell/components/shell-content"

type RuntimeReportCardProps = {
  runtimeReport: RuntimeReport
}

export function RuntimeReportCard({ runtimeReport }: RuntimeReportCardProps) {
  const summaryItems = [
    { key: "ok", label: "ready", value: runtimeReport.counts.ok },
    { key: "warn", label: "warn", value: runtimeReport.counts.warn },
    { key: "fail", label: "issue", value: runtimeReport.counts.fail },
  ].filter((item) => item.value > 0)
  const highlighted = runtimeReport.checks.find((item) => item.status !== "ok") ?? runtimeReport.checks[0]

  return (
    <section className="app-shell-runtime-card app-shell-message-section">
      <ShellSplitRow className="w-full">
        <ShellSectionLabel>Check</ShellSectionLabel>
        <ShellRuntimeStatusBadge status={runtimeReport.status} />
      </ShellSplitRow>
      {highlighted ? (
        <p className="app-shell-body-copy">{highlighted.detail}</p>
      ) : null}
      <ShellMetricList
        className="px-0 pb-0"
        items={
          summaryItems.length > 0
            ? summaryItems
            : [{ key: "ready", label: "ready", value: "all" }]
        }
      />
    </section>
  )
}
