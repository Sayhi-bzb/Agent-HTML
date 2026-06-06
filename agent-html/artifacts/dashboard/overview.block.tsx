import {
  ActivityIcon,
  CircleDollarSignIcon,
  ClockIcon,
  GaugeIcon,
} from "lucide-react"

import { Badge } from "../../components/ui/badge"
import type { UsageDashboardRow } from "../../lib/usage-dashboard"

import {
  dashboardMetricLabels,
  dashboardWindowLabels,
  formatCurrency,
  formatDuration,
  formatNumber,
  type DashboardMetric,
  type DashboardSummary,
  type DashboardWindow,
} from "./data"

type OverviewBlockProps = {
  metric: DashboardMetric
  rows: UsageDashboardRow[]
  summary: DashboardSummary
  window: DashboardWindow
}

function MetricTile({
  label,
  value,
  detail,
}: {
  detail: string
  label: string
  value: string
}) {
  return (
    <div className="canvas-content-panel-sm canvas-stack-xs min-w-0">
      <span className="canvas-text-caption text-muted-foreground">{label}</span>
      <span className="canvas-text-title">{value}</span>
      <span className="canvas-text-caption text-muted-foreground">{detail}</span>
    </div>
  )
}

export function OverviewBlock({
  metric,
  rows,
  summary,
  window,
}: OverviewBlockProps) {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">
            <GaugeIcon data-icon="inline-start" />
            dashboard
          </Badge>
          <Badge variant="outline">{dashboardWindowLabels[window]}</Badge>
          <Badge variant="outline">{dashboardMetricLabels[metric]}</Badge>
        </div>
        <h2 className="canvas-text-title">Usage operations dashboard</h2>
        <p className="canvas-text-body text-muted-foreground">
          Local usage telemetry rendered as linked controls, trend analysis,
          searchable records, and a selected-row inspector.
        </p>
      </div>

      <div className="canvas-grid-gap md:grid-cols-4">
        <MetricTile
          detail={`${rows.length} sampled hours`}
          label="Requests"
          value={formatNumber(summary.requestTotal)}
        />
        <MetricTile
          detail={`peak users ${formatNumber(summary.userPeak)}`}
          label="Tokens"
          value={formatNumber(summary.tokenTotal)}
        />
        <MetricTile
          detail={`average ${formatCurrency(summary.averageCost)}`}
          label="Cost"
          value={formatCurrency(summary.costTotal)}
        />
        <MetricTile
          detail={`average ${formatDuration(summary.averageDurationSeconds)}`}
          label="Peak hour"
          value={summary.peakHour?.hour ?? "None"}
        />
      </div>

      <div className="canvas-grid-gap lg:grid-cols-3">
        <div className="canvas-cluster-md canvas-content-panel-sm items-center">
          <div className="canvas-icon-box-sm">
            <ActivityIcon />
          </div>
          <div className="canvas-stack-xs min-w-0">
            <span className="canvas-text-caption text-muted-foreground">
              Average requests
            </span>
            <span className="canvas-text-body">
              {formatNumber(summary.averageRequests)}
            </span>
          </div>
        </div>
        <div className="canvas-cluster-md canvas-content-panel-sm items-center">
          <div className="canvas-icon-box-sm">
            <CircleDollarSignIcon />
          </div>
          <div className="canvas-stack-xs min-w-0">
            <span className="canvas-text-caption text-muted-foreground">
              Cost per request
            </span>
            <span className="canvas-text-body">
              {formatCurrency(
                summary.requestTotal ? summary.costTotal / summary.requestTotal : 0
              )}
            </span>
          </div>
        </div>
        <div className="canvas-cluster-md canvas-content-panel-sm items-center">
          <div className="canvas-icon-box-sm">
            <ClockIcon />
          </div>
          <div className="canvas-stack-xs min-w-0">
            <span className="canvas-text-caption text-muted-foreground">
              Peak window
            </span>
            <span className="canvas-text-body">
              {summary.peakHour
                ? `${summary.peakHour.hour} · ${formatNumber(
                    summary.peakHour.requests
                  )}`
                : "None"}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
