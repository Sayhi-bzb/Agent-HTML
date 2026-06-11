import { LineChart, type ChartConfig } from "../../components/chart"
import { Badge } from "../../components/ui/badge"
import { StatusBadge } from "../../components/ui/status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"

import { trendSeries } from "./data/lab-trend-review"
import { labItemByCode } from "./data/report"
import { statusFor } from "./data/status"

const chartConfig = {
  value: {
    color: "var(--chart-1)",
    label: "结果",
  },
} satisfies ChartConfig

export function LabTrendReviewBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">检验趋势复核</Badge>
        <h2 className="canvas-text-heading">
          有些项目要看今年，也要看前几年。
        </h2>
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
              <LineChart
                className="h-80 w-full"
                config={chartConfig}
                data={series.points}
                referenceY={latest?.value}
                xKey="year"
                yKey="value"
              />

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
                    <p className="canvas-text-caption text-muted-foreground">
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
