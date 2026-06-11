import { useEffect, useId, useMemo } from "react"
import * as roughViz from "rough-viz"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip"
import { taxiData } from "./data"
import { roughSketchChartStyle } from "./rough-theme"
import {
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

function heatmapCellBackground(trips: number) {
  if (!trips) {
    return "var(--muted)"
  }

  const intensity = Math.round(18 + Math.sqrt(trips / maxTrips) * 72)
  return `color-mix(in oklab, var(--chart-1) ${intensity}%, var(--background))`
}

function heatmapCellForeground(trips: number) {
  if (!trips) {
    return "var(--muted-foreground)"
  }

  return trips / maxTrips > 0.36 ? "var(--background)" : "var(--foreground)"
}

function OdHeatmapCell({
  item,
}: {
  item: (typeof matrixRows)[number][number]
}) {
  const isDiagonal = item.from === item.to

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          aria-label={`${item.from} to ${item.to}: ${formatCompact(item.trips)} trips`}
          className="group relative flex min-h-20 w-full flex-col justify-between rounded-sm border border-border/70 p-2 text-left transition-[border-color,box-shadow,translate] hover:-translate-y-0.5 hover:border-foreground/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          style={{
            backgroundColor: heatmapCellBackground(item.trips),
            color: heatmapCellForeground(item.trips),
          }}
          type="button"
        >
          {isDiagonal ? (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-80" />
          ) : null}
          <span className="font-mono text-sm font-semibold tracking-normal">
            {item.trips ? formatCompact(item.trips) : "0"}
          </span>
          <span className="text-xs opacity-85">{item.averageDistance} mi</span>
        </button>
      </TooltipTrigger>
      <TooltipContent className="items-start" sideOffset={6}>
        <div className="grid gap-1">
          <strong className="font-mono text-[0.75rem] tracking-normal">
            {item.from} {"->"} {item.to}
          </strong>
          <span>{formatCompact(item.trips)} trips</span>
          <span>{item.averageDistance} mi average distance</span>
          <span>${item.averageTotal} average total</span>
          {isDiagonal ? <span>same-area trips</span> : null}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

function OdHeatmap() {
  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <div
          aria-label="Directed origin-destination heatmap by borough"
          className="grid min-w-[680px] gap-2"
          role="img"
        >
          <div className="grid grid-cols-[6.5rem_repeat(5,minmax(5.75rem,1fr))] gap-2">
            <span />
            {boroughs.map((borough) => (
              <span
                className="canvas-text-caption text-muted-foreground"
                key={borough}
              >
                to {borough}
              </span>
            ))}
          </div>
          {matrixRows.map((row, index) => (
            <div
              className="grid grid-cols-[6.5rem_repeat(5,minmax(5.75rem,1fr))] gap-2"
              key={boroughs[index]}
            >
              <span className="canvas-text-caption flex min-h-20 items-center text-muted-foreground">
                from {boroughs[index]}
              </span>
              {row.map((item) => (
                <OdHeatmapCell item={item} key={`${item.from}-${item.to}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
        <span className="canvas-text-caption">low trips</span>
        <span
          aria-hidden="true"
          className="h-2 w-28 rounded-full border border-border"
          style={{
            background:
              "linear-gradient(90deg, color-mix(in oklab, var(--chart-1) 18%, var(--background)), color-mix(in oklab, var(--chart-1) 90%, var(--background)))",
          }}
        />
        <span className="canvas-text-caption">high trips</span>
        <span className="canvas-text-caption inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
          same-area trips
        </span>
      </div>
    </TooltipProvider>
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
      <SectionIntro badge="03 / origin to destination" title="Read the major flows as a network, then audit the matrix">
        roughViz.Network keeps the strongest OD links; the matrix below keeps
        directionality and exact cross-checks.
      </SectionIntro>

      <div className="grid gap-5 lg:grid-cols-3">
        <SketchPanel className="lg:col-span-2">
          <RoughNetworkChart data={networkNodes} links={networkLinks} />
        </SketchPanel>

        <div className="canvas-stack-md">
          <SketchAnnotation label="strongest cross-borough line">
            <strong className="font-mono text-2xl">
              {strongest.from} {"->"} {strongest.to}
            </strong>
            <p className="canvas-text-caption text-muted-foreground">
              {formatCompact(strongest.trips)} trips, averaging{" "}
              {strongest.averageDistance} mi and ${strongest.averageTotal} total.
            </p>
          </SketchAnnotation>
          <SketchNote>
            EWR stays visible here so the airport boundary's effect on fares
            and distances does not disappear inside borough rollups.
          </SketchNote>
        </div>
      </div>

      <SketchPanel>
        <div className="canvas-stack-md">
          <div className="canvas-stack-xs">
            <h3 className="canvas-text-subheading">Directed OD heatmap</h3>
            <p className="canvas-text-caption text-muted-foreground">
              The force sketch shows relationships; the heatmap keeps exact
              direction and comparable trip density. The dot marks same-area
              trips on the diagonal.
            </p>
          </div>
          <OdHeatmap />
        </div>
      </SketchPanel>
    </section>
  )
}
