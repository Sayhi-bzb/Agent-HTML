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
    label: "结果",
  },
} satisfies ChartConfig

export function TrendViewBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-grid-gap md:grid-cols-2">
        <div className="canvas-stack-sm">
          <Badge variant="secondary">这几年有没有变</Badge>
          <h2 className="canvas-text-heading">
            有些项目要看今年，也要看前几年。
          </h2>
        </div>
        <p className="canvas-text-body text-muted-foreground">
          把 2025 年这次结果放回旧记录里。上升、接近上沿、突然变化，都比一个箭头更适合带去问。
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
              className="grid gap-4 md:grid-cols-2"
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
                      参考范围：{item.referenceRange}
                    </p>
                  </div>
                ) : null}

                <div className="canvas-stack-sm pt-2">
                  <Badge variant="outline">笔记</Badge>
                  <p className="canvas-text-body">{series.context}</p>
                  <p className="canvas-text-caption text-muted-foreground">
                    示例曲线只用来练习看连续变化。
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
