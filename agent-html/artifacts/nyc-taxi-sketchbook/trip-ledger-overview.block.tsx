import { Badge } from "../../components/ui/badge"
import { artifactPublicUrlFactory } from "../../lib/public-url"

import { taxiKpis, taxiMeta } from "./data/trip-summary"
import {
  LedgerRows,
  SketchNote,
  formatCompact,
  formatCurrency,
} from "./sketch-components"

const publicUrl = artifactPublicUrlFactory("nyc-taxi-sketchbook")

const tripLedgerOverviewImage = {
  alt: "Abstract composition used as the NYC taxi sketchbook overview composition.",
  hrefBase: publicUrl("trip-ledger-overview-composition.svg"),
}

export default function TripLedgerOverviewBlock() {
  return (
    <section className="canvas-stack-lg">
      <figure
        aria-label={tripLedgerOverviewImage.alt}
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
            href={`${tripLedgerOverviewImage.hrefBase}#nyc-taxi-composition-background`}
          />
          <use
            className="fill-background"
            href={`${tripLedgerOverviewImage.hrefBase}#nyc-taxi-composition-shapes`}
          />
          <use
            className="fill-chart-1"
            href={`${tripLedgerOverviewImage.hrefBase}#nyc-taxi-composition-accent`}
          />
          <use
            className="fill-foreground"
            href={`${tripLedgerOverviewImage.hrefBase}#nyc-taxi-composition-ink`}
          />
          <use
            className="fill-chart-3 opacity-70"
            href={`${tripLedgerOverviewImage.hrefBase}#nyc-taxi-composition-glow`}
          />
        </svg>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,var(--background)_100%)]"
        />
      </figure>

      <div className="canvas-grid-2-lg">
        <div className="canvas-stack-md">
          <div className="canvas-stack-sm">
            <Badge variant="secondary">NYC TLC / October 2024</Badge>
            <h1 className="canvas-text-title text-foreground">
              A one-month ledger of NYC yellow taxi trips.
            </h1>
            <p className="canvas-text-body text-muted-foreground">
              NYC TLC Yellow Taxi Trip Record Data, filtered down to <span className="text-foreground">3.67 million trips</span>. This
              sketchbook tracks <span className="text-foreground">
                pickup timing, geography, fares
              </span>, and the <span className="text-chart-2">long airport rides</span> that bend
              the averages.
            </p>
          </div>
          <SketchNote label="data cut">
            Started with {formatCompact(taxiKpis.rawTrips)} rows; kept {formatCompact(taxiKpis.keptTrips)} after filtering bad timestamps,
            invalid zones, non-positive fares/distances, and extreme values.
            The reporting window is fixed to {taxiMeta.month}.
          </SketchNote>
        </div>

        <div className="canvas-stack-md">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="canvas-text-caption text-muted-foreground">
                recorded total amount
              </p>
              <p className="canvas-text-heading font-mono">
                {formatCurrency(taxiKpis.totalAmount)}
              </p>
            </div>
            <Badge variant="outline">{taxiMeta.vehicle}</Badge>
          </div>
          <div className="grid gap-x-5 sm:grid-cols-2">
            <LedgerRows
              items={[
                {
                  label: "clean trips",
                  value: formatCompact(taxiKpis.keptTrips),
                  note: "after filters",
                },
                {
                  label: "avg total",
                  value: formatCurrency(taxiKpis.averageTotal),
                  note: "fare + fees + tip",
                },
                {
                  label: "avg distance",
                  value: `${taxiKpis.averageDistance} mi`,
                  note: "mean trip_distance",
                },
              ]}
            />
            <LedgerRows
              items={[
                {
                  label: "median trip",
                  value: `${taxiKpis.medianDistance} mi`,
                },
                {
                  label: "median total",
                  value: formatCurrency(taxiKpis.medianTotal),
                },
                {
                  label: "card tip rate",
                  note: "cash tips are not fully captured",
                  value: `${taxiKpis.cardTipRate}%`,
                },
                {
                  label: "avg passenger",
                  value: String(taxiKpis.averagePassengers),
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
