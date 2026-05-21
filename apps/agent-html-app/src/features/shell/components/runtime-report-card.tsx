import {
  Card,
} from "@/components/ui/card"
import type { RuntimeReport } from "@/lib/types"

import {
  ShellCardHeader,
  ShellMetricList,
  ShellRuntimeStatusBadge,
} from "@/features/app-shell/components/shell-content"

type RuntimeReportCardProps = {
  runtimeReport: RuntimeReport
}

export function RuntimeReportCard({ runtimeReport }: RuntimeReportCardProps) {
  return (
    <Card size="sm">
      <ShellCardHeader
        action={<ShellRuntimeStatusBadge status={runtimeReport.status} />}
        description={runtimeReport.status}
        title="Doctor"
      />
      <ShellMetricList
        items={[
          { key: "ok", label: "ok", value: runtimeReport.counts.ok },
          { key: "warn", label: "warn", value: runtimeReport.counts.warn },
          { key: "fail", label: "fail", value: runtimeReport.counts.fail },
        ]}
      />
    </Card>
  )
}
