import { HeatmapChart } from "../../components/chart/heatmap-chart"
import { hourDay } from "./data/city-rhythm"
import { roughSketchMarkOptions } from "./rough-theme"
import {
  LedgerRows,
  SectionIntro,
  SketchAnnotation,
  SketchNote,
  SketchPanel,
  dayLabels,
  formatCompact,
  formatCurrency,
} from "./sketch-components"

const hours = Array.from({ length: 24 }, (_, hour) => hour)

function formatHour(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`
}

function weightedAverageTotal(
  items: ReadonlyArray<{ averageTotal: number; trips: number }>
) {
  const trips = items.reduce((sum, item) => sum + item.trips, 0)
  const total = items.reduce(
    (sum, item) => sum + item.trips * item.averageTotal,
    0
  )

  return total / trips
}

function getTripDensityKey(cell: { trips: number }, peakTrips: number) {
  const ratio = peakTrips > 0 ? cell.trips / peakTrips : 0

  if (ratio >= 0.82) {
    return "peak"
  }

  if (ratio >= 0.58) {
    return "high"
  }

  if (ratio >= 0.32) {
    return "mid"
  }

  return "low"
}

export default function CityRhythmBlock() {
  const peak = [...hourDay].sort((a, b) => b.trips - a.trips)[0]
  const priciest = [...hourDay].sort(
    (a, b) => b.averageTotal - a.averageTotal
  )[0]
  const overnightItems = hourDay.filter((item) => item.hour < 6)
  const overnightTrips = overnightItems.reduce((sum, item) => sum + item.trips, 0)
  const overnightAverageTotal = weightedAverageTotal(overnightItems)

  return (
    <section className="canvas-stack-lg">
      <SectionIntro badge="01 / hour grid" title="Pickup density by weekday and hour">
        Columns run across the 24 hours of a day; rows run down the week. The
        color bands and opacity both encode pickup volume, making commute,
        dinner, and late-night shift changes easier to spot.
      </SectionIntro>

      <div className="canvas-stack-md">
        <SketchPanel>
          <div className="overflow-x-auto">
            <HeatmapChart
              aspectRatio="4 / 1"
              className="min-w-[760px]"
              colorKey={(cell) => getTripDensityKey(cell, peak.trips)}
              config={{
                high: {
                  color: "var(--chart-3)",
                  label: "high volume",
                },
                low: {
                  color: "var(--chart-4)",
                  label: "low volume",
                },
                mid: {
                  color: "var(--chart-1)",
                  label: "medium volume",
                },
                peak: {
                  color: "var(--foreground)",
                  label: "peak volume",
                },
              }}
              data={hourDay}
              renderTooltip={({ datum }) => (
                <div className="canvas-stack-xs">
                  <strong className="canvas-text-body font-mono">
                    {dayLabels[datum.day]} {formatHour(datum.hour)}
                  </strong>
                  <span>trips {datum.trips.toLocaleString()}</span>
                  <span>avg total {formatCurrency(datum.averageTotal)}</span>
                  <span>avg distance {datum.averageDistance} mi</span>
                </div>
              )}
              renderer="rough"
              rough={{
                ...roughSketchMarkOptions,
                strokeWidth: 1,
              }}
              valueKey="trips"
              xKey="hour"
              xLabelFormatter={(hour) => String(hour)}
              xLabels={hours}
              yKey="day"
              yLabelFormatter={(day) => dayLabels[Number(day)]}
              yLabels={dayLabels.map((_, index) => index)}
            />
          </div>
        </SketchPanel>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.7fr)_minmax(260px,0.3fr)]">
          <SketchAnnotation label="peak cell">
            <p className="canvas-text-heading font-mono">
              {dayLabels[peak.day]} {peak.hour}:00
            </p>
            <p className="canvas-text-caption text-muted-foreground">
              {peak.trips.toLocaleString()} pickups, with an average total of {formatCurrency(peak.averageTotal)}.
            </p>
          </SketchAnnotation>
          <LedgerRows
            items={[
              {
                label: "highest average total",
                note: `${dayLabels[priciest.day]} ${formatHour(priciest.hour)}`,
                value: formatCurrency(priciest.averageTotal),
              },
              {
                label: "overnight trips",
                note: "00:00-05:59 across the month",
                value: formatCompact(overnightTrips),
              },
              {
                label: "overnight avg total",
                note: "weighted by trips",
                value: formatCurrency(overnightAverageTotal),
              },
            ]}
          />
        </div>
        <SketchNote>
          The darkest cells cluster from <span className="text-foreground">
            weekday afternoons into evening
          </span>. Overnight volume thins out, but average totals rise,
          pointing to <span className="text-chart-3">airport and longer-distance trips</span> beyond short city commutes.
        </SketchNote>
      </div>
    </section>
  )
}
