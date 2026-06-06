import type { UsageDashboardRow } from "../../lib/usage-dashboard"

export type UsageMetricView = "traffic" | "tokens" | "cost"
export type UsageWindow = "6" | "12" | "24" | "all"

export type UsageSummary = {
  accountCost: number
  averageCost: number
  averageRequests: number
  averageTokens: number
  costPerRequest: number
  peakRequests: number
  requestTotal: number
  tokenTotal: number
  userPeak: number
}

export const metricViewLabels: Record<UsageMetricView, string> = {
  cost: "Cost",
  tokens: "Tokens",
  traffic: "Traffic",
}

export const windowLabels: Record<UsageWindow, string> = {
  "6": "Last 6 hours",
  "12": "Last 12 hours",
  "24": "Last 24 hours",
  all: "All rows",
}

export function selectWindowRows(
  rows: UsageDashboardRow[],
  window: UsageWindow
) {
  if (window === "all") {
    return rows
  }

  return rows.slice(-Number(window))
}

export function findUsageRow(rows: UsageDashboardRow[], bucketStart: string) {
  return rows.find((row) => row.bucketStart === bucketStart) ?? null
}

export function summarizeUsageRows(rows: UsageDashboardRow[]): UsageSummary {
  const requestTotal = sum(rows, "requests")
  const tokenTotal = sum(rows, "tokens")
  const accountCost = sum(rows, "accountCost")
  const costTotal = sum(rows, "cost")
  const rowCount = Math.max(rows.length, 1)

  return {
    accountCost,
    averageCost: costTotal / rowCount,
    averageRequests: requestTotal / rowCount,
    averageTokens: tokenTotal / rowCount,
    costPerRequest: requestTotal ? costTotal / requestTotal : 0,
    peakRequests: Math.max(0, ...rows.map((row) => row.requests)),
    requestTotal,
    tokenTotal,
    userPeak: Math.max(0, ...rows.map((row) => row.users)),
  }
}

export function maxRequestCount(rows: UsageDashboardRow[]) {
  return Math.max(1, ...rows.map((row) => row.requests))
}

export function defaultRequestThreshold(rows: UsageDashboardRow[]) {
  return Math.round(maxRequestCount(rows) * 0.7)
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

export function formatSeconds(value: number) {
  if (value < 60) {
    return `${Math.round(value)}s`
  }

  return `${Math.round(value / 60)}m`
}

export function formatRatio(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
  }).format(value)
}

export function rowSnapshot(row: UsageDashboardRow | null) {
  if (!row) {
    return {
      selected: null,
    }
  }

  return {
    selected: {
      accountCost: row.accountCost,
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

function sum(rows: UsageDashboardRow[], key: keyof UsageDashboardRow) {
  return rows.reduce((total, row) => {
    const value = row[key]

    return typeof value === "number" ? total + value : total
  }, 0)
}
