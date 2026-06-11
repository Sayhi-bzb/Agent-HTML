import { useEffect, useId, useMemo } from "react"
import * as roughViz from "rough-viz"

import { taxiData } from "./data"
import { roughSketchChartStyle } from "./rough-viz-charts"
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

type TaxiNetworkLink = {
  source: number
  target: number
  trips: number
}

function forceRadiusForTrips(trips: number, maxForceTrips: number) {
  return 3 + Math.sqrt(trips / maxForceTrips) * 7
}

function RoughNetworkChart({
  data,
  links,
}: {
  data: TaxiForceNode[]
  links: TaxiNetworkLink[]
}) {
  const reactId = useId()
  const elementId = `rough-network-${reactId.replace(/:/g, "")}`

  useEffect(() => {
    const element = document.getElementById(elementId)
    if (!element) return

    element.replaceChildren()

    const chart = new roughViz.Network<TaxiForceNode, TaxiNetworkLink>({
      ...roughSketchChartStyle,
      collision: 2.8,
      colorCallback: (datum) =>
        datum.category === "Airport" ? "var(--chart-2)" : "var(--chart-1)",
      data: data.map((datum) => ({ ...datum })),
      element: `#${elementId}`,
      legend: [
        { color: "var(--chart-1)", text: "Borough pickup volume" },
        { color: "var(--chart-2)", text: "Airport boundary" },
      ],
      links: links.map((link) => ({ ...link })),
      margin: { top: 92, right: 92, bottom: 76, left: 92 },
      radius: "forceRadius",
      radiusExtent: [20, 44],
      textCallback: (datum) => `${datum.label}: ${formatCompact(datum.trips)}`,
      title: "roughViz.Network / TLC OD pull",
    })

    return () => {
      chart.remove()
      element.replaceChildren()
    }
  }, [data, elementId, links])

  return (
    <div
      className="min-h-[560px] w-full [&_svg]:min-h-[560px] [&_svg]:w-full"
      id={elementId}
    />
  )
}

export function FlowMatrixBlock() {
  const { links: networkLinks, nodes: networkNodes } = useMemo(() => {
    const tripsByBorough = new Map<string, number>(
      taxiData.pickupBoroughs.map((item) => [item.borough, item.trips])
    )
    const forceSourceTrips = boroughs.map(
      (borough) => tripsByBorough.get(borough) ?? 0
    )
    const maxForceTrips = Math.max(...forceSourceTrips)

    const nodes = boroughs.map((borough) => {
      const trips = tripsByBorough.get(borough) ?? 0

      return {
        category: borough === "EWR" ? ("Airport" as const) : ("Borough" as const),
        forceRadius: forceRadiusForTrips(trips, maxForceTrips),
        label: borough,
        trips,
      }
    })
    const nodeIndexByLabel = new Map<string, number>(
      nodes.map((node, index) => [node.label, index])
    )
    const links = taxiData.od
      .filter((item) => item.from !== item.to)
      .filter(
        (item) =>
          nodeIndexByLabel.has(item.from) && nodeIndexByLabel.has(item.to)
      )
      .sort((a, b) => b.trips - a.trips)
      .slice(0, 12)
      .map((item) => ({
        source: nodeIndexByLabel.get(item.from) ?? 0,
        target: nodeIndexByLabel.get(item.to) ?? 0,
        trips: item.trips,
      }))

    return { links, nodes }
  }, [])

  const strongest = matrixRows
    .flat()
    .filter((item) => item.from !== item.to)
    .sort((a, b) => b.trips - a.trips)[0]

  return (
    <section className="canvas-stack-lg">
      <SectionIntro badge="03 / origin to destination" title="最粗的流向，仍然很短。">
        这里用 roughViz.Network：节点是主要 borough 和 EWR，泡泡越大，说明这个区域相关的 taxi volume 越强。
      </SectionIntro>

      <div className="grid gap-5 lg:grid-cols-3">
        <SketchPanel className="lg:col-span-2">
          <RoughNetworkChart data={networkNodes} links={networkLinks} />
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
            roughViz.Network 只保留最强的 OD links 作为粗略拉力；下方矩阵继续保留方向关系和精确对照。
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
