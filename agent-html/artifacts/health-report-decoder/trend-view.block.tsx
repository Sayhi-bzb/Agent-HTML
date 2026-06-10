import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../components/ui/chart"
import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"

import { trendMetrics } from "./data"

const chartConfig = {
  value: {
    color: "var(--chart-1)",
    label: "result",
  },
} satisfies ChartConfig

export function TrendViewBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">trend view</Badge>
        <h2 className="canvas-text-heading">
          趋势比一次结果更接近真实。
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          单次红点可能只是波动。连续变化、组合变化和复查条件，才更适合带去和医生确认。
        </p>
      </div>

      <Tabs defaultValue={trendMetrics[0]?.label} className="canvas-stack-md">
        <TabsList>
          {trendMetrics.map((metric) => (
            <TabsTrigger key={metric.label} value={metric.label}>
              {metric.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {trendMetrics.map((metric) => (
          <TabsContent className="canvas-grid-gap md:grid-cols-3" key={metric.label} value={metric.label}>
            <div className="canvas-content-panel md:col-span-2">
              <ChartContainer
                className="h-72 w-full"
                config={chartConfig}
                initialDimension={{ height: 288, width: 640 }}
              >
                <LineChart accessibilityLayer data={metric.points}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="year" tickLine={false} />
                  <YAxis
                    tickLine={false}
                    width={36}
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ReferenceLine
                    stroke="var(--border)"
                    strokeDasharray="3 3"
                    y={metric.points[metric.points.length - 1]?.value}
                  />
                  <Line
                    dataKey="value"
                    dot
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    type="monotone"
                  />
                </LineChart>
              </ChartContainer>
            </div>

            <div className="canvas-content-panel-sm canvas-stack-sm">
              <Badge variant="outline">{metric.unit}</Badge>
              <h3 className="canvas-text-heading">{metric.label}</h3>
              <p className="canvas-text-body text-muted-foreground">
                {metric.note}
              </p>
              <p className="canvas-text-caption text-muted-foreground">
                图中数值是虚构示例，只说明趋势阅读方式，不表达预测、评分或诊断。
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
