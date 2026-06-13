import {
  Axis,
  DataContext,
  GlyphSeries,
  Grid,
  XYChart,
} from "@visx/xychart"
import * as React from "react"

import {
  type ChartTextureOptions,
  ChartRenderedCircle,
} from "./runtime"
import {
  type ChartAccessor,
  type ChartConfig,
  type ChartRoughOptions,
  ChartContainer,
  ChartHitCircle,
  ChartInteractionRoot,
  ChartMotionCircle,
  ChartMotionGroup,
  ChartTooltip,
  type ChartTooltipField,
  ChartTooltipContent,
  chartMotion,
  chartXYTheme,
  getNumberDomain,
  getChartRangeBucketKey,
  getChartRangeBucketKeys,
  getValue,
  isFiniteNumber,
  resolveChartTooltipItems,
  type ChartRenderer,
  resolveChartRenderer,
  useChartMarkInteraction,
  useChartMaterialRegistry,
} from "./runtime"

export type ScatterScaleType = "linear" | "log"

export interface ScatterTooltipContext {
  color: string
  seriesKey: string
  seriesLabel: React.ReactNode
  xValue: number
  yValue: number
}

export interface ScatterChartProps<T> {
  aspectRatio?: string
  className?: string
  colorKey?: ChartAccessor<T, string>
  config?: ChartConfig
  data: readonly T[]
  minHeight?: number
  radiusKey?: ChartAccessor<T, number>
  referenceY?: number
  renderer?: ChartRenderer
  renderTooltip?: (
    datum: T,
    context: ScatterTooltipContext
  ) => React.ReactNode
  rough?: ChartRoughOptions
  tooltipFields?: readonly ChartTooltipField<T>[]
  tooltipLabel?: ChartAccessor<T, React.ReactNode>
  texture?: ChartTextureOptions
  xAxisLabel?: React.ReactNode
  xDomain?: readonly [number, number]
  xKey: ChartAccessor<T, number>
  xScaleType?: ScatterScaleType
  xTicks?: readonly number[]
  xValueFormatter?: (value: number) => React.ReactNode
  yAxisLabel?: React.ReactNode
  yDomain?: readonly [number, number]
  yKey: ChartAccessor<T, number>
  yScaleType?: ScatterScaleType
  yTicks?: readonly number[]
  yValueFormatter?: (value: number) => React.ReactNode
}

interface TooltipState<T> {
  color: string
  datum: T
  xValue: number
  yValue: number
}

interface ScatterPoint<T> {
  color: string
  colorKey: string
  datum: T
  key: string
  radius: number
  xValue: number
  yValue: number
}

const DEFAULT_MARGIN = {
  bottom: 44,
  left: 54,
  right: 18,
  top: 18,
}

const valueFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
})

function formatValue(value: number) {
  return valueFormatter.format(value)
}

function isValidScaleValue(value: number, scaleType: ScatterScaleType) {
  return scaleType === "log" ? value > 0 : true
}

function getScaleDomain({
  domain,
  scaleType,
  values,
}: {
  domain?: readonly [number, number]
  scaleType: ScatterScaleType
  values: number[]
}): [number, number] {
  if (domain) {
    return [domain[0], domain[1]]
  }

  if (scaleType === "linear") {
    return getNumberDomain(values) as [number, number]
  }

  const positiveValues = values.filter((value) => value > 0)

  if (positiveValues.length === 0) {
    return [1, 10]
  }

  const min = Math.min(...positiveValues)
  const max = Math.max(...positiveValues)

  if (min === max) {
    return [Math.max(min / 2, Number.MIN_VALUE), max * 2]
  }

  return [min, max]
}

function createNumericScaleConfig({
  domain,
  scaleType,
}: {
  domain: [number, number]
  scaleType: ScatterScaleType
}) {
  if (scaleType === "log") {
    return {
      clamp: true,
      domain,
      nice: false,
      type: "log" as const,
    }
  }

  return {
    clamp: true,
    domain,
    nice: true,
    type: "linear" as const,
    zero: false,
  }
}

function getPointRadius<T>({
  datum,
  radiusKey,
}: {
  datum: T
  radiusKey?: ChartAccessor<T, number>
}) {
  if (!radiusKey) {
    return 5
  }

  const value = getValue(datum, radiusKey)

  if (!isFiniteNumber(value)) {
    return 5
  }

  return Math.max(5, Math.min(18, 4 + value * 0.55))
}

function ScatterReferenceLine({ yValue }: { yValue: number }) {
  const { margin, width, yScale } = React.useContext(DataContext)
  const y = yScale ? Number(yScale(yValue)) : NaN

  if (!margin || !width || !isFiniteNumber(y)) {
    return null
  }

  return (
    <line
      className="stroke-destructive"
      strokeDasharray="4 4"
      x1={margin.left}
      x2={width - margin.right}
      y1={y}
      y2={y}
    />
  )
}

function ScatterAxisLabels({
  xAxisLabel,
  yAxisLabel,
}: {
  xAxisLabel?: React.ReactNode
  yAxisLabel?: React.ReactNode
}) {
  const { height, margin, width } = React.useContext(DataContext)

  if (!margin || !isFiniteNumber(width) || !isFiniteNumber(height)) {
    return null
  }

  return (
    <>
      {xAxisLabel ? (
        <text
          className="fill-muted-foreground text-[0.75rem]"
          textAnchor="middle"
          x={(margin.left + width - margin.right) / 2}
          y={height - 7}
        >
          {xAxisLabel}
        </text>
      ) : null}
      {yAxisLabel ? (
        <text
          className="fill-muted-foreground text-[0.75rem]"
          textAnchor="middle"
          transform={`rotate(-90 16 ${height / 2})`}
          x={16}
          y={height / 2}
        >
          {yAxisLabel}
        </text>
      ) : null}
    </>
  )
}

function ScatterHitLayer<T extends object>({
  showMark,
  hideMark,
  moveMark,
  points,
}: {
  hideMark: () => void
  moveMark: (
    event: React.MouseEvent<Element> | React.PointerEvent<Element>
  ) => void
  points: Array<ScatterPoint<T>>
  showMark: (
    options: {
      data: TooltipState<T>
      event: React.MouseEvent<Element> | React.PointerEvent<Element>
      key: string
      type: "point"
    }
  ) => void
}) {
  const { xScale, yScale } = React.useContext(DataContext)

  if (!xScale || !yScale) {
    return null
  }

  return (
    <>
      {points.map((point) => {
        const cx = Number(xScale(point.xValue))
        const cy = Number(yScale(point.yValue))

        if (!isFiniteNumber(cx) || !isFiniteNumber(cy)) {
          return null
        }

        return (
          <ChartHitCircle
            cx={cx}
            cy={cy}
            key={point.key}
            onPointerEnter={(event) => {
              showMark({
                data: {
                  color: point.color,
                  datum: point.datum,
                  xValue: point.xValue,
                  yValue: point.yValue,
                },
                event,
                key: point.key,
                type: "point",
              })
            }}
            onPointerLeave={hideMark}
            onPointerMove={moveMark}
            r={Math.max(point.radius + 5, 14)}
          />
        )
      })}
    </>
  )
}

export function ScatterChart<T extends object>({
  aspectRatio = "9 / 4",
  className,
  colorKey,
  config,
  data,
  minHeight = 320,
  radiusKey,
  referenceY,
  renderer,
  renderTooltip,
  rough,
  tooltipFields,
  tooltipLabel,
  texture,
  xAxisLabel,
  xDomain,
  xKey,
  xScaleType = "linear",
  xTicks,
  xValueFormatter = formatValue,
  yAxisLabel,
  yDomain,
  yKey,
  yScaleType = "linear",
  yTicks,
  yValueFormatter = formatValue,
}: ScatterChartProps<T>) {
  const {
    currentTooltipData: tooltip,
    getMarkKey,
    getMarkState,
    hideMark,
    moveMark,
    showMark,
    tooltipLeft,
    tooltipOpen,
    tooltipTop,
  } = useChartMarkInteraction<TooltipState<T>, "point">()
  const resolvedRenderer = resolveChartRenderer(renderer, [
    "svg",
    "rough",
    "texture",
  ])
  const defaultSeriesKey = React.useMemo(
    () => Object.keys(config ?? {})[0] ?? "value",
    [config]
  )
  const yColorValues = React.useMemo(
    () =>
      data
        .map((datum) => getValue(datum, yKey))
        .filter(
          (value) =>
            isFiniteNumber(value) && isValidScaleValue(value, yScaleType)
        ),
    [data, yKey, yScaleType]
  )
  const colorKeys = React.useMemo(() => {
    if (colorKey) {
      return data.map((datum) => getValue(datum, colorKey))
    }

    return getChartRangeBucketKeys({
      fallbackKey: defaultSeriesKey,
      reference: referenceY,
      values: yColorValues,
    })
  }, [colorKey, data, defaultSeriesKey, referenceY, yColorValues])
  const materials = useChartMaterialRegistry({
    config,
    keys: colorKeys,
    renderer: resolvedRenderer,
    rough,
    scope: "scatter",
    strategy: colorKeys.length > 1 || colorKey ? "categorical" : "single",
    texture,
  })

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={className}
      config={materials.resolvedConfig}
      emptyData={
        <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
          No scatter data
        </div>
      }
      isEmpty={data.length === 0}
      minHeight={minHeight}
    >
      {({ height, series, width }) => {
        const chartData = data.filter((datum) => {
          const xValue = getValue(datum, xKey)
          const yValue = getValue(datum, yKey)

          return (
            isFiniteNumber(xValue) &&
            isFiniteNumber(yValue) &&
            isValidScaleValue(xValue, xScaleType) &&
            isValidScaleValue(yValue, yScaleType)
          )
        })
        const primarySeries = series[0]
        const seriesKey = primarySeries?.key ?? "value"
        const seriesLabel = primarySeries?.label ?? seriesKey
        const getColorKey = (datum: T) =>
          colorKey
            ? getValue(datum, colorKey)
            : getChartRangeBucketKey({
                fallbackKey: seriesKey,
                reference: referenceY,
                value: getValue(datum, yKey),
                values: yColorValues,
              })
        const points = chartData.map<ScatterPoint<T>>((datum, index) => {
          const xValue = getValue(datum, xKey)
          const yValue = getValue(datum, yKey)
          const colorKey = getColorKey(datum)
          const material = materials.getMaterial(colorKey)

          return {
            color: material.color,
            colorKey,
            datum,
            key: getMarkKey("point", seriesKey, index),
            radius: getPointRadius({ datum, radiusKey }),
            xValue,
            yValue,
          }
        })
        const xValues = points.map((point) => point.xValue)
        const yValues = points.map((point) => point.yValue)
        const xAccessor = (point: ScatterPoint<T>) => point.xValue
        const yAccessor = (point: ScatterPoint<T>) => point.yValue

        return (
          <ChartInteractionRoot onPointerLeave={hideMark}>
            <XYChart
              accessibilityLabel="散点图"
              captureEvents={false}
              height={height}
              margin={DEFAULT_MARGIN}
              theme={chartXYTheme}
              width={width}
              xScale={createNumericScaleConfig({
                domain: getScaleDomain({
                  domain: xDomain,
                  scaleType: xScaleType,
                  values: xValues,
                }),
                scaleType: xScaleType,
              })}
              yScale={createNumericScaleConfig({
                domain: getScaleDomain({
                  domain: yDomain,
                  scaleType: yScaleType,
                  values: yValues,
                }),
                scaleType: yScaleType,
              })}
            >
              <Grid
                columns
                lineStyle={{ strokeOpacity: 0.55 }}
                numTicks={4}
                rows
                stroke="var(--border)"
                strokeDasharray="3 3"
              />
              <Axis
                hideAxisLine
                hideTicks
                numTicks={4}
                orientation="left"
                tickFormat={(value) => String(yValueFormatter(Number(value)))}
                tickValues={yTicks ? [...yTicks] : undefined}
              />
              <Axis
                hideAxisLine
                hideTicks
                numTicks={4}
                orientation="bottom"
                tickFormat={(value) => String(xValueFormatter(Number(value)))}
                tickValues={xTicks ? [...xTicks] : undefined}
              />

              {isFiniteNumber(referenceY) &&
              isValidScaleValue(referenceY, yScaleType) ? (
                <ScatterReferenceLine yValue={referenceY} />
              ) : null}
              {materials.defs}

              <GlyphSeries
                colorAccessor={(point) => point.color}
                data={points}
                dataKey={seriesKey}
                enableEvents={false}
                renderGlyph={({ color, datum: point, key, x, y }) => {
                  const markState = getMarkState({
                    baseOpacity: 0.82,
                    key: point.key,
                  })
                  const material = materials.getMaterial(point.colorKey)
                  return (
                    resolvedRenderer === "rough" || resolvedRenderer === "texture" ? (
                      <ChartMotionGroup
                        animate={{
                          opacity: markState.opacity,
                        }}
                        initial={false}
                        key={key}
                        pointerEvents="none"
                        transition={chartMotion.hover}
                        transform={`translate(${x}, ${y})`}
                      >
                        <ChartRenderedCircle
                          color={material.color}
                          cx={0}
                          cy={0}
                          renderer={material.renderer}
                          rough={material.rough}
                          r={markState.isHighlighted
                            ? point.radius + 1.5
                            : point.radius}
                          stroke={material.color}
                          strokeOpacity={markState.isHighlighted ? 1 : 0.8}
                          strokeWidth={1}
                          textureIndex={material.textureIndex}
                          textureKey={material.textureKey}
                          texture={material.texture}
                          textureScopeId={material.textureScopeId}
                        />
                      </ChartMotionGroup>
                    ) : (
                      <ChartMotionCircle
                      animate={{
                        opacity: markState.opacity,
                        r: markState.isHighlighted
                          ? point.radius + 1.5
                          : point.radius,
                        strokeOpacity: markState.isHighlighted ? 1 : 0.8,
                      }}
                      className="stroke-foreground"
                      cx={x}
                      cy={y}
                      fill={color}
                      initial={false}
                      key={key}
                      pointerEvents="none"
                      transition={chartMotion.hover}
                    />
                    )
                  )
                }}
                xAccessor={xAccessor}
                yAccessor={yAccessor}
              />
              <ScatterHitLayer
                hideMark={hideMark}
                moveMark={moveMark}
                points={points}
                showMark={showMark}
              />

              <ScatterAxisLabels
                xAxisLabel={xAxisLabel}
                yAxisLabel={yAxisLabel}
              />
            </XYChart>

            <ChartTooltip
              visible={tooltipOpen}
              x={tooltipLeft ?? 0}
              y={tooltipTop ?? 0}
            >
              {tooltip ? (
                renderTooltip ? (
                  renderTooltip(tooltip.datum, {
                    color: tooltip.color,
                    seriesKey,
                    seriesLabel,
                    xValue: tooltip.xValue,
                    yValue: tooltip.yValue,
                  })
                ) : (
                  <ChartTooltipContent
                    items={
                      tooltipFields
                        ? resolveChartTooltipItems({
                            color: tooltip.color,
                            datum: tooltip.datum,
                            fields: tooltipFields,
                          })
                        : [
                            {
                              color: tooltip.color,
                              key: `${seriesKey}-x`,
                              label: xAxisLabel ?? "x",
                              value: xValueFormatter(tooltip.xValue),
                            },
                            {
                              color: tooltip.color,
                              key: `${seriesKey}-y`,
                              label: yAxisLabel ?? seriesLabel,
                              value: yValueFormatter(tooltip.yValue),
                            },
                          ]
                    }
                    label={
                      tooltipLabel
                        ? getValue(tooltip.datum, tooltipLabel)
                        : seriesLabel
                    }
                  />
                )
              ) : null}
            </ChartTooltip>
          </ChartInteractionRoot>
        )
      }}
    </ChartContainer>
  )
}
