import type { UsageDashboardRow } from "../../lib/usage-dashboard"

export type DashboardMetric = "traffic" | "tokens" | "cost"
export type DashboardWindow = "6" | "12" | "24" | "all"

export type DashboardSummary = {
  averageCost: number
  averageDurationSeconds: number
  averageRequests: number
  costTotal: number
  peakHour: UsageDashboardRow | null
  requestTotal: number
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

export function findDashboardRow(
  rows: UsageDashboardRow[],
  bucketStart: string
) {
  return rows.find((row) => row.bucketStart === bucketStart) ?? null
}

export function summarizeDashboardRows(
  rows: UsageDashboardRow[]
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

  return {
    averageCost: costTotal / rowCount,
    averageDurationSeconds: durationTotal / rowCount,
    averageRequests: requestTotal / rowCount,
    costTotal,
    peakHour,
    requestTotal,
    tokenTotal,
    userPeak: Math.max(0, ...rows.map((row) => row.users)),
  }
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

export function rowToPayload(row: UsageDashboardRow | null) {
  if (!row) {
    return {
      selected: null,
    }
  }

  return {
    selected: {
      bucketStart: row.bucketStart,
      cost: row.cost,
      durationSeconds: row.durationSeconds,
      hour: row.hour,
      requests: row.requests,
      tokens: row.tokens,
      tokensPerRequest: row.requests ? row.tokens / row.requests : 0,
      users: row.users,
    },
  }
}
