import {
  ActivityIcon,
  AlertTriangleIcon,
  CircleDollarSignIcon,
  ClockIcon,
  GaugeIcon,
  RadioTowerIcon,
} from "lucide-react"

import { Badge } from "../../components/ui/badge"

import {
  dashboardMetricLabels,
  dashboardWindowLabels,
  formatCurrency,
  formatNumber,
  getSeverityLabel,
  type DashboardSignalRow,
  type DashboardMetric,
  type DashboardSummary,
  type DashboardWindow,
} from "./data"

type OverviewBlockProps = {
  anomalyOnly: boolean
  metric: DashboardMetric
  rows: DashboardSignalRow[]
  selectedRow: DashboardSignalRow | null
  summary: DashboardSummary
  thresholdPercent: number
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

function InlineStat({
  label,
  value,
  detail,
}: {
  detail: string
  label: string
  value: string
}) {
  return (
    <div className="canvas-stack-xs min-w-0">
      <span className="canvas-text-caption text-muted-foreground">{label}</span>
      <span className="canvas-text-heading">{value}</span>
      <span className="canvas-text-caption text-muted-foreground">{detail}</span>
    </div>
  )
}

export function OverviewBlock({
  anomalyOnly,
  metric,
  rows,
  selectedRow,
  summary,
  thresholdPercent,
  window,
}: OverviewBlockProps) {
  const healthVariant =
    summary.criticalCount > 0
      ? "destructive"
      : summary.anomalyCount > 0
        ? "secondary"
        : "outline"

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant={healthVariant}>
            <GaugeIcon data-icon="inline-start" />
            {summary.healthLabel}
          </Badge>
          <Badge variant="outline">{dashboardWindowLabels[window]}</Badge>
          <Badge variant="outline">{dashboardMetricLabels[metric]}</Badge>
          <Badge variant="outline">{thresholdPercent}% threshold</Badge>
          {anomalyOnly ? (
            <Badge variant="destructive">{summary.anomalyCount} exceptions</Badge>
          ) : null}
        </div>
        <h2 className="canvas-text-title">Usage revenue operations</h2>
        <p className="canvas-text-body text-muted-foreground">
          A local telemetry command board for traffic pressure, token throughput,
          spend discipline, and the hour that needs the next operational decision.
        </p>
      </div>

      <div className="canvas-grid-gap md:grid-cols-4">
        <MetricTile
          detail={`${rows.length} active hours`}
          label="Requests"
          value={formatNumber(summary.requestTotal)}
        />
        <MetricTile
          detail={`peak users ${formatNumber(summary.userPeak)}`}
          label="Tokens"
          value={formatNumber(summary.tokenTotal)}
        />
        <MetricTile
          detail={`avg hour ${formatCurrency(summary.averageCost)}`}
          label="Cost"
          value={formatCurrency(summary.costTotal)}
        />
        <MetricTile
          detail={`${summary.thresholdHitCount} threshold hits`}
          label="Peak hour"
          value={summary.peakHour?.hour ?? "None"}
        />
      </div>

      <div className="canvas-grid-gap lg:grid-cols-3">
        <div className="canvas-cluster-md canvas-content-panel-sm items-center">
          <div className="canvas-icon-box-sm">
            <RadioTowerIcon />
          </div>
          <div className="canvas-stack-xs min-w-0">
            <span className="canvas-text-caption text-muted-foreground">
              Operating state
            </span>
            <span className="canvas-text-body">
              {summary.healthLabel} · {summary.anomalyCount} exception
              {summary.anomalyCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
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
      </div>

      <div className="canvas-grid-gap lg:grid-cols-2">
        <div className="canvas-content-panel-sm canvas-stack-sm">
          <div className="canvas-wrap-sm items-center">
            <AlertTriangleIcon data-icon="inline-start" />
            <span className="canvas-text-body">Exception mix</span>
          </div>
          <div className="canvas-grid-gap-md md:grid-cols-3">
            <InlineStat
              detail="queued"
              label="Anomalies"
              value={formatNumber(summary.anomalyCount)}
            />
            <InlineStat
              detail="needs review"
              label="Critical"
              value={formatNumber(summary.criticalCount)}
            />
            <InlineStat
              detail="metric pressure"
              label="Threshold"
              value={formatNumber(summary.thresholdHitCount)}
            />
          </div>
        </div>

        <div className="canvas-content-panel-sm canvas-stack-sm">
          <div className="canvas-wrap-sm items-center">
            <ClockIcon data-icon="inline-start" />
            <span className="canvas-text-body">Selected hour</span>
            {selectedRow ? (
              <Badge variant="outline">{getSeverityLabel(selectedRow.severity)}</Badge>
            ) : null}
          </div>
          <p className="canvas-text-body">
            {selectedRow
              ? `${selectedRow.hour} holds ${formatNumber(
                  selectedRow.requests
                )} requests, ${formatNumber(
                  selectedRow.tokens
                )} tokens, and ${formatCurrency(selectedRow.cost)} in spend.`
              : "No selected hour in this filter."}
          </p>
        </div>
      </div>
    </section>
  )
}
