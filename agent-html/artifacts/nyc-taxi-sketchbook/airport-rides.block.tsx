import { useCallback } from "react"

import { Badge } from "../../components/ui/badge"

import { taxiData } from "./data"
import {
  RoughSvgLayer,
  roughSketchMarkOptions,
  type RoughSketchDraw,
} from "./roughjs-sketch"
import {
  SectionIntro,
  SketchNote,
  SketchPanel,
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
      <SectionIntro badge="05 / airport rides" title="机场把平均值往外拽。">
        JFK、LaGuardia 和 Newark 的行程在数量上不是最大项，但它们距离更长、总额更高，也更容易解释凌晨高客单价。
      </SectionIntro>

      <div className="grid gap-5 md:grid-cols-3">
        {taxiData.airport.map((airport) => (
          <SketchPanel key={airport.airport}>
            <div className="canvas-stack-md">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="outline">{airport.airport}</Badge>
                  <p className="mt-3 font-mono text-3xl font-semibold tracking-normal">
                    {formatCompact(airport.trips)}
                  </p>
                </div>
                <AirportRouteSketch />
              </div>
              <div className="grid gap-3">
                <div className="flex justify-between gap-3">
                  <span className="canvas-text-caption text-muted-foreground">
                    avg total
                  </span>
                  <strong className="font-mono">
                    {formatCurrency(airport.averageTotal)}
                  </strong>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="canvas-text-caption text-muted-foreground">
                    avg distance
                  </span>
                  <strong className="font-mono">{airport.averageDistance} mi</strong>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="canvas-text-caption text-muted-foreground">
                    avg tip
                  </span>
                  <strong className="font-mono">
                    {formatCurrency(airport.averageTip)}
                  </strong>
                </div>
              </div>
            </div>
          </SketchPanel>
        ))}
      </div>

      <SketchNote>
        Newark 出现在 TLC zone lookup 里，但它不是 NYC borough。这里保留 EWR，是为了让机场流向和费用结构完整。
      </SketchNote>
    </section>
  )
}
