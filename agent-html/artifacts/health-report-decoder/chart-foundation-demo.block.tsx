import { AreaChart } from "../../components/chart/area-chart"
import { BarChart, BarHChart } from "../../components/chart/bar-chart"
import { LineChart } from "../../components/chart/line-chart"
import { PieChart } from "../../components/chart/pie-chart"

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

export default function ChartFoundationDemoBlock() {
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
          data={trendData}
          minHeight={260}
          xKey="month"
          yKey="value"
        />
        <AreaChart
          data={trendData}
          minHeight={260}
          xKey="month"
          yKey="value"
        />
        <BarChart
          data={categoryData}
          minHeight={260}
          renderer="rough"
          xKey="label"
          yKey="value"
        />
        <BarHChart
          data={categoryData}
          minHeight={260}
          renderer="rough"
          xKey="value"
          yKey="label"
        />
        <PieChart
          className="lg:col-span-2"
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
