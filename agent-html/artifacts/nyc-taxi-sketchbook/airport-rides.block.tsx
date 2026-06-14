import { useCallback } from "react"

import { Badge } from "../../components/ui/badge"

import { airport } from "./data/airport-rides"
import { roughSketchMarkOptions } from "./rough-theme"
import { RoughSvgLayer, type RoughSvgDraw } from "../../lib/rough-svg"
import {
  RoughRule,
  SectionIntro,
  SketchNote,
  SketchPanel,
  formatCompact,
  formatCurrency,
} from "./sketch-components"

const airportRuleSeeds = [73, 109, 88]

function AirportRouteSketch({ className = "h-14 w-20" }: { className?: string }) {
  const drawAirportRoute = useCallback<RoughSvgDraw>((roughSvg, group) => {
    group.appendChild(
      roughSvg.path("M8 42 C30 30, 52 26, 88 22", {
        ...roughSketchMarkOptions,
        fill: "none",
        seed: 11,
        strokeLineDash: [4, 5],
        strokeLineDashOffset: 0,
        strokeWidth: 1.2,
      })
    )
    group.appendChild(
      roughSvg.path("M62 16 L88 22 L62 30 L68 23 Z", {
        ...roughSketchMarkOptions,
        fill: "currentColor",
        hachureGap: 4,
        seed: 17,
      })
    )
  }, [])

  return (
    <svg
      aria-hidden="true"
      className={`${className} text-muted-foreground`}
      viewBox="0 0 96 64"
    >
      <RoughSvgLayer draw={drawAirportRoute} />
    </svg>
  )
}

export default function AirportRidesBlock() {
  return (
    <section className="canvas-stack-lg">
      <SectionIntro badge="05 / airport rides" title="Airport trips lift distance and total fare">
        <span className="text-chart-2">JFK, LaGuardia, and Newark</span> are
        not the largest trip buckets, but their rides run longer, cost more, and
        help explain part of the higher overnight average.
      </SectionIntro>

      <div className="grid gap-5 lg:grid-cols-[minmax(180px,0.28fr)_minmax(0,0.72fr)]">
        <SketchPanel>
          <div className="flex h-full min-h-48 flex-col justify-between gap-5">
            <div className="canvas-stack-xs">
              <Badge variant="outline">airport comparison</Badge>
              <p className="canvas-text-caption text-muted-foreground">
                Same fields, one row per airport, so the long-haul premium is
                visible without three separate cards.
              </p>
            </div>
            <SketchNote>
              Newark appears in the TLC zone lookup, but it is not an NYC
              borough. EWR is kept here so airport flows and fare structure
              stay complete.
            </SketchNote>
            <AirportRouteSketch className="h-24 w-36 self-end" />
          </div>
        </SketchPanel>

        <div className="overflow-x-auto">
          <div className="min-w-[620px]">
            <div className="grid grid-cols-[minmax(180px,1.2fr)_repeat(4,minmax(90px,1fr))] gap-3 px-3 py-2">
              <span className="canvas-text-caption text-muted-foreground">
                airport
              </span>
              <span className="canvas-text-caption text-right text-muted-foreground">
                trips
              </span>
              <span className="canvas-text-caption text-right text-muted-foreground">
                avg total
              </span>
              <span className="canvas-text-caption text-right text-muted-foreground">
                avg distance
              </span>
              <span className="canvas-text-caption text-right text-muted-foreground">
                avg tip
              </span>
            </div>
            <RoughRule seed={72} tone="section" />
            {airport.map((airportRide, index) => (
              <div className="canvas-stack-xs" key={airportRide.airport}>
                <div className="grid grid-cols-[minmax(180px,1.2fr)_repeat(4,minmax(90px,1fr))] items-center gap-3 px-3 py-3">
                  <span>
                    <Badge variant="outline">{airportRide.airport}</Badge>
                  </span>
                  <span className="text-right font-mono text-lg font-semibold tracking-normal">
                    {formatCompact(airportRide.trips)}
                  </span>
                  <span className="text-right font-mono">
                    {formatCurrency(airportRide.averageTotal)}
                  </span>
                  <span className="text-right font-mono">
                    {airportRide.averageDistance} mi
                  </span>
                  <span className="text-right font-mono">
                    {formatCurrency(airportRide.averageTip)}
                  </span>
                </div>
                {index < airport.length - 1 ? (
                  <RoughRule
                    seed={airportRuleSeeds[index % airportRuleSeeds.length]}
                    tone="table"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
