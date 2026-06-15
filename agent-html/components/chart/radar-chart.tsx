import { scaleLinear } from "@visx/scale"
import * as React from "react"

import {
  type ChartAccessor,
  type ChartConfig,
  ChartContainer,
  ChartHitCircle,
  ChartInteractionRoot,
  ChartLegend,
  ChartMotionGroup,
  ChartRenderedCircle,
  ChartRenderedPath,
  type ChartRenderer,
  type ChartRoughOptions,
  ChartSvg,
  type ChartTextureOptions,
  ChartTooltip,
  type ChartTooltipField,
  ChartTooltipContent,
  ChartTooltipPanel,
  getValue,
  isFiniteNumber,
  resolveChartRenderer,
  resolveChartTooltipItems,
  useChartMarkInteraction,
  useChartMaterialRegistry,
} from "./runtime"

export interface RadarChartProps<T> {
  angleKey: ChartAccessor<T, string>
  angleLabelFormatter?: (value: string) => React.ReactNode
  aspectRatio?: string
  className?: string
  config?: ChartConfig
  data: readonly T[]
  legend?: boolean
  levels?: number
  minHeight?: number
  renderTooltip?: (props: {
    datum: T
    label: React.ReactNode
    seriesKey: string
    seriesLabel: React.ReactNode
    value: number
  }) => React.ReactNode
  renderer?: ChartRenderer
  rough?: ChartRoughOptions
  texture?: ChartTextureOptions
  tooltipFields?: readonly ChartTooltipField<T>[]
  tooltipLabel?: ChartAccessor<T, React.ReactNode>
  valueDomain?: readonly [number, number]
  valueFormatter?: (value: number) => React.ReactNode
  valueKey: ChartAccessor<T, number>
}

interface RadarPoint<T> {
  angle: number
  datum: T
  key: string
  label: React.ReactNode
  rawLabel: string
  value: number
  x: number
  y: number
}

interface TooltipState<T> {
  point: RadarPoint<T>
}

const DEFAULT_MARGIN = {
  bottom: 36,
  left: 44,
  right: 44,
  top: 28,
}

const numberFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
})

function formatValue(value: number) {
  return numberFormatter.format(value)
}

function getPolarPoint({
  angle,
  radius,
}: {
  angle: number
  radius: number
}) {
  return {
    x: radius * Math.sin(angle),
    y: -radius * Math.cos(angle),
  }
}

function createClosedPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) {
    return ""
  }

  const [firstPoint, ...restPoints] = points

  return [
    `M${firstPoint.x},${firstPoint.y}`,
    ...restPoints.map((point) => `L${point.x},${point.y}`),
    "Z",
  ].join(" ")
}

function createOpenPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) {
    return ""
  }

  const [firstPoint, ...restPoints] = points

  return [
    `M${firstPoint.x},${firstPoint.y}`,
    ...restPoints.map((point) => `L${point.x},${point.y}`),
  ].join(" ")
}

function createRadarPoints<T>({
  angleKey,
  angleLabelFormatter,
  data,
  radiusScale,
  valueKey,
}: {
  angleKey: ChartAccessor<T, string>
  angleLabelFormatter?: (value: string) => React.ReactNode
  data: readonly T[]
  radiusScale: (value: number) => number
  valueKey: ChartAccessor<T, number>
}) {
  const step = data.length > 0 ? (Math.PI * 2) / data.length : 0

  return data
    .map<RadarPoint<T> | null>((datum, index) => {
      const rawLabel = getValue(datum, angleKey)
      const value = getValue(datum, valueKey)

      if (!isFiniteNumber(value)) {
        return null
      }

      const angle = index * step
      const point = getPolarPoint({
        angle,
        radius: radiusScale(value),
      })

      return {
        angle,
        datum,
        key: rawLabel,
        label: angleLabelFormatter
          ? angleLabelFormatter(rawLabel)
          : rawLabel,
        rawLabel,
        value,
        ...point,
      }
    })
    .filter((point): point is RadarPoint<T> => point !== null)
}

function RadarAxisLabels<T>({
  points,
  radius,
}: {
  points: Array<Pick<RadarPoint<T>, "angle" | "key" | "label">>
  radius: number
}) {
  const labelRadius = radius + 18

  return (
    <>
      {points.map((point) => {
        const labelPoint = getPolarPoint({
          angle: point.angle,
          radius: labelRadius,
        })
        const horizontal =
          Math.abs(labelPoint.x) < 6
            ? "middle"
            : labelPoint.x > 0
              ? "start"
              : "end"

        return (
          <text
            className="fill-muted-foreground text-[0.68rem]"
            dominantBaseline="middle"
            key={point.key}
            textAnchor={horizontal}
            x={labelPoint.x}
            y={labelPoint.y}
          >
            {point.label}
          </text>
        )
      })}
    </>
  )
}

export function RadarChart<T>({
  angleKey,
  angleLabelFormatter,
  aspectRatio = "1 / 1",
  className,
  config,
  data,
  legend = false,
  levels = 5,
  minHeight = 280,
  renderTooltip,
  renderer = "svg",
  rough,
  texture,
  tooltipFields,
  tooltipLabel,
  valueDomain,
  valueFormatter = formatValue,
  valueKey,
}: RadarChartProps<T>) {
  const resolvedRenderer = resolveChartRenderer(renderer, [
    "svg",
    "rough",
    "texture",
  ])
  const {
    currentTooltipData: tooltip,
    followTooltip,
    getMarkKey,
    getMarkMotion,
    hideTooltip,
    showMark,
    tooltipLeft,
    tooltipOpen,
    tooltipTop,
  } = useChartMarkInteraction<TooltipState<T>, "point">()
  const seriesKey = React.useMemo(
    () => Object.keys(config ?? {})[0] ?? "value",
    [config]
  )
  const materials = useChartMaterialRegistry({
    config,
    keys: [seriesKey],
    renderer: resolvedRenderer,
    rough,
    scope: "radar",
    strategy: "single",
    texture,
  })
  const values = React.useMemo(
    () =>
      data
        .map((datum) => getValue(datum, valueKey))
        .filter(isFiniteNumber),
    [data, valueKey]
  )

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={className}
      config={materials.resolvedConfig}
      emptyData={
        <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
          No radar data
        </div>
      }
      isEmpty={data.length < 3 || values.length < 3}
      minHeight={minHeight}
    >
      {({ height, series, width }) => {
        const legendOffset = legend ? 42 : 0
        const innerWidth = Math.max(
          0,
          width - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right
        )
        const innerHeight = Math.max(
          0,
          height - legendOffset - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom
        )
        const radius = Math.max(0, Math.min(innerWidth, innerHeight) / 2)
        const maxValue = values.length > 0 ? Math.max(...values) : 1
        const radiusScale = scaleLinear({
          clamp: true,
          domain: valueDomain
            ? [valueDomain[0], valueDomain[1]]
            : [0, maxValue > 0 ? maxValue : 1],
          range: [0, radius],
        })
        const points = createRadarPoints({
          angleKey,
          angleLabelFormatter,
          data,
          radiusScale,
          valueKey,
        })
        const material = materials.getMaterial(seriesKey)
        const seriesLabel = series[0]?.label ?? seriesKey
        const polygonPath = createClosedPath(points)
        const gridLevelCount = Math.max(1, Math.floor(levels))
        const gridPaths = Array.from({ length: gridLevelCount }, (_, index) => {
          const levelRadius = ((index + 1) * radius) / gridLevelCount
          const levelPoints = points.map((point) =>
            getPolarPoint({
              angle: point.angle,
              radius: levelRadius,
            })
          )

          return createClosedPath(levelPoints)
        })
        const centerX = width / 2
        const centerY = DEFAULT_MARGIN.top + innerHeight / 2

        return (
          <ChartInteractionRoot
            onPointerLeave={hideTooltip}
            onPointerMove={followTooltip}
          >
            <ChartSvg aria-label="radar chart" role="img">
              {materials.defs}
              <g transform={`translate(${centerX}, ${centerY})`}>
                {gridPaths.map((path, index) => (
                  <path
                    className="stroke-border"
                    d={path}
                    fill="none"
                    key={`grid-${index}`}
                    strokeDasharray="3 3"
                    strokeOpacity={0.62}
                  />
                ))}
                {points.map((point) => (
                  <path
                    className="stroke-border"
                    d={createOpenPath([
                      { x: 0, y: 0 },
                      getPolarPoint({
                        angle: point.angle,
                        radius,
                      }),
                    ])}
                    fill="none"
                    key={`axis-${point.key}`}
                    strokeOpacity={0.62}
                  />
                ))}
                <ChartMotionGroup>
                  <ChartRenderedPath
                    color={material.color}
                    d={polygonPath}
                    fill={material.color}
                    opacity={resolvedRenderer === "svg" ? 0.2 : undefined}
                    renderer={material.renderer}
                    rough={{
                      ...material.rough,
                      fill: material.color,
                      fillStyle: material.rough?.fillStyle ?? "hachure",
                      hachureGap: material.rough?.hachureGap ?? 5,
                      stroke: material.color,
                      strokeWidth: material.rough?.strokeWidth ?? 1.5,
                    }}
                    stroke={resolvedRenderer === "svg" ? false : material.color}
                    strokeOpacity={0.9}
                    strokeWidth={1.5}
                    textureIndex={material.textureIndex}
                    textureKey={material.textureKey}
                    texture={material.texture}
                    textureScopeId={material.textureScopeId}
                  />
                  {resolvedRenderer === "svg" ? (
                    <path
                      d={polygonPath}
                      fill="none"
                      stroke={material.color}
                      strokeOpacity={0.9}
                      strokeWidth={1.5}
                    />
                  ) : null}
                </ChartMotionGroup>
                {points.map((point, index) => {
                  const key = getMarkKey("point", point.key, index)
                  const markMotion = getMarkMotion({ key })

                  return (
                    <g key={key}>
                      <ChartMotionGroup {...markMotion}>
                        <ChartRenderedCircle
                          color={material.color}
                          cx={point.x}
                          cy={point.y}
                          r={4}
                          renderer={material.renderer}
                          rough={{
                            ...material.rough,
                            fill: material.color,
                            stroke: material.color,
                          }}
                          stroke={material.color}
                          strokeWidth={1}
                          textureIndex={material.textureIndex}
                          textureKey={material.textureKey}
                          texture={material.texture}
                          textureScopeId={material.textureScopeId}
                        />
                      </ChartMotionGroup>
                      <ChartHitCircle
                        ariaLabel={`${point.rawLabel}: ${valueFormatter(point.value)}`}
                        className="outline-none focus-visible:stroke-foreground focus-visible:stroke-2"
                        cx={point.x}
                        cy={point.y}
                        onPointerEnter={(event) => {
                          showMark({
                            data: { point },
                            event,
                            key,
                            type: "point",
                          })
                        }}
                        onPointerLeave={hideTooltip}
                        onPointerMove={followTooltip}
                        r={14}
                        tabIndex={0}
                      />
                    </g>
                  )
                })}
                <RadarAxisLabels points={points} radius={radius} />
              </g>
            </ChartSvg>

            <ChartTooltip
              visible={tooltipOpen}
              x={tooltipLeft ?? 0}
              y={tooltipTop ?? 0}
            >
              {tooltip ? (
                renderTooltip ? (
                  <ChartTooltipPanel>
                    {renderTooltip({
                      datum: tooltip.point.datum,
                      label: tooltip.point.label,
                      seriesKey,
                      seriesLabel,
                      value: tooltip.point.value,
                    })}
                  </ChartTooltipPanel>
                ) : (
                  <ChartTooltipContent
                    items={
                      tooltipFields
                        ? resolveChartTooltipItems({
                            color: material.color,
                            datum: tooltip.point.datum,
                            fields: tooltipFields,
                          })
                        : [
                            {
                              color: material.color,
                              key: seriesKey,
                              label: seriesLabel,
                              value: valueFormatter(tooltip.point.value),
                            },
                          ]
                    }
                    label={
                      tooltipLabel
                        ? getValue(tooltip.point.datum, tooltipLabel)
                        : tooltip.point.label
                    }
                  />
                )
              ) : null}
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
