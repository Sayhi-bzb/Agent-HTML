import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/agent-html/runtime/ui/chart"
import type { AgentHtmlElementNode } from "@/agent-html/ast/types"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts"

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const

function isElement(
  node: AgentHtmlElementNode["children"][number]
): node is AgentHtmlElementNode {
  return node.type === "element"
}

function buildChartData(seriesKeys: string[]) {
  const labels = ["W1", "W2", "W3", "W4"]

  return labels.map((label, rowIndex) => {
    const row: Record<string, string | number> = { label }

    seriesKeys.forEach((key, seriesIndex) => {
      row[key] = 12 + rowIndex * 5 + seriesIndex * 7 + ((rowIndex + seriesIndex) % 3) * 4
    })

    return row
  })
}

export function ChartRuntime({ node }: { node: AgentHtmlElementNode }) {
  const seriesNodes = node.children.filter(
    (child): child is AgentHtmlElementNode =>
      isElement(child) && child.tag === "ChartSeries"
  )
  const tooltipNode = node.children.find(
    (child): child is AgentHtmlElementNode =>
      isElement(child) && child.tag === "ChartTooltip"
  )

  const chartType = node.attrs.type
  const seriesKeys = seriesNodes.map((series) => series.attrs.key)
  const chartConfig = Object.fromEntries(
    seriesNodes.map((series, index) => [
      series.attrs.key,
      {
        color: chartColors[index % chartColors.length],
        label: series.attrs.label ?? series.attrs.key,
      },
    ])
  ) satisfies ChartConfig

  const data = buildChartData(seriesKeys)
  const hideLabel = tooltipNode?.attrs.hideLabel === "true"

  if (chartType === "area") {
    return (
      <ChartContainer className="h-60 w-full" config={chartConfig}>
        <AreaChart accessibilityLayer data={data} margin={{ left: 0, right: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis axisLine={false} dataKey="label" tickLine={false} />
          <ChartTooltip
            content={
              <ChartTooltipContent hideLabel={hideLabel} indicator="line" />
            }
          />
          {seriesNodes.map((series) => (
            <Area
              key={series.attrs.key}
              dataKey={series.attrs.key}
              fill={`var(--color-${series.attrs.key})`}
              fillOpacity={0.2}
              stroke={`var(--color-${series.attrs.key})`}
              strokeWidth={2}
              type="monotone"
            />
          ))}
        </AreaChart>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer className="h-60 w-full" config={chartConfig}>
      <BarChart accessibilityLayer data={data} margin={{ left: 0, right: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis axisLine={false} dataKey="label" tickLine={false} />
        <ChartTooltip content={<ChartTooltipContent hideLabel={hideLabel} />} />
        {seriesNodes.map((series) => (
          <Bar
            key={series.attrs.key}
            dataKey={series.attrs.key}
            fill={`var(--color-${series.attrs.key})`}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

