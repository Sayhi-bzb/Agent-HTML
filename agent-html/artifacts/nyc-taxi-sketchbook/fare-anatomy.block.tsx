import {
  fareComponents,
  payment,
} from "./data/fare-anatomy"
import { taxiKpis } from "./data/trip-summary"
import { BarChart } from "../../components/chart/bar-chart"
import { PieChart } from "../../components/chart/pie-chart"

import { roughSketchMarkOptions } from "./rough-theme"
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
const largestComponent = [...components].sort((a, b) => b.value - a.value)[0]
const meterComponent = components.find((item) => item.key === "meter fare")
const tipComponent = components.find((item) => item.key === "tip")
const feeComponents = components.filter(
  (item) => item.key !== "meter fare" && item.key !== "tip"
)
const feeTotal = feeComponents.reduce((sum, item) => sum + item.value, 0)
const cardPayment = payment.find((item) => item.label === "Credit card")
const cashPayment = payment.find((item) => item.label === "Cash")

export default function FareAnatomyBlock() {
  return (
    <section className="canvas-stack-lg">
      <SectionIntro badge="04 / fare anatomy" title="Average totals stack meter fare with fees">
        The average trip total is about {formatCurrency(taxiKpis.averageTotal)}. <span className="text-foreground">Meter fare</span> is the base, but <span className="text-chart-2">tips, congestion charges, airport fees</span>, and tolls change how different ride scenarios feel in practice.
      </SectionIntro>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.62fr)_minmax(320px,0.38fr)]">
        <SketchPanel className="p-5">
          <BarChart
            aspectRatio="16 / 9"
            className="min-h-[360px]"
            data={components}
            minHeight={320}
            renderer="rough"
            rough={{
              ...roughSketchMarkOptions,
              fillStyle: "cross-hatch",
            }}
            xKey="label"
            yKey="value"
            yValueFormatter={formatCurrency}
          />
        </SketchPanel>

        <div className="canvas-stack-md">
          <div className="canvas-stack-xs">
            <span className="canvas-text-caption text-muted-foreground">
              average trip total
            </span>
            <strong className="canvas-text-title font-mono">
              {formatCurrency(taxiKpis.averageTotal)}
            </strong>
          </div>
          <RoughRule seed={91} tone="section" />

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div>
              <span className="canvas-text-caption text-muted-foreground">
                meter
              </span>
              <p className="canvas-text-body font-mono">
                {formatCurrency(meterComponent?.value ?? 0)}
              </p>
            </div>
            <div>
              <span className="canvas-text-caption text-muted-foreground">
                tip
              </span>
              <p className="canvas-text-body font-mono">
                {formatCurrency(tipComponent?.value ?? 0)}
              </p>
            </div>
            <div>
              <span className="canvas-text-caption text-muted-foreground">
                fees
              </span>
              <p className="canvas-text-body font-mono">
                {formatCurrency(feeTotal)}
              </p>
            </div>
          </div>

          <SketchAnnotation label="largest component">
            <strong className="canvas-text-heading font-mono">
              {largestComponent.label} {formatCurrency(largestComponent.value)}
            </strong>
            <p className="canvas-text-caption text-muted-foreground">
              {largestComponent.shareOfTotal}% of the average total before the
              smaller fees are stacked in.
            </p>
          </SketchAnnotation>

          <div className="grid gap-4 sm:grid-cols-[minmax(220px,0.48fr)_minmax(0,0.52fr)] lg:grid-cols-1 xl:grid-cols-[minmax(200px,0.48fr)_minmax(0,0.52fr)]">
            <PieChart
              aspectRatio="1 / 1"
              data={payment}
              legend
              minHeight={220}
              nameKey="label"
              renderer="rough"
              rough={roughSketchMarkOptions}
              valueKey="share"
            />
            <div className="canvas-stack-sm">
              <div>
                <span className="canvas-text-caption text-muted-foreground">
                  card share
                </span>
                <p className="canvas-text-body font-mono">
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
                <p className="canvas-text-body font-mono">
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
