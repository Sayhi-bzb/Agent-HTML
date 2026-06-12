import { Graph } from "@visx/network"
import * as React from "react"
import type { ReactNode } from "react"
import type { Options as RoughOptions } from "roughjs/bin/core"

import {
  type ChartConfig,
  type ChartHoverState,
  ChartContainer,
  ChartHitCircle,
  ChartHitLine,
  ChartInteractionRoot,
  ChartMotionGroup,
  ChartSvg,
  ChartTooltip,
  ChartTooltipPanel,
  type ChartRenderer,
  chartMotion,
  getChartMarkKey,
  getChartMarkOpacity,
  getChartMarkPresence,
  isFiniteNumber,
  useChartMarkTooltip,
} from "../ui/chart"
import { RoughCircle, RoughPath } from "@/lib/rough-svg"

type NetworkHoverState = ChartHoverState<"node" | "link">

export interface NetworkNodeDatum {
  category?: string
  id: string
  label?: ReactNode
  radius?: number
  value?: number
  x?: number
  y?: number
  [key: string]: unknown
}

export interface NetworkLinkDatum {
  source: string
  target: string
  value?: number
  [key: string]: unknown
}

export interface NetworkChartData<
  TNode extends NetworkNodeDatum = NetworkNodeDatum,
  TLink extends NetworkLinkDatum = NetworkLinkDatum,
> {
  links: readonly TLink[]
  nodes: readonly TNode[]
}

interface NetworkChartLayout {
  aspectRatio?: string
  linkWidthRange?: [number, number]
  margin?: Partial<NetworkMargin>
  radiusRange?: [number, number]
}

interface NetworkMargin {
  bottom: number
  left: number
  right: number
  top: number
}

interface TooltipState {
  index: number
  type: "node" | "link"
}

type PositionedNode<TNode extends NetworkNodeDatum> = TNode & {
  radius: number
  x: number
  y: number
}

type PositionedLink<
  TNode extends NetworkNodeDatum,
  TLink extends NetworkLinkDatum,
> = {
  datum: TLink
  key: string
  source: PositionedNode<TNode>
  target: PositionedNode<TNode>
  width: number
}

interface NetworkGraph<
  TNode extends NetworkNodeDatum,
  TLink extends NetworkLinkDatum,
> {
  links: Array<PositionedLink<TNode, TLink>>
  nodes: Array<PositionedNode<TNode>>
}

export interface NetworkChartProps<
  TNode extends NetworkNodeDatum = NetworkNodeDatum,
  TLink extends NetworkLinkDatum = NetworkLinkDatum,
> {
  className?: string
  config: ChartConfig
  data: NetworkChartData<TNode, TLink>
  getLinkColor?: (link: PositionedLink<TNode, TLink>, index: number) => string
  getNodeColor?: (node: PositionedNode<TNode>, index: number) => string
  layout?: NetworkChartLayout
  minHeight?: number
  renderLinkTooltip?: (props: {
    index: number
    link: PositionedLink<TNode, TLink>
  }) => ReactNode
  renderNodeTooltip?: (props: {
    index: number
    node: PositionedNode<TNode>
  }) => ReactNode
  renderer?: ChartRenderer
  roughOptions?: RoughOptions
}

const DEFAULT_MARGIN: NetworkMargin = {
  bottom: 42,
  left: 48,
  right: 48,
  top: 42,
}

const DEFAULT_RADIUS_RANGE: [number, number] = [12, 30]
const DEFAULT_LINK_WIDTH_RANGE: [number, number] = [1.4, 8]

function resolveRangeValue({
  range,
  value,
  values,
}: {
  range: [number, number]
  value: number
  values: number[]
}) {
  const finiteValues = values.filter(isFiniteNumber)

  if (finiteValues.length === 0) {
    return range[0]
  }

  const min = Math.min(...finiteValues)
  const max = Math.max(...finiteValues)

  if (min === max) {
    return (range[0] + range[1]) / 2
  }

  return range[0] + ((value - min) / (max - min)) * (range[1] - range[0])
}

function resolveNetworkGraph<
  TNode extends NetworkNodeDatum,
  TLink extends NetworkLinkDatum,
>({
  data,
  height,
  layout,
  width,
}: {
  data: NetworkChartData<TNode, TLink>
  height: number
  layout?: NetworkChartLayout
  width: number
}): NetworkGraph<TNode, TLink> {
  const margin = { ...DEFAULT_MARGIN, ...layout?.margin }
  const innerWidth = Math.max(0, width - margin.left - margin.right)
  const innerHeight = Math.max(0, height - margin.top - margin.bottom)
  const nodeValues = data.nodes.map((node) => node.radius ?? node.value ?? 1)
  const linkValues = data.links.map((link) => link.value ?? 1)
  const radiusRange = layout?.radiusRange ?? DEFAULT_RADIUS_RANGE
  const linkWidthRange = layout?.linkWidthRange ?? DEFAULT_LINK_WIDTH_RANGE
  const maxRadius = radiusRange[1]
  const centerX = margin.left + innerWidth / 2
  const centerY = margin.top + innerHeight / 2
  const orbitX = Math.max(0, innerWidth / 2 - maxRadius)
  const orbitY = Math.max(0, innerHeight / 2 - maxRadius)

  const nodes = data.nodes.map((node, index) => {
    const value = node.radius ?? node.value ?? 1
    const radius = resolveRangeValue({
      range: radiusRange,
      value,
      values: nodeValues,
    })
    const angle =
      data.nodes.length > 1
        ? -Math.PI / 2 + (index / data.nodes.length) * Math.PI * 2
        : 0
    const x = isFiniteNumber(node.x)
      ? margin.left + node.x * innerWidth
      : centerX + Math.cos(angle) * orbitX
    const y = isFiniteNumber(node.y)
      ? margin.top + node.y * innerHeight
      : centerY + Math.sin(angle) * orbitY

    return {
      ...node,
      radius,
      x,
      y,
    }
  })
  const nodeById = new Map(nodes.map((node) => [node.id, node]))
  const links = data.links.flatMap((link, index) => {
    const source = nodeById.get(link.source)
    const target = nodeById.get(link.target)

    if (!source || !target) {
      return []
    }

    const value = link.value ?? 1
    const width = resolveRangeValue({
      range: linkWidthRange,
      value,
      values: linkValues,
    })

    return {
      datum: link,
      key: getChartMarkKey("link", link.source, link.target, index),
      source,
      target,
      width,
    }
  })

  return { links, nodes }
}

function isNodeRelatedToLink<
  TNode extends NetworkNodeDatum,
  TLink extends NetworkLinkDatum,
>(node: PositionedNode<TNode>, link: PositionedLink<TNode, TLink>) {
  return node.id === link.source.id || node.id === link.target.id
}

function getDefaultNodeColor(node: NetworkNodeDatum) {
  return node.category === "Airport" ? "var(--chart-2)" : "var(--chart-1)"
}

function getDefaultLinkColor(link: PositionedLink<NetworkNodeDatum, NetworkLinkDatum>) {
  return link.source.category === "Airport" || link.target.category === "Airport"
    ? "var(--chart-2)"
    : "var(--chart-1)"
}

function getNetworkLinkPath<
  TNode extends NetworkNodeDatum,
  TLink extends NetworkLinkDatum,
>(link: PositionedLink<TNode, TLink>) {
  return `M${link.source.x},${link.source.y} L${link.target.x},${link.target.y}`
}

function getNetworkTooltipModel<
  TNode extends NetworkNodeDatum,
  TLink extends NetworkLinkDatum,
>({
  graph,
  tooltipData,
}: {
  graph: NetworkGraph<TNode, TLink>
  tooltipData?: TooltipState
}) {
  return {
    activeLink:
      tooltipData?.type === "link" ? graph.links[tooltipData.index] : null,
    activeNode:
      tooltipData?.type === "node" ? graph.nodes[tooltipData.index] : null,
  }
}

interface NetworkRenderContextValue<
  TNode extends NetworkNodeDatum,
  TLink extends NetworkLinkDatum,
> {
  activeLink: PositionedLink<TNode, TLink> | null
  getLinkColor?: (link: PositionedLink<TNode, TLink>, index: number) => string
  getNodeColor?: (node: PositionedNode<TNode>, index: number) => string
  graph: NetworkGraph<TNode, TLink>
  hideTooltip: () => void
  hover: NetworkHoverState | null
  linkRoughOptionsByKey?: Map<string, RoughOptions>
  nodeRoughOptionsById?: Map<string, RoughOptions>
  renderer: ChartRenderer
  setHover: React.Dispatch<React.SetStateAction<NetworkHoverState | null>>
  showTooltip: (
    event: React.MouseEvent<Element> | React.PointerEvent<Element>,
    data: TooltipState
  ) => void
}

const NetworkRenderContext =
  React.createContext<NetworkRenderContextValue<any, any> | null>(null)

function useNetworkRenderContext<
  TNode extends NetworkNodeDatum,
  TLink extends NetworkLinkDatum,
>() {
  const context = React.useContext(NetworkRenderContext) as
    | NetworkRenderContextValue<TNode, TLink>
    | null

  if (!context) {
    throw new Error("Network marks must be rendered inside NetworkChartSurface")
  }

  return context
}

function NetworkLinkMark<
  TNode extends NetworkNodeDatum,
  TLink extends NetworkLinkDatum,
>({ link }: { link: PositionedLink<TNode, TLink> }) {
  const {
    getLinkColor,
    graph,
    hideTooltip,
    hover,
    linkRoughOptionsByKey,
    renderer,
    setHover,
    showTooltip,
  } = useNetworkRenderContext<TNode, TLink>()
  const linkIndex = graph.links.indexOf(link)
  const presence = getChartMarkPresence({
    hover,
    key: link.key,
    isRelated:
      hover?.type === "node"
        ? hover.key === getChartMarkKey("node", link.source.id) ||
          hover.key === getChartMarkKey("node", link.target.id)
        : undefined,
  })
  const opacity = getChartMarkOpacity({
    baseOpacity: 0.72,
    presence,
  })
  const color = getLinkColor?.(link, linkIndex) ?? getDefaultLinkColor(link)
  const path = getNetworkLinkPath(link)
  const handlePointerEnter = (event: React.PointerEvent<SVGLineElement>) => {
    setHover({ key: link.key, type: "link" })
    showTooltip(event, {
      index: linkIndex,
      type: "link",
    })
  }

  return (
    <ChartMotionGroup
      animate={{ opacity }}
      initial={false}
      transition={chartMotion.hover}
    >
      {renderer === "rough" ? (
        <RoughPath
          d={path}
          options={linkRoughOptionsByKey?.get(link.key)}
        />
      ) : (
        <line
          stroke={color}
          strokeLinecap="round"
          strokeOpacity={0.72}
          strokeWidth={link.width}
          x1={link.source.x}
          x2={link.target.x}
          y1={link.source.y}
          y2={link.target.y}
        />
      )}
      <ChartHitLine
        onPointerEnter={handlePointerEnter}
        onPointerLeave={hideTooltip}
        strokeWidth={Math.max(16, link.width + 10)}
        x1={link.source.x}
        x2={link.target.x}
        y1={link.source.y}
        y2={link.target.y}
      />
    </ChartMotionGroup>
  )
}

function NetworkNodeMark<TNode extends NetworkNodeDatum>({
  node,
}: {
  node: PositionedNode<TNode>
}) {
  const {
    activeLink,
    getNodeColor,
    graph,
    hideTooltip,
    hover,
    nodeRoughOptionsById,
    renderer,
    setHover,
    showTooltip,
  } = useNetworkRenderContext<TNode, NetworkLinkDatum>()
  const nodeIndex = graph.nodes.indexOf(node)
  const nodeKey = getChartMarkKey("node", node.id)
  const presence = getChartMarkPresence({
    hover,
    key: nodeKey,
    isRelated:
      hover?.type === "link" && activeLink
        ? isNodeRelatedToLink(node, activeLink)
        : undefined,
  })
  const opacity = getChartMarkOpacity({ presence })
  const color = getNodeColor?.(node, nodeIndex) ?? getDefaultNodeColor(node)
  const handlePointerEnter = (event: React.PointerEvent<SVGCircleElement>) => {
    setHover({ key: nodeKey, type: "node" })
    showTooltip(event, {
      index: nodeIndex,
      type: "node",
    })
  }

  return (
    <ChartMotionGroup
      animate={{ opacity }}
      initial={false}
      transition={chartMotion.hover}
    >
      {renderer === "rough" ? (
        <RoughCircle
          diameter={node.radius * 2}
          options={nodeRoughOptionsById?.get(node.id)}
          x={0}
          y={0}
        />
      ) : (
        <circle fill={color} r={node.radius} />
      )}
      <ChartHitCircle
        cx={0}
        cy={0}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={hideTooltip}
        r={Math.max(16, node.radius)}
      />
      {node.label ? (
        <text
          className="fill-foreground text-[0.68rem]"
          dy={node.radius + 14}
          textAnchor="middle"
        >
          {node.label}
        </text>
      ) : null}
    </ChartMotionGroup>
  )
}

function NetworkChartSurface<
  TNode extends NetworkNodeDatum,
  TLink extends NetworkLinkDatum,
>({
  data,
  followTooltip,
  getLinkColor,
  getNodeColor,
  height,
  hideTooltip,
  hover,
  layout,
  renderLinkTooltip,
  renderNodeTooltip,
  renderer,
  roughOptions,
  setHover,
  showTooltip,
  tooltipData,
  tooltipLeft,
  tooltipOpen,
  tooltipTop,
  width,
}: {
  data: NetworkChartData<TNode, TLink>
  followTooltip: (
    event: React.MouseEvent<Element> | React.PointerEvent<Element>
  ) => void
  getLinkColor?: (link: PositionedLink<TNode, TLink>, index: number) => string
  getNodeColor?: (node: PositionedNode<TNode>, index: number) => string
  height: number
  hideTooltip: () => void
  hover: NetworkHoverState | null
  layout?: NetworkChartLayout
  renderLinkTooltip?: NetworkChartProps<TNode, TLink>["renderLinkTooltip"]
  renderNodeTooltip?: NetworkChartProps<TNode, TLink>["renderNodeTooltip"]
  renderer: ChartRenderer
  roughOptions?: RoughOptions
  setHover: React.Dispatch<React.SetStateAction<NetworkHoverState | null>>
  showTooltip: (
    event: React.MouseEvent<Element> | React.PointerEvent<Element>,
    data: TooltipState
  ) => void
  tooltipData: TooltipState | null | undefined
  tooltipLeft?: number
  tooltipOpen: boolean
  tooltipTop?: number
  width: number
}) {
  const graph = React.useMemo(
    () => resolveNetworkGraph({ data, height, layout, width }),
    [data, height, layout, width]
  )
  const linkRoughOptionsByKey = React.useMemo(() => {
    if (renderer !== "rough") {
      return undefined
    }

    return new Map(
      graph.links.map((link, index) => {
        const color = getLinkColor?.(link, index) ?? getDefaultLinkColor(link)

        return [
          link.key,
          {
            ...roughOptions,
            stroke: color,
            strokeWidth: link.width,
          },
        ] as const
      })
    )
  }, [getLinkColor, graph.links, renderer, roughOptions])
  const nodeRoughOptionsById = React.useMemo(() => {
    if (renderer !== "rough") {
      return undefined
    }

    return new Map(
      graph.nodes.map((node, index) => {
        const color = getNodeColor?.(node, index) ?? getDefaultNodeColor(node)

        return [
          node.id,
          {
            ...roughOptions,
            fill: color,
            stroke: roughOptions?.stroke ?? color,
          },
        ] as const
      })
    )
  }, [getNodeColor, graph.nodes, renderer, roughOptions])
  const { activeLink, activeNode } = getNetworkTooltipModel({
    graph,
    tooltipData: tooltipData ?? undefined,
  })
  const renderContext = React.useMemo(
    (): NetworkRenderContextValue<TNode, TLink> => ({
      activeLink,
      getLinkColor,
      getNodeColor,
      graph,
      hideTooltip,
      hover,
      linkRoughOptionsByKey,
      nodeRoughOptionsById,
      renderer,
      setHover,
      showTooltip,
    }),
    [
      activeLink,
      getLinkColor,
      getNodeColor,
      graph,
      hideTooltip,
      hover,
      linkRoughOptionsByKey,
      nodeRoughOptionsById,
      renderer,
      setHover,
      showTooltip,
    ]
  )

  return (
    <ChartInteractionRoot
      onPointerLeave={hideTooltip}
      onPointerMove={followTooltip}
    >
      <ChartSvg aria-label="network chart" role="img">
        <NetworkRenderContext.Provider value={renderContext}>
          <Graph
            graph={graph}
            linkComponent={
              NetworkLinkMark as React.ComponentType<{
                link: PositionedLink<TNode, TLink>
              }>
            }
            nodeComponent={
              NetworkNodeMark as React.ComponentType<{
                node: PositionedNode<TNode>
              }>
            }
          />
        </NetworkRenderContext.Provider>
      </ChartSvg>

      <ChartTooltip
        visible={tooltipOpen}
        x={tooltipLeft ?? 0}
        y={tooltipTop ?? 0}
      >
        <ChartTooltipPanel>
          {tooltipData?.type === "node" && activeNode
            ? renderNodeTooltip?.({
                index: tooltipData.index,
                node: activeNode,
              }) ?? <strong>{activeNode.label ?? activeNode.id}</strong>
            : null}
          {tooltipData?.type === "link" && activeLink
            ? renderLinkTooltip?.({
                index: tooltipData.index,
                link: activeLink,
              }) ?? (
                <strong>
                  {activeLink.source.label ?? activeLink.source.id} {"->"}{" "}
                  {activeLink.target.label ?? activeLink.target.id}
                </strong>
              )
            : null}
        </ChartTooltipPanel>
      </ChartTooltip>
    </ChartInteractionRoot>
  )
}

export function NetworkChart<
  TNode extends NetworkNodeDatum = NetworkNodeDatum,
  TLink extends NetworkLinkDatum = NetworkLinkDatum,
>({
  className,
  config,
  data,
  getLinkColor = getDefaultLinkColor as NetworkChartProps<
    TNode,
    TLink
  >["getLinkColor"],
  getNodeColor = getDefaultNodeColor,
  layout,
  minHeight = 360,
  renderLinkTooltip,
  renderNodeTooltip,
  renderer = "svg",
  roughOptions,
}: NetworkChartProps<TNode, TLink>) {
  const {
    currentTooltipData,
    followTooltip,
    hideTooltip,
    hover,
    setHover,
    showTooltip,
    tooltipLeft,
    tooltipOpen,
    tooltipTop,
  } = useChartMarkTooltip<TooltipState, "node" | "link">()

  return (
    <ChartContainer
      aspectRatio={layout?.aspectRatio ?? "5 / 3"}
      className={className}
      config={config}
      emptyData={
        <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
          No network data
        </div>
      }
      isEmpty={data.nodes.length === 0}
      minHeight={minHeight}
    >
      {({ height, width }) => (
        <NetworkChartSurface
          data={data}
          followTooltip={followTooltip}
          getLinkColor={getLinkColor}
          getNodeColor={getNodeColor}
          height={height}
          hideTooltip={hideTooltip}
          hover={hover}
          layout={layout}
          renderLinkTooltip={renderLinkTooltip}
          renderNodeTooltip={renderNodeTooltip}
          renderer={renderer}
          roughOptions={roughOptions}
          setHover={setHover}
          showTooltip={showTooltip}
          tooltipData={currentTooltipData}
          tooltipLeft={tooltipLeft}
          tooltipOpen={tooltipOpen}
          tooltipTop={tooltipTop}
          width={width}
        />
      )}
    </ChartContainer>
  )
}
