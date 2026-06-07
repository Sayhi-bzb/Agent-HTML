import type { UsageDashboardRow } from "../../lib/usage-dashboard"

export type DashboardMetric = "traffic" | "tokens" | "cost"
export type DashboardWindow = "6" | "12" | "24" | "all"
export type DashboardSeverity = "nominal" | "watch" | "critical"

export type DashboardSignalRow = UsageDashboardRow & {
  anomalyReasons: string[]
  costPerRequest: number
  metricScore: number
  metricValue: number
  nextAction: string
  severity: DashboardSeverity
  thresholdExceeded: boolean
  tokensPerRequest: number
}

export type DashboardSummary = {
  averageCost: number
  averageDurationSeconds: number
  averageRequests: number
  anomalyCount: number
  criticalCount: number
  costTotal: number
  healthLabel: string
  peakHour: UsageDashboardRow | null
  requestTotal: number
  thresholdHitCount: number
  tokenTotal: number
  userPeak: number
}

export const dashboardMetricLabels: Record<DashboardMetric, string> = {
  cost: "Cost",
  tokens: "Tokens",
  traffic: "Traffic",
}

export const dashboardWindowLabels: Record<DashboardWindow, string> = {
  "6": "Last 6 hours",
  "12": "Last 12 hours",
  "24": "Last 24 hours",
  all: "All rows",
}

export function selectDashboardWindow(
  rows: UsageDashboardRow[],
  window: DashboardWindow
) {
  if (window === "all") {
    return rows
  }

  return rows.slice(-Number(window))
}

export function findDashboardRow<T extends UsageDashboardRow>(
  rows: readonly T[],
  bucketStart: string
) {
  return rows.find((row) => row.bucketStart === bucketStart) ?? null
}

export function summarizeDashboardRows(
  rows: readonly UsageDashboardRow[]
): DashboardSummary {
  const requestTotal = rows.reduce((total, row) => total + row.requests, 0)
  const tokenTotal = rows.reduce((total, row) => total + row.tokens, 0)
  const costTotal = rows.reduce((total, row) => total + row.cost, 0)
  const durationTotal = rows.reduce(
    (total, row) => total + row.durationSeconds,
    0
  )
  const rowCount = Math.max(rows.length, 1)
  const peakHour =
    rows.reduce<UsageDashboardRow | null>((currentPeak, row) => {
      if (!currentPeak || row.requests > currentPeak.requests) {
        return row
      }

      return currentPeak
    }, null) ?? null
  const signalRows = rows.filter(isDashboardSignalRow)
  const anomalyCount = signalRows.filter(
    (row) => row.anomalyReasons.length > 0
  ).length
  const criticalCount = signalRows.filter(
    (row) => row.severity === "critical"
  ).length
  const thresholdHitCount = signalRows.filter(
    (row) => row.thresholdExceeded
  ).length

  return {
    averageCost: costTotal / rowCount,
    averageDurationSeconds: durationTotal / rowCount,
    averageRequests: requestTotal / rowCount,
    anomalyCount,
    criticalCount,
    costTotal,
    healthLabel:
      criticalCount > 0 ? "Critical" : anomalyCount > 0 ? "Watch" : "Nominal",
    peakHour,
    requestTotal,
    thresholdHitCount,
    tokenTotal,
    userPeak: Math.max(0, ...rows.map((row) => row.users)),
  }
}

export function buildDashboardSignals(
  rows: UsageDashboardRow[],
  metric: DashboardMetric,
  thresholdPercent: number
): DashboardSignalRow[] {
  const baseline = summarizeDashboardRows(rows)
  const metricMax = Math.max(
    1,
    ...rows.map((row) => getDashboardMetricValue(row, metric))
  )
  const averageCostPerRequest = baseline.requestTotal
    ? baseline.costTotal / baseline.requestTotal
    : 0
  const averageTokensPerRequest = baseline.requestTotal
    ? baseline.tokenTotal / baseline.requestTotal
    : 0

  return rows.map((row) => {
    const metricValue = getDashboardMetricValue(row, metric)
    const metricScore = Math.round((metricValue / metricMax) * 100)
    const thresholdExceeded = metricScore >= thresholdPercent
    const costPerRequest = row.requests ? row.cost / row.requests : 0
    const tokensPerRequest = row.requests ? row.tokens / row.requests : 0
    const anomalyReasons = getAnomalyReasons({
      averageCostPerRequest,
      averageDurationSeconds: baseline.averageDurationSeconds,
      averageTokensPerRequest,
      metric,
      metricScore,
      row,
      thresholdExceeded,
    })
    const severity = getDashboardSeverity(
      anomalyReasons.length,
      metricScore,
      thresholdPercent
    )

    return {
      ...row,
      anomalyReasons,
      costPerRequest,
      metricScore,
      metricValue,
      nextAction: getNextAction(severity, anomalyReasons),
      severity,
      thresholdExceeded,
      tokensPerRequest,
    }
  })
}

export function filterDashboardSignals(
  rows: DashboardSignalRow[],
  anomalyOnly: boolean
) {
  return anomalyOnly
    ? rows.filter((row) => row.anomalyReasons.length > 0)
    : rows
}

export function getDashboardMetricValue(
  row: UsageDashboardRow,
  metric: DashboardMetric
) {
  if (metric === "cost") {
    return row.cost
  }

  if (metric === "tokens") {
    return row.tokens
  }

  return row.requests
}

export function getSeverityLabel(severity: DashboardSeverity) {
  if (severity === "critical") {
    return "Critical"
  }

  if (severity === "watch") {
    return "Watch"
  }

  return "Nominal"
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en").format(Math.round(value))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en", {
    currency: "USD",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(value)
}

export function formatDuration(value: number) {
  if (value < 60) {
    return `${Math.round(value)}s`
  }

  return `${Math.round(value / 60)}m`
}

export function rowToPayload(row: DashboardSignalRow | UsageDashboardRow | null) {
  if (!row) {
    return {
      selected: null,
    }
  }

  const signal = isDashboardSignalRow(row) ? row : null

  return {
    selected: {
      anomalyReasons: signal?.anomalyReasons ?? [],
      bucketStart: row.bucketStart,
      cost: row.cost,
      costPerRequest: signal?.costPerRequest ?? 0,
      durationSeconds: row.durationSeconds,
      hour: row.hour,
      metricScore: signal?.metricScore ?? null,
      nextAction: signal?.nextAction ?? null,
      requests: row.requests,
      severity: signal?.severity ?? null,
      tokens: row.tokens,
      thresholdExceeded: signal?.thresholdExceeded ?? null,
      tokensPerRequest: signal?.tokensPerRequest ?? 0,
      users: row.users,
    },
  }
}

function isDashboardSignalRow(row: UsageDashboardRow): row is DashboardSignalRow {
  return "severity" in row && "anomalyReasons" in row
}

function getAnomalyReasons({
  averageCostPerRequest,
  averageDurationSeconds,
  averageTokensPerRequest,
  metric,
  metricScore,
  row,
  thresholdExceeded,
}: {
  averageCostPerRequest: number
  averageDurationSeconds: number
  averageTokensPerRequest: number
  metric: DashboardMetric
  metricScore: number
  row: UsageDashboardRow
  thresholdExceeded: boolean
}) {
  const reasons: string[] = []
  const costPerRequest = row.requests ? row.cost / row.requests : 0
  const tokensPerRequest = row.requests ? row.tokens / row.requests : 0

  if (thresholdExceeded) {
    reasons.push(`${dashboardMetricLabels[metric]} pressure at ${metricScore}%`)
  }

  if (
    averageDurationSeconds > 0 &&
    row.durationSeconds > averageDurationSeconds * 1.3
  ) {
    reasons.push("Duration above baseline")
  }

  if (
    averageCostPerRequest > 0 &&
    costPerRequest > averageCostPerRequest * 1.35
  ) {
    reasons.push("Cost per request above baseline")
  }

  if (
    averageTokensPerRequest > 0 &&
    tokensPerRequest > averageTokensPerRequest * 1.35
  ) {
    reasons.push("Tokens per request above baseline")
  }

  return reasons
}

function getDashboardSeverity(
  anomalyCount: number,
  metricScore: number,
  thresholdPercent: number
): DashboardSeverity {
  if (metricScore >= Math.min(100, thresholdPercent + 20) || anomalyCount >= 3) {
    return "critical"
  }

  if (anomalyCount > 0) {
    return "watch"
  }

  return "nominal"
}

function getNextAction(severity: DashboardSeverity, reasons: string[]) {
  if (severity === "critical") {
    return "Open capacity review and cap expensive routes before the next peak."
  }

  if (reasons.some((reason) => reason.includes("Duration"))) {
    return "Inspect slow route mix and compare request traces for this hour."
  }

  if (reasons.some((reason) => reason.includes("Cost"))) {
    return "Review model mix, cache hit rate, and account-level spend guardrails."
  }

  if (reasons.some((reason) => reason.includes("Tokens"))) {
    return "Audit prompt volume and cache-read eligibility for the selected hour."
  }

  if (severity === "watch") {
    return "Keep this hour in the watch queue and compare the next sample."
  }

  return "No intervention queued; continue monitoring the current window."
}
