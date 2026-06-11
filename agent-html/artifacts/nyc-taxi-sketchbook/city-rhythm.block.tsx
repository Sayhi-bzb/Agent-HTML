import { useCallback } from "react"

import { Badge } from "../../components/ui/badge"

import { taxiData } from "./data"
import {
  RoughSvgLayer,
  roughSketchMarkOptions,
  type RoughSketchDraw,
} from "./roughjs-sketch"
import { SectionIntro, SketchNote, SketchPanel, dayLabels } from "./sketch-components"

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
      opacity: item ? cellOpacity(item.trips) : 0.08,
      seed: dayIndex * 24 + hour + 1,
      x: leftPad + hour * (cellSize + gap),
      y: topPad + dayIndex * (cellSize + gap),
    }
  })
)

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
      <SectionIntro badge="01 / hour grid" title="城市不是平均醒来的。">
        横向是一天 24 小时，纵向是星期。最深的格子不是“热闹”装饰，而是 pickup
        发生的位置：纽约的出租车需求在通勤、晚餐和夜间活动之间换挡。
      </SectionIntro>

      <div className="grid gap-5 lg:grid-cols-3">
        <SketchPanel className="lg:col-span-2">
          <div className="overflow-x-auto">
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
            </svg>
          </div>
        </SketchPanel>

        <div className="canvas-stack-md">
          <SketchPanel>
            <div className="canvas-stack-xs">
              <Badge variant="outline">peak cell</Badge>
              <p className="font-mono text-3xl font-semibold tracking-normal">
                {dayLabels[peak.day]} {peak.hour}:00
              </p>
              <p className="canvas-text-body">
                {peak.trips.toLocaleString()} 次 pickup，平均总额 $
                {peak.averageTotal}。
              </p>
            </div>
          </SketchPanel>
          <SketchNote>
            深色集中在工作日下午到夜间。凌晨格子变浅，但平均金额会上升，说明短途通勤之外还有机场和长距离行程。
          </SketchNote>
        </div>
      </div>
    </section>
  )
}
