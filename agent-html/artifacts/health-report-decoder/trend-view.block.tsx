import {
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
import { StatusBadge } from "../../components/ui/status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"

import { labItemByCode, statusFor, trendSeries } from "./data"

const chartConfig = {
  value: {
    color: "var(--chart-1)",
    label: "result",
  },
} satisfies ChartConfig

export function TrendViewBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-grid-gap md:grid-cols-2">
        <div className="canvas-stack-sm">
          <Badge variant="secondary">single red dot vs trend</Badge>
          <h2 className="canvas-text-heading">
            身体不是一次截图，而是一条曲线。
          </h2>
        </div>
        <p className="canvas-text-body text-muted-foreground">
          同一个 flagged result 留在图表旁边，防止趋势变成抽象数据。这里看的是复查和沟通线索，不是预测。
        </p>
      </div>

      <Tabs defaultValue={trendSeries[0]?.code} className="canvas-stack-md">
        <TabsList>
          {trendSeries.map((series) => (
            <TabsTrigger key={series.code} value={series.code}>
              {series.code}
            </TabsTrigger>
          ))}
        </TabsList>

        {trendSeries.map((series) => {
          const item = labItemByCode(series.code)
          const meta = item ? statusFor(item.status) : null
          const latest = series.points[series.points.length - 1]

          return (
            <TabsContent
              className="grid gap-4 rounded-md border bg-background p-4 md:grid-cols-2"
              key={series.code}
              value={series.code}
            >
              <ChartContainer
                className="h-80 w-full"
                config={chartConfig}
                initialDimension={{ height: 320, width: 720 }}
              >
                <LineChart accessibilityLayer data={series.points}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="year" tickLine={false} />
                  <YAxis tickLine={false} width={38} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {latest ? (
                    <ReferenceLine
                      stroke="var(--border)"
                      strokeDasharray="3 3"
                      y={latest.value}
                    />
                  ) : null}
                  <Line
                    dataKey="value"
                    dot
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    type="monotone"
                  />
                </LineChart>
              </ChartContainer>

              <div className="canvas-stack-md">
                {item ? (
                  <div className="canvas-stack-sm">
                    <div className="canvas-wrap-sm items-center">
                      {meta ? (
                        <StatusBadge status={meta.status}>{item.code}</StatusBadge>
                      ) : null}
                      <Badge variant="outline">{item.rawNote}</Badge>
                    </div>
                    <p className="canvas-text-heading">
                      {item.result}
                      {item.unit ? ` ${item.unit}` : ""}
                    </p>
                    <p className="font-mono text-sm text-muted-foreground">
                      reference: {item.referenceRange}
                    </p>
                  </div>
                ) : null}

                <div className="canvas-stack-sm border-t pt-4">
                  <Badge variant="outline">trend reading</Badge>
                  <p className="canvas-text-body">{series.context}</p>
                  <p className="canvas-text-caption text-muted-foreground">
                    示例曲线只说明如何阅读连续变化，不表达预测、评分或诊断。
                  </p>
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </section>
  )
}
