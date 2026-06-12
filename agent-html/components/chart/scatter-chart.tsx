import {
  Axis,
  DataContext,
  GlyphSeries,
  Grid,
  XYChart,
} from "@visx/xychart"
import * as React from "react"

import {
  type ChartAccessor,
  type ChartConfig,
  type ChartHoverState,
  ChartContainer,
  ChartHitCircle,
  ChartInteractionRoot,
  ChartMotionCircle,
  ChartTooltip,
  type ChartTooltipField,
  ChartTooltipContent,
  chartMotion,
  chartXYTheme,
  getChartCssVariable,
  getChartMarkKey,
  getChartMarkOpacity,
  getChartMarkPresence,
  getNumberDomain,
  getValue,
  isFiniteNumber,
  resolveChartTooltipItems,
  type SvgOnlyChartRenderer,
  useChartMarkTooltip,
} from "../ui/chart"

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
  config: ChartConfig
  data: readonly T[]
  getPointColor?: (datum: T) => string | null | undefined
  minHeight?: number
  radiusKey?: ChartAccessor<T, number>
  referenceY?: number
  renderer?: SvgOnlyChartRenderer
  renderTooltip?: (
    datum: T,
    context: ScatterTooltipContext
  ) => React.ReactNode
  tooltipFields?: readonly ChartTooltipField<T>[]
  tooltipLabel?: ChartAccessor<T, React.ReactNode>
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
  setHover,
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
  setHover: React.Dispatch<
    React.SetStateAction<ChartHoverState<"point"> | null>
  >
  showMark: (
    event: React.MouseEvent<Element> | React.PointerEvent<Element>,
    data: TooltipState<T>
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
              setHover({ key: point.key, type: "point" })
              showMark(event, {
                color: point.color,
                datum: point.datum,
                xValue: point.xValue,
                yValue: point.yValue,
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
  config,
  data,
  getPointColor,
  minHeight = 320,
  radiusKey,
  referenceY,
  renderTooltip,
  tooltipFields,
  tooltipLabel,
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
    hideMark,
    hover,
    moveMark,
    setHover,
    showMark,
    tooltipLeft,
    tooltipOpen,
    tooltipTop,
  } = useChartMarkTooltip<TooltipState<T>, "point">()

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={className}
      config={config}
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
        const fallbackColor = getChartCssVariable(seriesKey)
        const getColor = (datum: T) => getPointColor?.(datum) ?? fallbackColor
        const points = chartData.map<ScatterPoint<T>>((datum, index) => {
          const xValue = getValue(datum, xKey)
          const yValue = getValue(datum, yKey)

          return {
            color: getColor(datum),
            datum,
            key: getChartMarkKey("point", seriesKey, index),
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

              <GlyphSeries
                colorAccessor={(point) => point.color}
                data={points}
                dataKey={seriesKey}
                enableEvents={false}
                renderGlyph={({ color, datum: point, key, x, y }) => {
                  const presence = getChartMarkPresence({
                    hover,
                    key: point.key,
                  })
                  const opacity = getChartMarkOpacity({
                    baseOpacity: 0.82,
                    presence,
                  })
                  const isActive = presence === "highlighted"

                  return (
                    <ChartMotionCircle
                      animate={{
                        opacity,
                        r: isActive ? point.radius + 1.5 : point.radius,
                        strokeOpacity: isActive ? 1 : 0.8,
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
                }}
                xAccessor={xAccessor}
                yAccessor={yAccessor}
              />
              <ScatterHitLayer
                hideMark={hideMark}
                moveMark={moveMark}
                points={points}
                setHover={setHover}
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
