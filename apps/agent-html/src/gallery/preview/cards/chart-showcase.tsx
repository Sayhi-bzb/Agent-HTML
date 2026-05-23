import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/agent-html/runtime/ui/chart"
import { ShowcaseShell } from "@/gallery/preview/cards/showcase-shell"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

const data = [
  { week: "W1", review: 18, publish: 10 },
  { week: "W2", review: 24, publish: 14 },
  { week: "W3", review: 21, publish: 17 },
  { week: "W4", review: 29, publish: 22 },
] as const

const chartConfig = {
  publish: {
    color: "var(--chart-2)",
    label: "Publish",
  },
  review: {
    color: "var(--chart-4)",
    label: "Review",
  },
} satisfies ChartConfig

export function ChartShowcase() {
  return (
    <ShowcaseShell
      title="Chart"
      description="Data visualization primitives for trend reading, legend mapping, and tooltip inspection."
      footer="This example proves the chart container, tooltip, and legend helpers together as one chart component family."
    >
      <ChartContainer className="h-60 w-full" config={chartConfig}>
        <AreaChart accessibilityLayer data={data} margin={{ left: 0, right: 8 }}>
          <defs>
            <linearGradient id="chart-review-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="var(--color-review)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--color-review)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="chart-publish-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="var(--color-publish)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-publish)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis axisLine={false} dataKey="week" tickLine={false} />
          <ChartLegend content={<ChartLegendContent />} verticalAlign="top" />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Area
            dataKey="review"
            fill="url(#chart-review-fill)"
            fillOpacity={1}
            stroke="var(--color-review)"
            strokeWidth={2}
            type="monotone"
          />
          <Area
            dataKey="publish"
            fill="url(#chart-publish-fill)"
            fillOpacity={1}
            stroke="var(--color-publish)"
            strokeWidth={2}
            type="monotone"
          />
        </AreaChart>
      </ChartContainer>
    </ShowcaseShell>
  )
}

