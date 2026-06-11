import { Badge } from "../../components/ui/badge"

import { taxiData } from "./data"
import {
  LedgerRows,
  SketchNote,
  formatCompact,
  formatCurrency,
} from "./sketch-components"

const taxiHeroImage = {
  alt: "Abstract composition used as the NYC taxi sketchbook header image.",
  hrefBase:
    "/__agent-html/public/nyc-taxi-sketchbook/open-doodle-composition-10.svg",
}

export function TaxiHeaderBlock() {
  const { kpis, meta } = taxiData

  return (
    <section className="canvas-stack-lg">
      <figure
        aria-label={taxiHeroImage.alt}
        className="relative min-h-[420px] overflow-hidden rounded-md bg-background md:min-h-[520px]"
        role="img"
      >
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 3871 2367"
        >
          <use
            className="fill-muted"
            href={`${taxiHeroImage.hrefBase}#nyc-taxi-composition-background`}
          />
          <use
            className="fill-background"
            href={`${taxiHeroImage.hrefBase}#nyc-taxi-composition-shapes`}
          />
          <use
            className="fill-chart-1"
            href={`${taxiHeroImage.hrefBase}#nyc-taxi-composition-accent`}
          />
          <use
            className="fill-foreground"
            href={`${taxiHeroImage.hrefBase}#nyc-taxi-composition-ink`}
          />
          <use
            className="fill-chart-3 opacity-70 mix-blend-overlay"
            href={`${taxiHeroImage.hrefBase}#nyc-taxi-composition-glow`}
          />
        </svg>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,var(--background)_100%)]"
        />
      </figure>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="canvas-stack-md">
          <div className="canvas-stack-sm">
            <Badge variant="secondary">NYC TLC / October 2024</Badge>
            <h1 className="text-4xl font-semibold tracking-normal text-foreground md:text-5xl">
              A one-month ledger of NYC yellow taxi trips.
            </h1>
            <p className="canvas-text-body text-muted-foreground">
              NYC TLC Yellow Taxi Trip Record Data, filtered down to 3.67
              million trips. This sketchbook tracks pickup timing, geography,
              fares, and the long airport rides that bend the averages.
            </p>
          </div>
          <SketchNote label="data cut">
            Started with {formatCompact(kpis.rawTrips)} rows; kept{" "}
            {formatCompact(kpis.keptTrips)} after filtering bad timestamps,
            invalid zones, non-positive fares/distances, and extreme values.
            The reporting window is fixed to {meta.month}.
          </SketchNote>
        </div>

        <div className="canvas-stack-md">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="canvas-text-caption text-muted-foreground">
                recorded total amount
              </p>
              <p className="font-mono text-4xl font-semibold tracking-normal">
                {formatCurrency(kpis.totalAmount)}
              </p>
            </div>
            <Badge variant="outline">{meta.vehicle}</Badge>
          </div>
          <div className="grid gap-x-5 sm:grid-cols-2">
            <LedgerRows
              items={[
                {
                  label: "clean trips",
                  value: formatCompact(kpis.keptTrips),
                  note: "after filters",
                },
                {
                  label: "avg total",
                  value: formatCurrency(kpis.averageTotal),
                  note: "fare + fees + tip",
                },
                {
                  label: "avg distance",
                  value: `${kpis.averageDistance} mi`,
                  note: "mean trip_distance",
                },
              ]}
            />
            <LedgerRows
              items={[
                {
                  label: "median trip",
                  value: `${kpis.medianDistance} mi`,
                },
                {
                  label: "median total",
                  value: formatCurrency(kpis.medianTotal),
                },
                {
                  label: "card tip rate",
                  note: "cash tips are not fully captured",
                  value: `${kpis.cardTipRate}%`,
                },
                {
                  label: "avg passenger",
                  value: String(kpis.averagePassengers),
                  note: "reported count",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
