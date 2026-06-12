import {
  AreaChart,
  BarChart,
  BarHChart,
  LineChart,
  PieChart,
} from "../../components/chart"
import type { ChartConfig } from "../../components/ui/chart"

const trendData = [
  { month: "Jan", value: 42 },
  { month: "Feb", value: 48 },
  { month: "Mar", value: 45 },
  { month: "Apr", value: 56 },
]

const categoryData = [
  { label: "LDL", value: 128 },
  { label: "HDL", value: 54 },
  { label: "TG", value: 136 },
]

const shareData = [
  { label: "Normal", share: 62 },
  { label: "Watch", share: 27 },
  { label: "Review", share: 11 },
]

const valueConfig = {
  value: {
    color: "var(--chart-1)",
    label: "Value",
  },
} satisfies ChartConfig

const categoryConfig = {
  value: {
    color: "var(--chart-2)",
    label: "Result",
  },
} satisfies ChartConfig

const shareConfig = Object.fromEntries(
  shareData.map((item, index) => [
    item.label,
    {
      color: `var(--chart-${(index % 5) + 1})`,
      label: item.label,
    },
  ])
) satisfies ChartConfig

export function ChartFoundationDemoBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-xs">
        <p className="canvas-text-caption text-muted-foreground">
          chart foundation regression
        </p>
        <h2 className="canvas-text-heading">
          Semantic chart components consume the shared foundation.
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <LineChart
          config={valueConfig}
          data={trendData}
          minHeight={260}
          xKey="month"
          yKey="value"
        />
        <AreaChart
          config={valueConfig}
          data={trendData}
          minHeight={260}
          xKey="month"
          yKey="value"
        />
        <BarChart
          config={categoryConfig}
          data={categoryData}
          minHeight={260}
          renderer="rough"
          xKey="label"
          yKey="value"
        />
        <BarHChart
          config={categoryConfig}
          data={categoryData}
          minHeight={260}
          renderer="rough"
          xKey="value"
          yKey="label"
        />
        <PieChart
          className="lg:col-span-2"
          config={shareConfig}
          data={shareData}
          legend
          minHeight={260}
          nameKey="label"
          renderer="rough"
          valueKey="share"
        />
      </div>
    </section>
  )
}
