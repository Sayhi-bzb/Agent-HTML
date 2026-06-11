import { useEffect, useId, useMemo } from "react"
import * as roughViz from "rough-viz"

import {
  SankeyChart,
  type SankeyData,
} from "../../components/chart"
import { od } from "./data/generated-borough-flow"
import { pickupBoroughs } from "./data/generated-pickup-geography"
import {
  roughSketchChartStyle,
  roughSketchSankeyOptions,
} from "./rough-theme"
import {
  LedgerRows,
  SketchAnnotation,
  SectionIntro,
  SketchNote,
  SketchPanel,
  formatCompact,
} from "./sketch-components"

const boroughs = ["Manhattan", "Queens", "Brooklyn", "Bronx", "EWR"]
const matrixRows = boroughs.map((from) =>
  boroughs.map((to) => {
    return (
      od.find((item) => item.from === from && item.to === to) ?? {
        averageDistance: 0,
        averageTotal: 0,
        from,
        to,
        trips: 0,
      }
    )
  })
)

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

type OdSankeyLink = SankeyData["links"][number] & {
  averageDistance: number
  averageTotal: number
  sourceName: string
  targetName: string
}

function forceRadiusForTrips(trips: number, maxForceTrips: number) {
  return 3 + Math.sqrt(trips / maxForceTrips) * 7
}

function sankeyNodeColor(name: string) {
  if (name.includes("EWR")) {
    return "var(--chart-2)"
  }

  return "var(--chart-1)"
}

function OdSankeyChart() {
  const sankeyData = useMemo<SankeyData>(() => {
    const origins = boroughs.map((borough) => ({
      category: "source" as const,
      name: `${borough} pickup`,
    }))
    const destinations = boroughs.map((borough) => ({
      category: "outcome" as const,
      name: `${borough} dropoff`,
    }))
    const destinationOffset = origins.length

    const links = matrixRows
      .flat()
      .filter((item) => item.from !== item.to)
      .filter((item) => item.trips > 0)
      .sort((a, b) => b.trips - a.trips)
      .slice(0, 12)
      .map<OdSankeyLink>((item) => ({
        averageDistance: item.averageDistance,
        averageTotal: item.averageTotal,
        source: boroughs.indexOf(item.from),
        sourceName: item.from,
        target: destinationOffset + boroughs.indexOf(item.to),
        targetName: item.to,
        value: item.trips,
      }))

    return {
      nodes: [...origins, ...destinations],
      links,
    }
  }, [])

  return (
    <div className="canvas-stack-sm">
      <SankeyChart
        data={sankeyData}
        getLinkColor={(link) => {
          const flow = link as OdSankeyLink
          return flow.sourceName === "EWR" || flow.targetName === "EWR"
            ? "var(--chart-2)"
            : "var(--chart-1)"
        }}
        getNodeColor={(node) => sankeyNodeColor(node.name)}
        layout={{
          aspectRatio: "5 / 2.2",
          margin: { top: 24, right: 148, bottom: 24, left: 148 },
          nodePadding: 18,
          nodeRadius: 3,
          nodeWidth: 12,
        }}
        renderLinkTooltip={({ link }) => {
          const flow = link as OdSankeyLink

          return (
            <div className="grid gap-1 px-3 py-2.5 text-chart-tooltip-foreground">
              <strong className="font-mono text-[0.75rem] tracking-normal">
                {flow.sourceName} {"->"} {flow.targetName}
              </strong>
              <span>{formatCompact(flow.value)} trips</span>
              <span>{flow.averageDistance} mi average distance</span>
              <span>${flow.averageTotal} average total</span>
            </div>
          )
        }}
        renderNodeTooltip={({ node }) => (
          <div className="grid gap-1 px-3 py-2.5 text-chart-tooltip-foreground">
            <strong className="font-mono text-[0.75rem] tracking-normal">
              {node.name}
            </strong>
            <span>{formatCompact(node.value ?? 0)} trips</span>
          </div>
        )}
        roughOptions={roughSketchSankeyOptions}
        strokeOpacity={0.64}
      />
      <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
        <span className="canvas-text-caption inline-flex items-center gap-1.5">
          <span className="h-2 w-5 rounded-full bg-chart-1" />
          cross-area flow
        </span>
        <span className="canvas-text-caption inline-flex items-center gap-1.5">
          <span className="h-2 w-5 rounded-full bg-chart-2" />
          airport flow
        </span>
        <span className="canvas-text-caption">line width = trip volume</span>
      </div>
    </div>
  )
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
      margin: { top: 72, right: 72, bottom: 58, left: 72 },
      radius: "forceRadius",
      radiusExtent: [18, 38],
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
      className="min-h-[400px] w-full [&_svg]:min-h-[400px] [&_svg]:w-full"
      id={elementId}
    />
  )
}

export function BoroughFlowNetworkBlock() {
  const { links: networkLinks, nodes: networkNodes } = useMemo(() => {
    const tripsByBorough = new Map<string, number>(
      pickupBoroughs.map((item) => [item.borough, item.trips])
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
    const links = od
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
  const topFlows = matrixRows
    .flat()
    .filter((item) => item.from !== item.to)
    .sort((a, b) => b.trips - a.trips)
    .slice(0, 5)

  return (
    <section className="canvas-stack-lg">
      <SectionIntro badge="03 / origin to destination" title="Read the major flows as a network, then audit the matrix">
        roughViz.Network keeps the strongest OD links; the matrix below keeps
        directionality and exact cross-checks.
      </SectionIntro>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.64fr)_minmax(300px,0.36fr)]">
        <SketchPanel>
          <RoughNetworkChart data={networkNodes} links={networkLinks} />
        </SketchPanel>

        <div className="canvas-stack-md">
          <SketchAnnotation label="strongest cross-borough line">
            <strong className="font-mono text-2xl">
              {strongest.from} {"->"} {strongest.to}
            </strong>
            <p className="canvas-text-caption text-muted-foreground">
              {formatCompact(strongest.trips)} trips, averaging {strongest.averageDistance} mi and ${strongest.averageTotal} total.
            </p>
          </SketchAnnotation>
          <LedgerRows
            items={topFlows.map((flow) => ({
              label: `${flow.from} -> ${flow.to}`,
              note: `${flow.averageDistance} mi avg / $${flow.averageTotal} avg total`,
              value: formatCompact(flow.trips),
            }))}
          />
          <SketchNote>
            EWR stays visible here so the airport boundary's effect on fares
            and distances does not disappear inside borough rollups.
          </SketchNote>
        </div>
      </div>

      <SketchPanel>
        <div className="canvas-stack-md">
          <div className="canvas-stack-xs">
            <h3 className="canvas-text-heading">Directed OD flow</h3>
            <p className="canvas-text-caption text-muted-foreground">
              The force sketch shows relationships; the Sankey view ranks the <span className="text-foreground">strongest directed flows</span>.
              Wider lines mean more trips, with same-area trips separated by
              muted strokes and the <span className="text-chart-2">airport boundary</span> kept visible.
            </p>
          </div>
          <OdSankeyChart />
        </div>
      </SketchPanel>
    </section>
  )
}
