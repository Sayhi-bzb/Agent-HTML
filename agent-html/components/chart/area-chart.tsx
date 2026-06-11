import { scalePoint } from "@visx/scale"
import { AreaClosed, LinePath } from "@visx/shape"
import * as React from "react"

import {
  type ChartAccessor,
  type ChartConfig,
  ChartCartesianGroup,
  ChartContainer,
  ChartReferenceLine,
  ChartSvg,
  ChartTooltip,
  ChartTooltipContent,
  ChartXAxisLabels,
  ChartYAxisGrid,
  createCartesianLayout,
  createLinearScale,
  getChartCssVariable,
  getFiniteValues,
  getNearestDatum,
  getPointerPoint,
  getValue,
  isFiniteNumber,
  type SvgOnlyChartRenderer,
  useChartPointerTooltip,
} from "./chart"

export interface AreaChartProps<T> {
  aspectRatio?: string
  className?: string
  config: ChartConfig
  data: readonly T[]
  minHeight?: number
  referenceY?: number
  renderer?: SvgOnlyChartRenderer
  xKey: ChartAccessor<T, string>
  xLabelFormatter?: (value: string) => React.ReactNode
  yKey: ChartAccessor<T, number>
  yValueFormatter?: (value: number) => React.ReactNode
}

interface TooltipState<T> {
  datum: T
}

const DEFAULT_MARGIN = {
  bottom: 28,
  left: 38,
  right: 16,
  top: 16,
}

const valueFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
})

function formatValue(value: number) {
  return valueFormatter.format(value)
}

export function AreaChart<T>({
  aspectRatio = "9 / 4",
  className,
  config,
  data,
  minHeight = 320,
  referenceY,
  xKey,
  xLabelFormatter,
  yKey,
  yValueFormatter = formatValue,
}: AreaChartProps<T>) {
  const [tooltip, setTooltip] = React.useState<TooltipState<T> | null>(null)
  const {
    clearPoint: clearTooltipPoint,
    point: tooltipPoint,
    setPointFromEvent: setTooltipPointFromEvent,
  } = useChartPointerTooltip()

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={className}
      config={config}
      emptyData={
        <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
          No area data
        </div>
      }
      isEmpty={data.length === 0}
      minHeight={minHeight}
    >
      {({ height, series, width }) => {
        const chartData = Array.from(data)
        const layout = createCartesianLayout({
          height,
          margin: DEFAULT_MARGIN,
          width,
        })
        const values = getFiniteValues(chartData, yKey)
        const xScale = scalePoint<string>({
          domain: chartData.map((datum) => getValue(datum, xKey)),
          padding: 0.5,
          range: [0, layout.innerWidth],
        })
        const yScale = createLinearScale({
          range: [layout.innerHeight, 0],
          values,
        })
        const primarySeries = series[0]
        const seriesKey = primarySeries?.key ?? "value"
        const seriesLabel = primarySeries?.label ?? seriesKey
        const color = getChartCssVariable(seriesKey)
        const x = (datum: T) => xScale(getValue(datum, xKey)) ?? 0
        const y = (datum: T) => {
          const value = getValue(datum, yKey)
          return isFiniteNumber(value) ? yScale(value) : 0
        }
        const handlePointerMove = (
          event: React.PointerEvent<SVGSVGElement>
        ) => {
          const point = getPointerPoint(event)

          if (!point) {
            return
          }

          const pointerX = point.x - layout.margin.left
          const datum = getNearestDatum({ data: chartData, pointerX, x })

          if (!datum) {
            return
          }

          setTooltip({
            datum,
          })
          setTooltipPointFromEvent(event)
        }

        return (
          <>
            <ChartSvg
              aria-label="面积趋势图"
              onPointerLeave={() => {
                setTooltip(null)
                clearTooltipPoint()
              }}
              onPointerMove={handlePointerMove}
              role="img"
            >
              <ChartCartesianGroup layout={layout}>
                <ChartYAxisGrid
                  formatTick={yValueFormatter}
                  innerWidth={layout.innerWidth}
                  scale={yScale}
                />
                <ChartXAxisLabels
                  data={chartData}
                  formatTick={xLabelFormatter}
                  innerHeight={layout.innerHeight}
                  x={x}
                  xKey={xKey}
                />

                {isFiniteNumber(referenceY) ? (
                  <ChartReferenceLine
                    innerWidth={layout.innerWidth}
                    y={yScale(referenceY)}
                  />
                ) : null}

                <AreaClosed
                  data={chartData}
                  defined={(datum) => isFiniteNumber(getValue(datum, yKey))}
                  fill={color}
                  fillOpacity={0.16}
                  stroke="transparent"
                  x={x}
                  y={y}
                  yScale={yScale}
                />
                <LinePath
                  data={chartData}
                  defined={(datum) => isFiniteNumber(getValue(datum, yKey))}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  x={x}
                  y={y}
                />
              </ChartCartesianGroup>
            </ChartSvg>

            <ChartTooltip
              bounds={{ height, width }}
              visible={tooltip !== null && tooltipPoint !== null}
              x={tooltipPoint?.x ?? 0}
              y={tooltipPoint?.y ?? 0}
            >
              {tooltip ? (
                <ChartTooltipContent
                  items={[
                    {
                      color,
                      key: seriesKey,
                      label: seriesLabel,
                      value: yValueFormatter(getValue(tooltip.datum, yKey)),
                    },
                  ]}
                  label={
                    xLabelFormatter
                      ? xLabelFormatter(getValue(tooltip.datum, xKey))
                      : getValue(tooltip.datum, xKey)
                  }
                />
              ) : null}
            </ChartTooltip>
          </>
        )
      }}
    </ChartContainer>
  )
}
