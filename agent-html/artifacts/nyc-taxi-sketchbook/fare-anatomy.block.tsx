import { taxiData } from "./data"
import { roughSketchChartStyle, roughTaxiChartColors } from "./rough-theme"
import { RoughBarChart, RoughPieChart } from "./rough-viz-charts"
import {
  LedgerRows,
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
      <SectionIntro badge="04 / fare anatomy" title="Average totals stack meter fare with fees">
        The average trip total is about {formatCurrency(taxiData.kpis.averageTotal)}.
        Meter fare is the base, but tips, congestion charges, airport fees, and
        tolls change how different ride scenarios feel in practice.
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
            <LedgerRows
              items={taxiData.payment.slice(0, 4).map((item) => ({
                label: item.label,
                note: `${formatCurrency(item.averageTotal)} avg total`,
                value: `${item.share}%`,
              }))}
            />
          </div>

          <LedgerRows
            items={components.map((item) => ({
              label: item.label,
              note: `${item.shareOfTotal}% of average total`,
              value: formatCurrency(item.value),
            }))}
          />
          <SketchNote label="field note">
            `tip_amount` is not every tip. It mainly records credit-card tips,
            so tip behavior on cash-paid trips is undercounted.
          </SketchNote>
        </div>
      </div>
    </section>
  )
}
