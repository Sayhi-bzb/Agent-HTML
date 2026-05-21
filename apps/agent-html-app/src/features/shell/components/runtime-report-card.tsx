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
      <CardContent className="grid gap-2 text-sm">
        <div className="flex items-center justify-between">
          <span>ok</span>
          <span>{runtimeReport.counts.ok}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>warn</span>
          <span>{runtimeReport.counts.warn}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>fail</span>
          <span>{runtimeReport.counts.fail}</span>
        </div>
      </CardContent>
    </Card>
  )
}
