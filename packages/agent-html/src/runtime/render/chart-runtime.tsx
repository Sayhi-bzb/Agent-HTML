import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/agent-html/runtime/ui/chart"
import type { AgentHtmlElementNode } from "@/agent-html/ast/types"
import type * as React from "react"
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

function BarTooltipCursor({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  className,
}: React.SVGProps<SVGRectElement>) {
  const lineX = Number(x) + Number(width) / 2

  return (
    <line
      className={className}
      pointerEvents="none"
      stroke="var(--border)"
      x1={lineX}
      x2={lineX}
      y1={Number(y)}
      y2={Number(y) + Number(height)}
    />
  )
}

export function ChartRuntime({ node }: { node: AgentHtmlElementNode }) {
  const seriesNodes = node.children.filter(
    (child): child is AgentHtmlElementNode =>
      isElement(child) && child.tag === "ChartSeries"
  )
  const rowNodes = node.children.filter(
    (child): child is AgentHtmlElementNode =>
      isElement(child) && child.tag === "ChartRow"
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

  const data = rowNodes.map((rowNode) => {
    const row: Record<string, string | number> = {
      label: rowNode.attrs.label,
    }

    seriesKeys.forEach((key) => {
      row[key] = Number(rowNode.attrs[key])
    })

    return row
  })
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
      <BarChart
        accessibilityLayer
        barCategoryGap="40%"
        barGap={8}
        data={data}
        margin={{ left: 0, right: 8 }}
        maxBarSize={48}
      >
        <CartesianGrid vertical={false} />
        <XAxis axisLine={false} dataKey="label" tickLine={false} />
        <ChartTooltip
          content={<ChartTooltipContent hideLabel={hideLabel} />}
          cursor={<BarTooltipCursor />}
        />
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

