import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
} from "recharts"

import usageCsv from "../../data/public.usage_dashboard_hourly.csv?raw"
import { latestUsageRows, parseUsageDashboardCsv } from "../../lib/usage-dashboard"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../components/ui/chart"
import { Separator } from "../../components/ui/separator"

const usageRows = latestUsageRows(parseUsageDashboardCsv(usageCsv), 12)
const latestUsage = usageRows.at(-1)

const requestChartConfig = {
  requests: {
    color: "var(--chart-1)",
    label: "Requests",
  },
  users: {
    color: "var(--chart-2)",
    label: "Active users",
  },
} satisfies ChartConfig

const tokenChartConfig = {
  durationSeconds: {
    color: "var(--chart-3)",
    label: "Duration seconds",
  },
  tokens: {
    color: "var(--chart-4)",
    label: "Tokens",
  },
} satisfies ChartConfig

function Metric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="canvas-stack-xs canvas-content-panel-sm min-w-0">
      <span className="canvas-text-caption text-muted-foreground">{label}</span>
      <span className="canvas-text-body">{value}</span>
    </div>
  )
}

export function UsageChartBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <h2 className="canvas-text-heading">Usage chart</h2>
        <p className="canvas-text-body text-muted-foreground">
          Local dashboard data from `agent-html/data` rendered through the
          Canvas chart primitive.
        </p>
      </div>

      <div className="canvas-grid-gap md:grid-cols-4">
        <Metric
          label="Latest requests"
          value={(latestUsage?.requests ?? 0).toLocaleString()}
        />
        <Metric
          label="Active users"
          value={(latestUsage?.users ?? 0).toLocaleString()}
        />
        <Metric
          label="Duration"
          value={`${(latestUsage?.durationSeconds ?? 0).toLocaleString()}s`}
        />
        <Metric
          label="Cost"
          value={`$${(latestUsage?.cost ?? 0).toFixed(2)}`}
        />
      </div>

      <div className="canvas-grid-gap lg:grid-cols-2">
        <div className="canvas-stack-md canvas-content-panel min-w-0">
          <div className="canvas-stack-xs">
            <h3 className="canvas-text-body">Requests and users</h3>
            <p className="canvas-text-caption text-muted-foreground">
              Operational load compared with active user count.
            </p>
          </div>
          <ChartContainer config={requestChartConfig}>
            <LineChart accessibilityLayer data={usageRows}>
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="hour"
                tickLine={false}
                tickMargin={8}
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
        </div>

        <div className="canvas-stack-md canvas-content-panel min-w-0">
          <div className="canvas-stack-xs">
            <h3 className="canvas-text-body">Tokens and duration</h3>
            <p className="canvas-text-caption text-muted-foreground">
              Throughput shape across the same local sample window.
            </p>
          </div>
          <ChartContainer config={tokenChartConfig}>
            <AreaChart accessibilityLayer data={usageRows}>
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="hour"
                tickLine={false}
                tickMargin={8}
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
        </div>
      </div>

      <Separator />

      <p className="canvas-text-body text-muted-foreground">
        This block keeps data parsing in `lib`, data ownership in `data`, and
        chart rendering inside artifact source.
      </p>
    </section>
  )
}
