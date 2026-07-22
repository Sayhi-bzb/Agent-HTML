import {
  hierarchy,
  type HierarchyNode,
  partition,
  type HierarchyRectangularNode,
} from "d3-hierarchy"
import { arc } from "@visx/vendor/d3-shape"
import * as React from "react"

import {
  type ChartConfig,
  ChartContainer,
  ChartHitPath,
  ChartInteractionRoot,
  ChartLegend,
  ChartMotionGroup,
  ChartRenderedPath,
  type ChartRenderer,
  type ChartRoughOptions,
  ChartSvg,
  type ChartTextureOptions,
  ChartTooltip,
  ChartTooltipContent,
  getChartMarkKey,
  resolveChartRenderer,
  useChartMarkInteraction,
  useChartMaterialRegistry,
} from "./runtime"

export interface SunburstDatum {
  children?: SunburstDatum[]
  name: string
  value?: number
  [key: string]: unknown
}

export interface SunburstChartProps<T extends SunburstDatum = SunburstDatum> {
  aspectRatio?: string
  className?: string
  config?: ChartConfig
  data: T
  centerLabel?: React.ReactNode
  centerValue?: React.ReactNode | ((props: { total: number }) => React.ReactNode)
  getColorKey?: (node: SunburstNode<T>, index: number) => string
  getNodeKey?: (node: SunburstNode<T>, index: number) => string
  getNodeLabel?: (node: SunburstNode<T>) => React.ReactNode
  legend?: boolean
  maxDepth?: number
  minAngle?: number
  minHeight?: number
  renderTooltip?: (props: {
    index: number
    node: SunburstNode<T>
    path: string[]
  }) => React.ReactNode
  renderer?: ChartRenderer
  rough?: ChartRoughOptions
  sort?: "value" | "none" | ((left: HierarchyNode<T>, right: HierarchyNode<T>) => number)
  texture?: ChartTextureOptions
  valueFormatter?: (value: number) => React.ReactNode
}

export type SunburstNode<T extends SunburstDatum = SunburstDatum> =
  HierarchyRectangularNode<T>

interface SunburstMark<T extends SunburstDatum> {
  colorKey: string
  d: string
  index: number
  key: string
  label: React.ReactNode
  markKey: string
  node: SunburstNode<T>
  path: string[]
}

interface TooltipState<T extends SunburstDatum> {
  mark: SunburstMark<T>
}

const tau = Math.PI * 2
const defaultMinAngle = 0.01

function formatValue(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

function getNodePath<T extends SunburstDatum>(node: SunburstNode<T>) {
  return node
    .ancestors()
    .reverse()
    .map((ancestor) => ancestor.data.name)
}

function getDefaultNodeKey<T extends SunburstDatum>(node: SunburstNode<T>) {
  return getNodePath(node).join("/")
}

function getTopLevelAncestor<T extends SunburstDatum>(node: SunburstNode<T>) {
  const ancestors = node.ancestors()

  return ancestors[ancestors.length - 2] ?? node
}

function getDefaultColorKey<T extends SunburstDatum>(node: SunburstNode<T>) {
  return getTopLevelAncestor(node).data.name
}

function isRelatedNode<T extends SunburstDatum>({
  hover,
  node,
}: {
  hover: string | null
  node: SunburstNode<T>
}) {
  if (!hover) {
    return true
  }

  const nodeKey = getDefaultNodeKey(node)

  return nodeKey === hover || nodeKey.startsWith(`${hover}/`) || hover.startsWith(`${nodeKey}/`)
}

function createSunburstLayout<T extends SunburstDatum>({
  data,
  maxDepth,
  radius,
  sort,
}: {
  data: T
  maxDepth?: number
  radius: number
  sort: NonNullable<SunburstChartProps<T>["sort"]>
}) {
  const root = hierarchy<T>(data).sum((node) => node.value ?? 0)

  if (sort === "value") {
    root.sort((left, right) => (right.value ?? 0) - (left.value ?? 0))
  } else if (typeof sort === "function") {
    root.sort(sort)
  }

  const depth = Math.max(1, maxDepth ?? root.height)

  return partition<T>().size([tau, radius])(root).descendants().filter(
    (node): node is SunburstNode<T> =>
      node.depth > 0 &&
      node.depth <= depth &&
      Number.isFinite(node.value) &&
      (node.value ?? 0) > 0
  )
}

function createSunburstMarks<T extends SunburstDatum>({
  getColorKey,
  getNodeKey,
  getNodeLabel,
  maxDepth,
  minAngle,
  nodes,
}: {
  getColorKey?: SunburstChartProps<T>["getColorKey"]
  getNodeKey?: SunburstChartProps<T>["getNodeKey"]
  getNodeLabel?: SunburstChartProps<T>["getNodeLabel"]
  maxDepth?: number
  minAngle: number
  nodes: SunburstNode<T>[]
}) {
  const path = arc<SunburstNode<T>>()
    .startAngle((node) => node.x0)
    .endAngle((node) => node.x1)
    .innerRadius((node) => node.y0)
    .outerRadius((node) => node.y1)
    .padAngle(0.002)

  return nodes
    .filter((node) => maxDepth === undefined || node.depth <= maxDepth)
    .filter((node) => node.x1 - node.x0 >= minAngle)
    .map<SunburstMark<T>>((node, index) => {
      const d = path(node) ?? ""

      return {
        colorKey: getColorKey?.(node, index) ?? getDefaultColorKey(node),
        d,
        index,
        key: getNodeKey?.(node, index) ?? getDefaultNodeKey(node),
        label: getNodeLabel?.(node) ?? node.data.name,
        markKey: getChartMarkKey(
          "node",
          getNodeKey?.(node, index) ?? getDefaultNodeKey(node)
        ),
        node,
        path: getNodePath(node),
      }
    })
    .filter((mark) => mark.d.trim() !== "")
}

export function SunburstChart<T extends SunburstDatum>({
  aspectRatio = "1 / 1",
  className,
  config,
  data,
  centerLabel,
  centerValue,
  getColorKey,
  getNodeKey,
  getNodeLabel,
  legend = false,
  maxDepth,
  minAngle = defaultMinAngle,
  minHeight = 280,
  renderTooltip,
  renderer = "svg",
  rough,
  sort = "value",
  texture,
  valueFormatter = formatValue,
}: SunburstChartProps<T>) {
  const resolvedRenderer = resolveChartRenderer(renderer, [
    "svg",
    "rough",
    "texture",
  ])
  const {
    currentTooltipData: tooltip,
    followTooltip,
    getMarkState,
    getMarkMotion,
    hideTooltip,
    hover,
    showMark,
    tooltipLeft,
    tooltipOpen,
    tooltipTop,
  } = useChartMarkInteraction<TooltipState<T>, "node">()
  const materialNodes = React.useMemo(
    () =>
      createSunburstLayout({
        data,
        maxDepth,
        radius: 1,
        sort,
      }),
    [data, maxDepth, sort]
  )
  const total = materialNodes[0]?.parent?.value ?? 0
  const materialKeys = React.useMemo(() => {
    const keys = new Set<string>()

    materialNodes.forEach((node, index) => {
      keys.add(getColorKey?.(node, index) ?? getDefaultColorKey(node))
    })

    return Array.from(keys)
  }, [getColorKey, materialNodes])
  const materials = useChartMaterialRegistry({
    config,
    keys: materialKeys.length > 0 ? materialKeys : ["value"],
    renderer: resolvedRenderer,
    rough,
    scope: "sunburst",
    strategy: "relational",
    texture,
  })

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={className}
      config={materials.resolvedConfig}
      emptyData={
        <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
          No hierarchy data
        </div>
      }
      isEmpty={materialNodes.length === 0}
      minHeight={minHeight}
    >
      {({ height, series, width }) => {
        const legendOffset = legend ? 44 : 0
        const radius = Math.max(0, Math.min(width, height - legendOffset) / 2 - 12)
        const nodes = createSunburstLayout({
          data,
          maxDepth,
          radius,
          sort,
        })
        const marks = createSunburstMarks({
          getColorKey,
          getNodeKey,
          getNodeLabel,
          maxDepth,
          minAngle,
          nodes,
        })
        const activeMark = hover?.key
          ? (marks.find((mark) => mark.markKey === hover.key) ?? null)
          : null
        const centerHitRadius = marks.reduce(
          (minimum, mark) => Math.min(minimum, mark.node.y0),
          Number.POSITIVE_INFINITY
        )
        const hideCenterTooltip = (event: React.PointerEvent<SVGCircleElement>) => {
          event.stopPropagation()
          hideTooltip()
        }
        const renderedCenterValue =
          typeof centerValue === "function" ? centerValue({ total }) : centerValue
        const centerX = width / 2
        const centerY = (height - legendOffset) / 2

        return (
          <ChartInteractionRoot
            onPointerLeave={hideTooltip}
            onPointerMove={followTooltip}
          >
            <ChartSvg aria-label="sunburst chart" role="img">
              {materials.defs}
              <g transform={`translate(${centerX}, ${centerY})`}>
                {marks.map((mark) => {
                  const material = materials.getMaterial(mark.colorKey)
                  const isRelated = isRelatedNode({
                    hover: activeMark?.key ?? null,
                    node: mark.node,
                  })
                  const markState = getMarkState({
                    isRelated,
                    key: mark.markKey,
                  })
                  const motion = getMarkMotion({
                    baseOpacity: markState.opacity,
                    key: mark.markKey,
                  })

                  return (
                    <g key={mark.key}>
                      <ChartMotionGroup {...motion}>
                        <ChartRenderedPath
                          color={material.color}
                          d={mark.d}
                          renderer={material.renderer}
                          rough={material.rough}
                          stroke={material.color}
                          strokeOpacity={0.8}
                          textureIndex={material.textureIndex}
                          textureKey={material.textureKey}
                          texture={material.texture}
                          textureScopeId={material.textureScopeId}
                        />
                      </ChartMotionGroup>
                      <ChartHitPath
                        d={mark.d}
                        onPointerEnter={(event) => {
                          showMark({
                            data: { mark },
                            event,
                            key: mark.markKey,
                            type: "node",
                          })
                        }}
                        onPointerLeave={hideTooltip}
                        onPointerMove={followTooltip}
                      />
                    </g>
                  )
                })}
                {Number.isFinite(centerHitRadius) && centerHitRadius > 0 ? (
                  <circle
                    fill="transparent"
                    onPointerEnter={hideCenterTooltip}
                    onPointerMove={hideCenterTooltip}
                    pointerEvents="all"
                    r={centerHitRadius}
                  />
                ) : null}
                {renderedCenterValue || centerLabel ? (
                  <g pointerEvents="none" textAnchor="middle">
                    {renderedCenterValue ? (
                      <text
                        className="fill-foreground text-lg font-semibold tabular-nums"
                        dominantBaseline={centerLabel ? "alphabetic" : "middle"}
                        y={centerLabel ? -2 : 0}
                      >
                        {renderedCenterValue}
                      </text>
                    ) : null}
                    {centerLabel ? (
                      <text
                        className="fill-muted-foreground text-2xs uppercase tracking-normal"
                        dominantBaseline={renderedCenterValue ? "hanging" : "middle"}
                        y={renderedCenterValue ? 8 : 0}
                      >
                        {centerLabel}
                      </text>
                    ) : null}
                  </g>
                ) : null}
              </g>
            </ChartSvg>

            <ChartTooltip
              visible={tooltipOpen}
              x={tooltipLeft ?? 0}
              y={tooltipTop ?? 0}
            >
              {tooltip
                ? renderTooltip?.({
                    index: tooltip.mark.index,
                    node: tooltip.mark.node,
                    path: tooltip.mark.path,
                  }) ?? (
                    <ChartTooltipContent
                      items={[
                        {
                          color: materials.getMaterial(tooltip.mark.colorKey).color,
                          key: tooltip.mark.key,
                          label: tooltip.mark.label,
                          value: valueFormatter(tooltip.mark.node.value ?? 0),
                        },
                      ]}
                      label={tooltip.mark.path.join(" / ")}
                    />
                  )
                : null}
            </ChartTooltip>

            {legend ? (
              <ChartLegend
                className="absolute inset-x-0 bottom-0 justify-center"
                series={series}
              />
            ) : null}
          </ChartInteractionRoot>
        )
      }}
    </ChartContainer>
  )
}

export default SunburstChart
