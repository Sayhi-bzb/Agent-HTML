import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
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
  formatCurrency,
  formatNumber,
  metricViewLabels,
  type UsageMetricView,
} from "./data"

type TrendChartBlockProps = {
  metricView: UsageMetricView
  requestThreshold: number
  selectedRow: UsageDashboardRow | null
  setSelectedRowKey: (key: string) => void
  visibleRows: UsageDashboardRow[]
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

function pickActiveRow(value: unknown, rows: UsageDashboardRow[]) {
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

export function TrendChartBlock({
  metricView,
  requestThreshold,
  selectedRow,
  setSelectedRowKey,
  visibleRows,
}: TrendChartBlockProps) {
  function selectChartPoint(state: unknown) {
    const row = pickActiveRow(state, visibleRows)

    if (row) {
      setSelectedRowKey(row.bucketStart)
    }
  }

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">{metricViewLabels[metricView]}</Badge>
          {selectedRow ? (
            <Badge variant="outline">selected {selectedRow.hour}</Badge>
          ) : null}
        </div>
        <h2 className="canvas-text-heading">Linked trend chart</h2>
        <p className="canvas-text-body text-muted-foreground">
          Click a chart point to drive the table selection and inspector block.
        </p>
      </div>

      <div className="canvas-content-panel min-w-0">
        {metricView === "traffic" ? (
          <ChartContainer config={trafficConfig}>
            <LineChart
              accessibilityLayer
              data={visibleRows}
              onClick={selectChartPoint}
            >
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
              <ReferenceLine
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                y={requestThreshold}
              />
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

        {metricView === "tokens" ? (
          <ChartContainer config={tokenConfig}>
            <AreaChart
              accessibilityLayer
              data={visibleRows}
              onClick={selectChartPoint}
            >
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

        {metricView === "cost" ? (
          <ChartContainer config={costConfig}>
            <AreaChart
              accessibilityLayer
              data={visibleRows}
              onClick={selectChartPoint}
            >
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
