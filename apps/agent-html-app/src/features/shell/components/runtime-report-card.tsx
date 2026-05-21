import type { RuntimeReport } from "@/lib/types"

import {
  ShellCardHeader,
  ShellMetricList,
  ShellRuntimeStatusBadge,
} from "@/features/app-shell/components/shell-content"
import { ShellCardFrame } from "./shell-card-frame"

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
    <ShellCardFrame className="app-shell-runtime-card">
      <ShellCardHeader
        action={<ShellRuntimeStatusBadge status={runtimeReport.status} />}
        title="Checks"
        titleSize="sm"
      />
      <ShellMetricList items={summaryItems.length > 0 ? summaryItems : [{ key: "ready", label: "ready", value: "all" }]} />
    </ShellCardFrame>
  )
}
