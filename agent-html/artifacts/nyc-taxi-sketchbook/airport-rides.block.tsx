import { useCallback } from "react"

import { Badge } from "../../components/ui/badge"

import { taxiData } from "./data"
import { roughSketchMarkOptions } from "./rough-theme"
import { RoughSvgLayer, type RoughSketchDraw } from "./roughjs-sketch"
import {
  LedgerRows,
  SectionIntro,
  SketchNote,
  formatCompact,
  formatCurrency,
} from "./sketch-components"

function AirportRouteSketch() {
  const drawAirportRoute = useCallback<RoughSketchDraw>((roughSvg, group) => {
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
      className="h-14 w-20 text-muted-foreground"
      viewBox="0 0 96 64"
    >
      <RoughSvgLayer draw={drawAirportRoute} />
    </svg>
  )
}

export function AirportRidesBlock() {
  return (
    <section className="canvas-stack-lg">
      <SectionIntro badge="05 / airport rides" title="机场行程抬高距离和总额">
        JFK、LaGuardia 和 Newark 的行程不是最大数量项，但距离更长、总额更高，也解释了凌晨高客单价的一部分。
      </SectionIntro>

      <div className="grid gap-5 md:grid-cols-3">
        {taxiData.airport.map((airport) => (
          <div
            className="canvas-stack-md py-2"
            key={airport.airport}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge variant="outline">{airport.airport}</Badge>
                <p className="mt-3 font-mono text-3xl font-semibold tracking-normal">
                  {formatCompact(airport.trips)}
                </p>
              </div>
              <AirportRouteSketch />
            </div>
            <LedgerRows
              items={[
                {
                  label: "avg total",
                  value: formatCurrency(airport.averageTotal),
                },
                {
                  label: "avg distance",
                  value: `${airport.averageDistance} mi`,
                },
                {
                  label: "avg tip",
                  value: formatCurrency(airport.averageTip),
                },
              ]}
            />
          </div>
        ))}
      </div>

      <SketchNote>
        Newark 出现在 TLC zone lookup 里，但它不是 NYC borough。这里保留 EWR，是为了让机场流向和费用结构完整。
      </SketchNote>
    </section>
  )
}
