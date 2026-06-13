import { useMemo } from "react"

import {
  NetworkChart,
  type NetworkChartData,
  type NetworkLinkDatum,
  type NetworkNodeDatum,
} from "../../components/chart/network-chart"
import {
  SankeyChart,
  type SankeyData,
} from "../../components/chart/sankey-chart"
import type { ChartConfig } from "../../components/chart/runtime"
import { od } from "./data/borough-flow"
import { pickupBoroughs } from "./data/pickup-geography"
import {
  roughSketchMarkOptions,
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
const airportFlowKey = "flow:airport"
const networkConfig = Object.fromEntries(
  [
    ...boroughs.map((borough) => [
      `borough:${borough}`,
      { label: borough === "EWR" ? "EWR airport" : borough },
    ]),
    [airportFlowKey, { label: "Airport link" }],
  ]
) satisfies ChartConfig
const sankeyConfig = {
  ...networkConfig,
  [airportFlowKey]: { label: "Airport flow" },
} satisfies ChartConfig
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

type TaxiForceNode = NetworkNodeDatum & {
  category: "Borough" | "Airport"
  radius: number
  label: string
  trips: number
}

type TaxiNetworkLink = NetworkLinkDatum & {
  averageDistance: number
  averageTotal: number
  sourceName: string
  targetName: string
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

function getBoroughColorKey(name: string) {
  const borough = boroughs.find((item) => name.includes(item))

  return `borough:${borough ?? boroughs[0]}`
}

function getFlowColorKey(sourceName: string, targetName: string) {
  if (sourceName === "EWR" || targetName === "EWR") {
    return airportFlowKey
  }

  return getBoroughColorKey(sourceName)
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
        config={sankeyConfig}
        data={sankeyData}
        getLinkColorKey={(link) => {
          const flow = link as OdSankeyLink
          return getFlowColorKey(flow.sourceName, flow.targetName)
        }}
        getNodeColorKey={(node) => getBoroughColorKey(node.name)}
        legend
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
            <div className="grid gap-1">
              <strong>{flow.sourceName} {"->"} {flow.targetName}</strong>
              <span>{formatCompact(flow.value)} trips</span>
              <span>{flow.averageDistance} mi average distance</span>
              <span>${flow.averageTotal} average total</span>
            </div>
          )
        }}
        renderNodeTooltip={({ node }) => (
          <div className="grid gap-1">
            <strong>{node.name}</strong>
            <span>{formatCompact(node.value ?? 0)} trips</span>
          </div>
        )}
        renderer="rough"
        rough={roughSketchSankeyOptions}
        strokeOpacity={0.64}
      />
      <p className="canvas-text-caption text-muted-foreground">
        line width = trip volume
      </p>
    </div>
  )
}

function TaxiNetworkChart({
  data,
}: {
  data: NetworkChartData<TaxiForceNode, TaxiNetworkLink>
}) {
  return (
    <div className="canvas-stack-sm">
      <NetworkChart
        config={networkConfig}
        data={data}
        getLinkColorKey={(link) =>
          link.source.category === "Airport" || link.target.category === "Airport"
            ? airportFlowKey
            : getFlowColorKey(link.source.id, link.target.id)
        }
        getNodeColorKey={(node) => getBoroughColorKey(node.id)}
        legend
        layout={{
          aspectRatio: "5 / 3.2",
          linkWidthRange: [2, 10],
          margin: { top: 58, right: 72, bottom: 58, left: 72 },
          radiusRange: [18, 38],
        }}
        minHeight={400}
        renderLinkTooltip={({ link }) => (
          <div className="grid gap-1">
            <strong>{link.datum.sourceName} {"->"} {link.datum.targetName}</strong>
            <span>{formatCompact(link.datum.trips)} trips</span>
            <span>{link.datum.averageDistance} mi average distance</span>
            <span>${link.datum.averageTotal} average total</span>
          </div>
        )}
        renderNodeTooltip={({ node }) => (
          <div className="grid gap-1">
            <strong>{node.label}</strong>
            <span>{formatCompact(node.trips)} pickup trips</span>
          </div>
        )}
        renderer="rough"
        rough={roughSketchMarkOptions}
      />
      <p className="canvas-text-caption text-muted-foreground">
        node size = pickup trips
      </p>
    </div>
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
        id: borough,
        label: borough,
        radius: forceRadiusForTrips(trips, maxForceTrips),
        trips,
      }
    })
    const nodeIds = new Set(nodes.map((node) => node.id))
    const links = od
      .filter((item) => item.from !== item.to)
      .filter((item) => nodeIds.has(item.from) && nodeIds.has(item.to))
      .sort((a, b) => b.trips - a.trips)
      .slice(0, 12)
      .map((item) => ({
        averageDistance: item.averageDistance,
        averageTotal: item.averageTotal,
        source: item.from,
        sourceName: item.from,
        target: item.to,
        targetName: item.to,
        trips: item.trips,
        value: item.trips,
      }))

    return {
      links,
      nodes,
    } satisfies NetworkChartData<TaxiForceNode, TaxiNetworkLink>
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
        NetworkChart keeps the strongest OD links; the matrix below keeps
        directionality and exact cross-checks.
      </SectionIntro>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.64fr)_minmax(300px,0.36fr)]">
        <SketchPanel>
          <TaxiNetworkChart data={{ links: networkLinks, nodes: networkNodes }} />
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
              The network sketch shows relationships; the Sankey view ranks the <span className="text-foreground">strongest directed flows</span>.
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
