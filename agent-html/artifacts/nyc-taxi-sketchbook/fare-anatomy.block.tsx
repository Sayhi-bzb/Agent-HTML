import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../components/ui/chart"

import { taxiData } from "./data"
import {
  SectionIntro,
  SketchNote,
  SketchPanel,
  formatCurrency,
} from "./sketch-components"

const chartConfig = {
  value: {
    color: "var(--chart-2)",
    label: "average amount",
  },
} satisfies ChartConfig

const labels: Record<string, string> = {
  "airport fee": "airport",
  congestion: "congestion",
  extra: "extra",
  improvement: "improve",
  "meter fare": "meter",
  "mta tax": "MTA",
  tip: "tip",
  tolls: "tolls",
}

const components = taxiData.fareComponents.map((item) => ({
  ...item,
  label: labels[item.key] ?? item.key,
}))

export function FareAnatomyBlock() {
  return (
    <section className="canvas-stack-lg">
      <SectionIntro badge="04 / fare anatomy" title="总价不是一个数字，是一叠小条。">
        单次平均总额约 {formatCurrency(taxiData.kpis.averageTotal)}。计价器费用是主体，
        但小费、拥堵费、机场费和 tolls 会改变不同场景的真实体感。
      </SectionIntro>

      <div className="grid gap-5 lg:grid-cols-3">
        <SketchPanel className="lg:col-span-2">
          <ChartContainer
            className="h-80 w-full"
            config={chartConfig}
            initialDimension={{ height: 320, width: 720 }}
          >
            <BarChart accessibilityLayer data={components}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} />
              <YAxis tickFormatter={(value) => `$${value}`} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={2} />
            </BarChart>
          </ChartContainer>
        </SketchPanel>

        <div className="canvas-stack-md">
          <SketchPanel>
            <div className="canvas-stack-sm">
              {components.map((item) => (
                <div className="flex items-baseline justify-between gap-3" key={item.key}>
                  <span className="canvas-text-caption text-muted-foreground">
                    {item.label}
                  </span>
                  <strong className="font-mono">{formatCurrency(item.value)}</strong>
                </div>
              ))}
            </div>
          </SketchPanel>
          <SketchNote label="field note">
            `tip_amount` 不等于全部小费，它主要记录刷卡小费。现金支付行程的小费行为会被低估。
          </SketchNote>
        </div>
      </div>
    </section>
  )
}
