import { Graph } from "@visx/network"
import * as React from "react"
import type { ReactNode } from "react"

import {
  type ChartTextureOptions,
  type ChartMaterialRegistry,
  ChartRenderedCircle,
  ChartRenderedPath,
} from "./runtime"
import {
  type ChartConfig,
  type ChartHoverState,
  type ChartRoughOptions,
  ChartContainer,
  ChartHitCircle,
  ChartHitLine,
  ChartInteractionRoot,
  ChartLegend,
  ChartMotionGroup,
  ChartSvg,
  ChartTooltip,
  ChartTooltipPanel,
  type ChartRenderer,
  chartMotion,
  getChartMarkKey,
  isFiniteNumber,
  resolveChartRenderer,
  useChartMarkInteraction,
  useChartMaterialRegistry,
} from "./runtime"

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
  config?: ChartConfig
  data: NetworkChartData<TNode, TLink>
  getLinkColorKey?: (link: PositionedLink<TNode, TLink>, index: number) => string
  getNodeColorKey?: (node: PositionedNode<TNode>, index: number) => string
  layout?: NetworkChartLayout
  legend?: boolean
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
  rough?: ChartRoughOptions
  texture?: ChartTextureOptions
}

const DEFAULT_MARGIN: NetworkMargin = {
  bottom: 42,
  left: 48,
  right: 48,
  top: 42,
}

const DEFAULT_RADIUS_RANGE: [number, number] = [12, 30]
const DEFAULT_LINK_WIDTH_RANGE: [number, number] = [1.4, 8]
const DEFAULT_NETWORK_CONFIG = {
  airport: {
    label: "Airport",
  },
  primary: {
    label: "Primary",
  },
} satisfies ChartConfig

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

function getDefaultNodeColorKey(node: NetworkNodeDatum) {
  return node.category === "Airport" ? "airport" : "primary"
}

function getDefaultLinkColorKey(link: PositionedLink<NetworkNodeDatum, NetworkLinkDatum>) {
  return link.source.category === "Airport" || link.target.category === "Airport"
    ? "airport"
    : "primary"
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
  getMarkState: ReturnType<
    typeof useChartMarkInteraction<TooltipState, "node" | "link">
  >["getMarkState"]
  getLinkColorKey?: (link: PositionedLink<TNode, TLink>, index: number) => string
  getMaterial: ChartMaterialRegistry["getMaterial"]
  getNodeColorKey?: (node: PositionedNode<TNode>, index: number) => string
  graph: NetworkGraph<TNode, TLink>
  hideTooltip: () => void
  hover: NetworkHoverState | null
  renderer: ChartRenderer
  showMark: ReturnType<
    typeof useChartMarkInteraction<TooltipState, "node" | "link">
  >["showMark"]
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
    getMarkState,
    getLinkColorKey,
    getMaterial,
    graph,
    hideTooltip,
    hover,
    renderer,
    showMark,
  } = useNetworkRenderContext<TNode, TLink>()
  const linkIndex = graph.links.indexOf(link)
  const markState = getMarkState({
    baseOpacity: 0.72,
    key: link.key,
    isRelated:
      hover?.type === "node"
        ? hover.key === getChartMarkKey("node", link.source.id) ||
          hover.key === getChartMarkKey("node", link.target.id)
        : undefined,
  })
  const colorKey =
    getLinkColorKey?.(link, linkIndex) ?? getDefaultLinkColorKey(link)
  const material = getMaterial(colorKey)
  const color = material.color
  const path = getNetworkLinkPath(link)
  const handlePointerEnter = (event: React.PointerEvent<Element>) => {
    showMark({
      data: {
        index: linkIndex,
        type: "link",
      },
      event,
      key: link.key,
      type: "link",
    })
  }

  return (
    <ChartMotionGroup
      animate={{ opacity: markState.opacity }}
      initial={false}
      transition={chartMotion.hover}
    >
      <ChartRenderedPath
        color={color}
        d={path}
        fill="none"
        renderer={renderer}
        rough={{
          ...material.rough,
          stroke: color,
          strokeWidth: link.width,
        }}
        stroke={color}
        strokeLinecap="round"
        strokeOpacity={0.72}
        strokeWidth={link.width}
        textureIndex={material.textureIndex}
        textureKey={material.textureKey}
        texture={material.texture}
        textureScopeId={material.textureScopeId}
      />
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
    getMarkState,
    getMaterial,
    getNodeColorKey,
    graph,
    hideTooltip,
    hover,
    renderer,
    showMark,
  } = useNetworkRenderContext<TNode, NetworkLinkDatum>()
  const nodeIndex = graph.nodes.indexOf(node)
  const nodeKey = getChartMarkKey("node", node.id)
  const markState = getMarkState({
    key: nodeKey,
    isRelated:
      hover?.type === "link" && activeLink
        ? isNodeRelatedToLink(node, activeLink)
        : undefined,
  })
  const colorKey =
    getNodeColorKey?.(node, nodeIndex) ?? getDefaultNodeColorKey(node)
  const material = getMaterial(colorKey)
  const color = material.color
  const handlePointerEnter = (event: React.PointerEvent<Element>) => {
    showMark({
      data: {
        index: nodeIndex,
        type: "node",
      },
      event,
      key: nodeKey,
      type: "node",
    })
  }

  return (
    <ChartMotionGroup
      animate={{ opacity: markState.opacity }}
      initial={false}
      transition={chartMotion.hover}
    >
      <ChartRenderedCircle
        color={color}
        cx={0}
        cy={0}
        r={node.radius}
        renderer={renderer}
        rough={{
          ...material.rough,
          fill: color,
          stroke: material.rough?.stroke ?? color,
        }}
        stroke={renderer === "texture" ? color : undefined}
        strokeWidth={renderer === "texture" ? 1 : undefined}
        textureIndex={material.textureIndex}
        textureKey={material.textureKey}
        texture={material.texture}
        textureScopeId={material.textureScopeId}
      />
      <ChartHitCircle
        cx={0}
        cy={0}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={hideTooltip}
        r={Math.max(16, node.radius)}
      />
      {node.label ? (
        <text
          className="fill-foreground text-2xs"
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
  defs,
  followTooltip,
  getMarkState,
  getMaterial,
  getLinkColorKey,
  getNodeColorKey,
  height,
  hideTooltip,
  hover,
  layout,
  renderLinkTooltip,
  renderNodeTooltip,
  renderer,
  showMark,
  tooltipData,
  tooltipLeft,
  tooltipOpen,
  tooltipTop,
  width,
}: {
  data: NetworkChartData<TNode, TLink>
  defs: React.ReactNode
  followTooltip: (
    event: React.MouseEvent<Element> | React.PointerEvent<Element>
  ) => void
  getMarkState: ReturnType<
    typeof useChartMarkInteraction<TooltipState, "node" | "link">
  >["getMarkState"]
  getMaterial: ChartMaterialRegistry["getMaterial"]
  getLinkColorKey?: (link: PositionedLink<TNode, TLink>, index: number) => string
  getNodeColorKey?: (node: PositionedNode<TNode>, index: number) => string
  height: number
  hideTooltip: () => void
  hover: NetworkHoverState | null
  layout?: NetworkChartLayout
  renderLinkTooltip?: NetworkChartProps<TNode, TLink>["renderLinkTooltip"]
  renderNodeTooltip?: NetworkChartProps<TNode, TLink>["renderNodeTooltip"]
  renderer: ChartRenderer
  showMark: ReturnType<
    typeof useChartMarkInteraction<TooltipState, "node" | "link">
  >["showMark"]
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
  const { activeLink, activeNode } = getNetworkTooltipModel({
    graph,
    tooltipData: tooltipData ?? undefined,
  })
  const renderContext = React.useMemo(
    (): NetworkRenderContextValue<TNode, TLink> => ({
      activeLink,
      getMarkState,
      getLinkColorKey,
      getMaterial,
      getNodeColorKey,
      graph,
      hideTooltip,
      hover,
      renderer,
      showMark,
    }),
    [
      activeLink,
      getMarkState,
      getLinkColorKey,
      getMaterial,
      getNodeColorKey,
      graph,
      hideTooltip,
      hover,
      renderer,
      showMark,
    ]
  )

  return (
    <ChartInteractionRoot
      onPointerLeave={hideTooltip}
      onPointerMove={followTooltip}
    >
      <ChartSvg aria-label="network chart" role="img">
        {defs}
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
  getLinkColorKey = getDefaultLinkColorKey as NetworkChartProps<
    TNode,
    TLink
  >["getLinkColorKey"],
  getNodeColorKey = getDefaultNodeColorKey,
  layout,
  legend = false,
  minHeight = 360,
  renderLinkTooltip,
  renderNodeTooltip,
  renderer = "svg",
  rough,
  texture,
}: NetworkChartProps<TNode, TLink>) {
  const resolvedRenderer = resolveChartRenderer(renderer, [
    "svg",
    "rough",
    "texture",
  ])
  const {
    currentTooltipData,
    followTooltip,
    getMarkState,
    hideTooltip,
    hover,
    showMark,
    tooltipLeft,
    tooltipOpen,
    tooltipTop,
  } = useChartMarkInteraction<TooltipState, "node" | "link">()
  const colorKeys = React.useMemo(() => {
    const keys = new Set<string>()
    const roughGraph = resolveNetworkGraph({
      data,
      height: 1,
      layout,
      width: 1,
    })

    roughGraph.nodes.forEach((node, index) => {
      keys.add(getNodeColorKey?.(node, index) ?? getDefaultNodeColorKey(node))
    })
    roughGraph.links.forEach((link, index) => {
      keys.add(getLinkColorKey?.(link, index) ?? getDefaultLinkColorKey(link))
    })

    const resolvedKeys = Array.from(keys)

    return resolvedKeys.length > 0 ? resolvedKeys : ["primary"]
  }, [data, getLinkColorKey, getNodeColorKey, layout])
  const materials = useChartMaterialRegistry({
    config,
    defaults: DEFAULT_NETWORK_CONFIG,
    includeDefaultKeys: false,
    keys: colorKeys,
    renderer: resolvedRenderer,
    rough,
    scope: "network",
    strategy: "relational",
    texture,
  })

  return (
    <ChartContainer
      aspectRatio={layout?.aspectRatio ?? "5 / 3"}
      className={className}
      config={materials.resolvedConfig}
      emptyData={
        <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
          No network data
        </div>
      }
      isEmpty={data.nodes.length === 0}
      minHeight={minHeight}
    >
      {({ height, series, width }) => (
        <>
          <NetworkChartSurface
            data={data}
            defs={materials.defs}
            followTooltip={followTooltip}
            getMarkState={getMarkState}
            getMaterial={materials.getMaterial}
            getLinkColorKey={getLinkColorKey}
            getNodeColorKey={getNodeColorKey}
            height={height}
            hideTooltip={hideTooltip}
            hover={hover}
            layout={layout}
            renderLinkTooltip={renderLinkTooltip}
            renderNodeTooltip={renderNodeTooltip}
            renderer={resolvedRenderer}
            showMark={showMark}
            tooltipData={currentTooltipData}
            tooltipLeft={tooltipLeft}
            tooltipOpen={tooltipOpen}
            tooltipTop={tooltipTop}
            width={width}
          />
          {legend ? (
            <ChartLegend
              className="absolute inset-x-0 bottom-0 justify-center"
              series={series}
            />
          ) : null}
        </>
      )}
    </ChartContainer>
  )
}
