import type { RuntimeReport } from "@/lib/types"

import {
  ShellMetricList,
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

  return (
    <section className="app-shell-runtime-card app-shell-message-section">
      <div className="app-shell-split-row">
        <p className="app-shell-message-heading">Checks</p>
        <ShellRuntimeStatusBadge status={runtimeReport.status} />
      </div>
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
