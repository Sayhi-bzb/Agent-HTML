import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "../../components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../components/ui/chart"
import type { UsageDashboardRow } from "../../lib/usage-dashboard"

import {
  dashboardMetricLabels,
  formatCurrency,
  formatNumber,
  type DashboardMetric,
} from "./data"

type TrendBlockProps = {
  metric: DashboardMetric
  rows: UsageDashboardRow[]
  selectedRow: UsageDashboardRow | null
  setSelectedRowKey: (key: string) => void
}

type ChartClickState = {
  activeTooltipIndex?: number | string
}

const trafficConfig = {
  requests: {
    color: "var(--chart-1)",
    label: "Requests",
  },
  users: {
    color: "var(--chart-2)",
    label: "Users",
  },
} satisfies ChartConfig

const tokenConfig = {
  durationSeconds: {
    color: "var(--chart-3)",
    label: "Duration",
  },
  tokens: {
    color: "var(--chart-4)",
    label: "Tokens",
  },
} satisfies ChartConfig

const costConfig = {
  accountCost: {
    color: "var(--chart-5)",
    label: "Account cost",
  },
  cost: {
    color: "var(--chart-1)",
    label: "Cost",
  },
} satisfies ChartConfig

function isChartClickState(value: unknown): value is ChartClickState {
  return typeof value === "object" && value !== null && "activeTooltipIndex" in value
}

function pickClickedRow(value: unknown, rows: UsageDashboardRow[]) {
  if (!isChartClickState(value)) {
    return null
  }

  const index =
    typeof value.activeTooltipIndex === "string"
      ? Number(value.activeTooltipIndex)
      : value.activeTooltipIndex

  if (typeof index !== "number" || Number.isNaN(index)) {
    return null
  }

  return rows[index] ?? null
}

export function TrendBlock({
  metric,
  rows,
  selectedRow,
  setSelectedRowKey,
}: TrendBlockProps) {
  function selectPoint(value: unknown) {
    const row = pickClickedRow(value, rows)

    if (row) {
      setSelectedRowKey(row.bucketStart)
    }
  }

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">{dashboardMetricLabels[metric]}</Badge>
          {selectedRow ? (
            <Badge variant="outline">selected {selectedRow.hour}</Badge>
          ) : null}
        </div>
        <h2 className="canvas-text-heading">Trend analysis</h2>
        <p className="canvas-text-body text-muted-foreground">
          Click a point to select the same record in the dashboard inspector.
        </p>
      </div>

      <div className="canvas-content-panel min-w-0">
        {metric === "traffic" ? (
          <ChartContainer config={trafficConfig}>
            <LineChart accessibilityLayer data={rows} onClick={selectPoint}>
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="hour"
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickFormatter={formatNumber}
                tickLine={false}
                width={48}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                dataKey="requests"
                dot={false}
                stroke="var(--chart-1)"
                strokeWidth={2}
                type="monotone"
              />
              <Line
                dataKey="users"
                dot={false}
                stroke="var(--chart-2)"
                strokeWidth={2}
                type="monotone"
              />
            </LineChart>
          </ChartContainer>
        ) : null}

        {metric === "tokens" ? (
          <ChartContainer config={tokenConfig}>
            <AreaChart accessibilityLayer data={rows} onClick={selectPoint}>
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="hour"
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickFormatter={formatNumber}
                tickLine={false}
                width={48}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="tokens"
                fill="var(--chart-4)"
                fillOpacity={0.18}
                stroke="var(--chart-4)"
                strokeWidth={2}
                type="monotone"
              />
              <Area
                dataKey="durationSeconds"
                fill="var(--chart-3)"
                fillOpacity={0.12}
                stroke="var(--chart-3)"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        ) : null}

        {metric === "cost" ? (
          <ChartContainer config={costConfig}>
            <AreaChart accessibilityLayer data={rows} onClick={selectPoint}>
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="hour"
                tickLine={false}
                tickMargin={8}
              />
              <YAxis
                axisLine={false}
                tickFormatter={formatCurrency}
                tickLine={false}
                width={56}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="accountCost"
                fill="var(--chart-5)"
                fillOpacity={0.12}
                stroke="var(--chart-5)"
                strokeWidth={2}
                type="monotone"
              />
              <Area
                dataKey="cost"
                fill="var(--chart-1)"
                fillOpacity={0.18}
                stroke="var(--chart-1)"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        ) : null}
      </div>
    </section>
  )
}
