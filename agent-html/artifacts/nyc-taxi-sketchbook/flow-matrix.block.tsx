import { useEffect, useId, useMemo } from "react"
import { Force } from "rough-viz"

import { taxiData } from "./data"
import {
  SectionIntro,
  SketchNote,
  SketchPanel,
  formatCompact,
} from "./sketch-components"

const boroughs = ["Manhattan", "Queens", "Brooklyn", "Bronx", "EWR"]
const matrixRows = boroughs.map((from) =>
  boroughs.map((to) => {
    return (
      taxiData.od.find((item) => item.from === from && item.to === to) ?? {
        averageDistance: 0,
        averageTotal: 0,
        from,
        to,
        trips: 0,
      }
    )
  })
)
const maxTrips = Math.max(...matrixRows.flat().map((item) => item.trips))
function opacityClass(trips: number) {
  if (!trips) return "opacity-10"
  const ratio = trips / maxTrips
  if (ratio > 0.8) return "opacity-90"
  if (ratio > 0.6) return "opacity-75"
  if (ratio > 0.4) return "opacity-60"
  if (ratio > 0.2) return "opacity-45"
  return "opacity-25"
}

type TaxiForceNode = {
  category: "Borough" | "Airport"
  forceRadius: number
  label: string
  trips: number
}

function forceRadiusForTrips(trips: number, maxForceTrips: number) {
  return 3 + Math.sqrt(trips / maxForceTrips) * 7
}

function RoughForceChart({ data }: { data: TaxiForceNode[] }) {
  const reactId = useId()
  const elementId = `rough-force-${reactId.replace(/:/g, "")}`

  useEffect(() => {
    const element = document.getElementById(elementId)
    if (!element) return

    element.replaceChildren()

    const chart = new Force<TaxiForceNode>({
      axisRoughness: 1,
      axisStrokeWidth: 1,
      collision: 1.8,
      colorCallback: (datum) =>
        datum.category === "Airport" ? "var(--chart-2)" : "var(--chart-1)",
      data: data.map((datum) => ({ ...datum })),
      element: `#${elementId}`,
      fillStyle: "hachure",
      fillWeight: 1,
      innerStrokeWidth: 1,
      legend: [
        { color: "var(--chart-1)", text: "Borough pickup volume" },
        { color: "var(--chart-2)", text: "Airport trips" },
      ],
      margin: { top: 72, right: 48, bottom: 48, left: 48 },
      radius: "forceRadius",
      radiusExtent: [18, 52],
      roughness: 2.5,
      stroke: "black",
      strokeWidth: 0,
      textCallback: (datum) => `${datum.label}: ${formatCompact(datum.trips)}`,
      title: "roughViz.Force / TLC trip volume",
    })

    return () => {
      chart.remove()
      element.replaceChildren()
    }
  }, [data, elementId])

  return (
    <div
      className="min-h-[560px] w-full [&_svg]:min-h-[560px] [&_svg]:w-full"
      id={elementId}
    />
  )
}

export function FlowMatrixBlock() {
  const forceData = useMemo<TaxiForceNode[]>(() => {
    const forceSourceTrips = [
      ...taxiData.pickupBoroughs
        .filter((item) =>
          ["Manhattan", "Queens", "Brooklyn"].includes(
            item.borough
          )
        )
        .map((item) => item.trips),
      ...taxiData.airport.map((item) => item.trips),
    ]
    const maxForceTrips = Math.max(...forceSourceTrips)

    const boroughNodes = taxiData.pickupBoroughs
      .filter((item) =>
        ["Manhattan", "Queens", "Brooklyn"].includes(
          item.borough
        )
      )
      .map((item) => ({
        category: "Borough" as const,
        forceRadius: forceRadiusForTrips(item.trips, maxForceTrips),
        label: item.borough,
        trips: item.trips,
      }))

    const airportNodes = taxiData.airport.map((item) => ({
      category: "Airport" as const,
      forceRadius: forceRadiusForTrips(item.trips, maxForceTrips),
      label: item.airport.replace(" Airport", ""),
      trips: item.trips,
    }))

    return [...boroughNodes, ...airportNodes]
  }, [])

  const strongest = matrixRows
    .flat()
    .filter((item) => item.from !== item.to)
    .sort((a, b) => b.trips - a.trips)[0]

  return (
    <section className="canvas-stack-lg">
      <SectionIntro badge="03 / origin to destination" title="最粗的流向，仍然很短。">
        这里用真实的 roughViz.Force：节点是主要 borough 和机场，泡泡越大，说明这个区域相关的 taxi volume 越强。
      </SectionIntro>

      <div className="grid gap-5 lg:grid-cols-3">
        <SketchPanel className="lg:col-span-2">
          <RoughForceChart data={forceData} />
        </SketchPanel>

        <div className="canvas-stack-md">
          <SketchPanel>
            <div className="canvas-stack-xs">
              <span className="canvas-text-caption text-muted-foreground">
                strongest cross-borough line
              </span>
              <strong className="font-mono text-2xl">
                {strongest.from} {"->"} {strongest.to}
              </strong>
              <p className="canvas-text-body">
                {formatCompact(strongest.trips)} 次，平均 {strongest.averageDistance}{" "}
                mi，平均总额 ${strongest.averageTotal}。
              </p>
            </div>
          </SketchPanel>
          <SketchNote>
            roughViz.Force 画的是 force bubble，不消费 OD links；下方矩阵继续保留方向关系和精确对照。
          </SketchNote>
        </div>
      </div>

      <SketchPanel>
        <div className="canvas-stack-md">
          <div className="canvas-stack-xs">
            <h3 className="canvas-text-subheading">OD matrix audit</h3>
            <p className="canvas-text-caption text-muted-foreground">
              force sketch 看关系，矩阵保留精确对照。对角线越深，说明行程更多在同一区域内部完成。
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-6 gap-2">
              <span />
              {boroughs.map((borough) => (
                <span className="canvas-text-caption text-muted-foreground" key={borough}>
                  {borough}
                </span>
              ))}
            </div>
            {matrixRows.map((row, index) => (
              <div className="grid grid-cols-6 gap-2" key={boroughs[index]}>
                <span className="canvas-text-caption text-muted-foreground">
                  {boroughs[index]}
                </span>
                {row.map((item) => (
                  <div
                    className={`min-h-20 rounded-sm border border-border bg-foreground p-2 text-background ${opacityClass(item.trips)}`}
                    key={`${item.from}-${item.to}`}
                  >
                    <p className="font-mono text-sm">{formatCompact(item.trips)}</p>
                    <p className="text-xs">{item.averageDistance} mi</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </SketchPanel>
    </section>
  )
}
