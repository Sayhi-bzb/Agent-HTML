import { useCallback } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"

import { taxiData } from "./data"
import { roughSketchMarkOptions } from "./rough-theme"
import { RoughSvgLayer, type RoughSketchDraw } from "./roughjs-sketch"
import {
  SectionIntro,
  SketchAnnotation,
  SketchNote,
  SketchPanel,
  dayLabels,
  formatCurrency,
} from "./sketch-components"

const hours = Array.from({ length: 24 }, (_, hour) => hour)
const maxTrips = Math.max(...taxiData.hourDay.map((item) => item.trips))
const cellSize = 24
const gap = 4
const leftPad = 46
const topPad = 28

function cellOpacity(trips: number) {
  return 0.14 + (trips / maxTrips) * 0.76
}

const heatmapCells = dayLabels.flatMap((_, dayIndex) =>
  hours.map((hour) => {
    const item = taxiData.hourDay.find(
      (candidate) => candidate.day === dayIndex && candidate.hour === hour
    )

    return {
      averageDistance: item?.averageDistance ?? 0,
      averageTotal: item?.averageTotal ?? 0,
      dayLabel: dayLabels[dayIndex],
      hour,
      opacity: item ? cellOpacity(item.trips) : 0.08,
      seed: dayIndex * 24 + hour + 1,
      trips: item?.trips ?? 0,
      x: leftPad + hour * (cellSize + gap),
      y: topPad + dayIndex * (cellSize + gap),
    }
  })
)

function formatHour(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`
}

export function CityRhythmBlock() {
  const peak = [...taxiData.hourDay].sort((a, b) => b.trips - a.trips)[0]
  const drawHourGrid = useCallback<RoughSketchDraw>((roughSvg, group) => {
    heatmapCells.forEach((cell) => {
      const node = roughSvg.rectangle(cell.x, cell.y, cellSize, cellSize, {
        ...roughSketchMarkOptions,
        fill: "currentColor",
        hachureGap: 4,
        seed: cell.seed,
        strokeWidth: 0.7,
      })

      node.setAttribute("opacity", cell.opacity.toFixed(2))
      group.appendChild(node)
    })
  }, [])

  return (
    <section className="canvas-stack-lg">
      <SectionIntro badge="01 / hour grid" title="Pickup density by weekday and hour">
        Columns run across the 24 hours of a day; rows run down the week. The
        darker cells only encode pickup volume, making commute, dinner, and
        late-night shift changes easier to spot.
      </SectionIntro>

      <div className="canvas-stack-md">
        <SketchPanel>
          <div className="overflow-x-auto">
            <TooltipProvider>
              <svg
                aria-label="Taxi pickup trips by weekday and hour"
                className="min-w-full text-foreground"
                role="img"
                viewBox={`0 0 ${leftPad + hours.length * (cellSize + gap)} ${
                  topPad + dayLabels.length * (cellSize + gap)
                }`}
              >
                <RoughSvgLayer draw={drawHourGrid} />
                {hours.map((hour) => (
                  <text
                    className="fill-muted-foreground text-xs"
                    key={hour}
                    textAnchor="middle"
                    x={leftPad + hour * (cellSize + gap) + cellSize / 2}
                    y="14"
                  >
                    {hour % 3 === 0 ? hour : ""}
                  </text>
                ))}
                {dayLabels.map((day, dayIndex) => (
                  <text
                    className="fill-muted-foreground text-xs"
                    key={day}
                    x="0"
                    y={topPad + dayIndex * (cellSize + gap) + 16}
                  >
                    {day}
                  </text>
                ))}
                {heatmapCells.map((cell) => (
                  <Tooltip key={`${cell.dayLabel}-${cell.hour}`}>
                    <TooltipTrigger asChild>
                      <rect
                        aria-label={`${cell.dayLabel} ${formatHour(
                          cell.hour
                        )}: ${cell.trips.toLocaleString()} trips, ${formatCurrency(
                          cell.averageTotal
                        )} average total, ${cell.averageDistance} mi average distance`}
                        className="fill-transparent outline-none focus-visible:stroke-foreground focus-visible:stroke-2"
                        height={cellSize}
                        pointerEvents="all"
                        tabIndex={0}
                        width={cellSize}
                        x={cell.x}
                        y={cell.y}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="items-start" sideOffset={6}>
                      <div className="canvas-stack-xs">
                        <strong className="font-mono">
                          {cell.dayLabel} {formatHour(cell.hour)}
                        </strong>
                        <span>trips {cell.trips.toLocaleString()}</span>
                        <span>avg total {formatCurrency(cell.averageTotal)}</span>
                        <span>avg distance {cell.averageDistance} mi</span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </svg>
            </TooltipProvider>
          </div>
        </SketchPanel>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.34fr)]">
          <SketchAnnotation label="peak cell">
            <p className="font-mono text-2xl font-semibold tracking-normal">
              {dayLabels[peak.day]} {peak.hour}:00
            </p>
            <p className="canvas-text-caption text-muted-foreground">
              {peak.trips.toLocaleString()} pickups, with an average total of{" "}
              {formatCurrency(peak.averageTotal)}.
            </p>
          </SketchAnnotation>
          <SketchNote>
            The darkest cells cluster from weekday afternoons into evening.
            Overnight volume thins out, but average totals rise, pointing to
            airport and longer-distance trips beyond short city commutes.
          </SketchNote>
        </div>
      </div>
    </section>
  )
}
