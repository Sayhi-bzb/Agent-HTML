import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { RuntimeReport } from "@/lib/types"

type RuntimeReportCardProps = {
  runtimeReport: RuntimeReport
}

export function RuntimeReportCard({ runtimeReport }: RuntimeReportCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Doctor</CardTitle>
        <CardDescription>{runtimeReport.status}</CardDescription>
      </CardHeader>
      <CardContent className="app-shell-surface-grid text-sm">
        <div className="app-shell-metric-row">
          <span>ok</span>
          <span>{runtimeReport.counts.ok}</span>
        </div>
        <div className="app-shell-metric-row">
          <span>warn</span>
          <span>{runtimeReport.counts.warn}</span>
        </div>
        <div className="app-shell-metric-row">
          <span>fail</span>
          <span>{runtimeReport.counts.fail}</span>
        </div>
      </CardContent>
    </Card>
  )
}
