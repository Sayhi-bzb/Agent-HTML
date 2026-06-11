import {
  fareComponents,
  payment,
} from "./data/generated-fare-anatomy"
import { taxiKpis } from "./data/generated-trip-summary"
import { roughSketchChartStyle, roughTaxiChartColors } from "./rough-theme"
import { RoughBarChart, RoughPieChart } from "./rough-viz-charts"
import {
  RoughRule,
  SectionIntro,
  SketchAnnotation,
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

const components = fareComponents.map((item) => ({
  ...item,
  label: labels[item.key] ?? item.key,
}))
const componentChartData = {
  labels: components.map((item) => item.label),
  values: components.map((item) => item.value),
}
const paymentChartData = {
  labels: payment.map((item) => item.label),
  values: payment.map((item) => item.share),
}
const largestComponent = [...components].sort((a, b) => b.value - a.value)[0]
const meterComponent = components.find((item) => item.key === "meter fare")
const tipComponent = components.find((item) => item.key === "tip")
const feeComponents = components.filter(
  (item) => item.key !== "meter fare" && item.key !== "tip"
)
const feeTotal = feeComponents.reduce((sum, item) => sum + item.value, 0)
const cardPayment = payment.find((item) => item.label === "Credit card")
const cashPayment = payment.find((item) => item.label === "Cash")

export function FareAnatomyBlock() {
  return (
    <section className="canvas-stack-lg">
      <SectionIntro badge="04 / fare anatomy" title="Average totals stack meter fare with fees">
        The average trip total is about {formatCurrency(taxiKpis.averageTotal)}.
        {" "}
        <span className="text-foreground">Meter fare</span> is the base, but{" "}
        <span className="text-chart-2">tips, congestion charges, airport fees</span>
        , and tolls change how different ride scenarios feel in practice.
      </SectionIntro>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.62fr)_minmax(320px,0.38fr)]">
        <SketchPanel className="p-0">
          <RoughBarChart
            {...roughSketchChartStyle}
            axisFontSize=".78rem"
            color="var(--chart-2)"
            data={componentChartData}
            fillStyle="cross-hatch"
            heightClassName="min-h-[360px] [&_svg]:min-h-[360px]"
            margin={{ top: 44, right: 24, bottom: 76, left: 64 }}
            title="Average fare components"
            titleFontSize="17px"
            tooltipFontSize=".8rem"
            yValueFormat="$.2f"
          />
        </SketchPanel>

        <div className="canvas-stack-md">
          <div className="canvas-stack-xs">
            <span className="canvas-text-caption text-muted-foreground">
              average trip total
            </span>
            <strong className="font-mono text-5xl font-semibold tracking-normal">
              {formatCurrency(taxiKpis.averageTotal)}
            </strong>
          </div>
          <RoughRule seed={91} tone="section" />

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div>
              <span className="canvas-text-caption text-muted-foreground">
                meter
              </span>
              <p className="font-mono text-xl font-semibold tracking-normal">
                {formatCurrency(meterComponent?.value ?? 0)}
              </p>
            </div>
            <div>
              <span className="canvas-text-caption text-muted-foreground">
                tip
              </span>
              <p className="font-mono text-xl font-semibold tracking-normal">
                {formatCurrency(tipComponent?.value ?? 0)}
              </p>
            </div>
            <div>
              <span className="canvas-text-caption text-muted-foreground">
                fees
              </span>
              <p className="font-mono text-xl font-semibold tracking-normal">
                {formatCurrency(feeTotal)}
              </p>
            </div>
          </div>

          <SketchAnnotation label="largest component">
            <strong className="font-mono text-2xl font-semibold tracking-normal">
              {largestComponent.label} {formatCurrency(largestComponent.value)}
            </strong>
            <p className="canvas-text-caption text-muted-foreground">
              {largestComponent.shareOfTotal}% of the average total before the
              smaller fees are stacked in.
            </p>
          </SketchAnnotation>

          <div className="grid gap-4 sm:grid-cols-[minmax(220px,0.48fr)_minmax(0,0.52fr)] lg:grid-cols-1 xl:grid-cols-[minmax(200px,0.48fr)_minmax(0,0.52fr)]">
            <RoughPieChart
              {...roughSketchChartStyle}
              colors={roughTaxiChartColors}
              data={paymentChartData}
              heightClassName="min-h-[220px] [&_svg]:min-h-[220px]"
              legend
              margin={{ top: 40, right: 72, bottom: 22, left: 16 }}
              title="Payment mix"
              titleFontSize="15px"
              tooltipFontSize=".8rem"
            />
            <div className="canvas-stack-sm">
              <div>
                <span className="canvas-text-caption text-muted-foreground">
                  card share
                </span>
                <p className="font-mono text-xl font-semibold tracking-normal">
                  {cardPayment?.share}%
                </p>
                <p className="canvas-text-caption text-muted-foreground">
                  {formatCurrency(cardPayment?.averageTotal ?? 0)} avg total
                </p>
              </div>
              <RoughRule seed={92} tone="table" />
              <div>
                <span className="canvas-text-caption text-muted-foreground">
                  cash share
                </span>
                <p className="font-mono text-xl font-semibold tracking-normal">
                  {cashPayment?.share}%
                </p>
                <p className="canvas-text-caption text-muted-foreground">
                  {formatCurrency(cashPayment?.averageTotal ?? 0)} avg total
                </p>
              </div>
            </div>
          </div>
          <SketchNote label="field note">
            <span className="text-chart-2">`tip_amount`</span> is not every
            tip. It mainly records credit-card tips, so tip behavior on
            cash-paid trips is undercounted.
          </SketchNote>
        </div>
      </div>
    </section>
  )
}
