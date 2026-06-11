import { taxiData } from "./data"
import { roughSketchChartStyle, roughTaxiChartColors } from "./rough-theme"
import { RoughBarChart, RoughPieChart } from "./rough-viz-charts"
import {
  SectionIntro,
  SketchNote,
  SketchPanel,
  formatCurrency,
} from "./sketch-components"

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
const componentChartData = {
  labels: components.map((item) => item.label),
  values: components.map((item) => item.value),
}
const paymentChartData = {
  labels: taxiData.payment.map((item) => item.label),
  values: taxiData.payment.map((item) => item.share),
}

export function FareAnatomyBlock() {
  return (
    <section className="canvas-stack-lg">
      <SectionIntro badge="04 / fare anatomy" title="总价不是一个数字，是一叠小条。">
        单次平均总额约 {formatCurrency(taxiData.kpis.averageTotal)}。计价器费用是主体，
        但小费、拥堵费、机场费和 tolls 会改变不同场景的真实体感。
      </SectionIntro>

      <div className="grid gap-5 lg:grid-cols-3">
        <SketchPanel className="lg:col-span-2">
          <RoughBarChart
            {...roughSketchChartStyle}
            axisFontSize=".78rem"
            color="var(--chart-2)"
            data={componentChartData}
            fillStyle="cross-hatch"
            heightClassName="min-h-[340px] [&_svg]:min-h-[340px]"
            margin={{ top: 44, right: 24, bottom: 76, left: 64 }}
            title="Average fare components"
            titleFontSize="17px"
            tooltipFontSize=".8rem"
            yValueFormat="$.2f"
          />
        </SketchPanel>

        <div className="canvas-stack-md">
          <SketchPanel>
            <div className="canvas-stack-sm">
              <RoughPieChart
                {...roughSketchChartStyle}
                colors={roughTaxiChartColors}
                data={paymentChartData}
                heightClassName="min-h-[300px] [&_svg]:min-h-[300px]"
                legend
                margin={{ top: 52, right: 72, bottom: 32, left: 32 }}
                title="Payment mix"
                titleFontSize="16px"
                tooltipFontSize=".8rem"
              />
              <div className="canvas-grid-gap-sm grid-cols-2">
                {taxiData.payment.map((item) => (
                  <div className="canvas-stack-xs" key={item.label}>
                    <span className="canvas-text-caption text-muted-foreground">
                      {item.label}
                    </span>
                    <strong className="font-mono">{item.share}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </SketchPanel>

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
