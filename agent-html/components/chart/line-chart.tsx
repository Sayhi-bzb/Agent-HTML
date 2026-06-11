import { scalePoint } from "@visx/scale"
import { LinePath } from "@visx/shape"
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
  createLinearScale,
  createCartesianLayout,
  getChartCssVariable,
  getFiniteValues,
  getNearestDatum,
  getPointerPoint,
  getValue,
  isFiniteNumber,
} from "./chart"

export interface LineChartProps<T> {
  aspectRatio?: string
  className?: string
  config: ChartConfig
  data: T[]
  minHeight?: number
  referenceY?: number
  xKey: ChartAccessor<T, string>
  xLabelFormatter?: (value: string) => React.ReactNode
  yKey: ChartAccessor<T, number>
  yValueFormatter?: (value: number) => React.ReactNode
}

interface TooltipState<T> {
  datum: T
  x: number
  y: number
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

export function LineChart<T>({
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
}: LineChartProps<T>) {
  const [tooltip, setTooltip] = React.useState<TooltipState<T> | null>(null)

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={className}
      config={config}
      emptyData={
        <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
          No trend data
        </div>
      }
      isEmpty={data.length === 0}
      minHeight={minHeight}
    >
      {({ height, series, width }) => {
        const layout = createCartesianLayout({
          height,
          margin: DEFAULT_MARGIN,
          width,
        })
        const values = getFiniteValues(data, yKey)
        const xScale = scalePoint<string>({
          domain: data.map((datum) => getValue(datum, xKey)),
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
          const datum = getNearestDatum({ data, pointerX, x })

          if (!datum) {
            return
          }

          setTooltip({
            datum,
            x: layout.margin.left + x(datum) + 12,
            y: layout.margin.top + y(datum) - 12,
          })
        }

        return (
          <>
            <ChartSvg
              aria-label="趋势折线图"
              onPointerLeave={() => setTooltip(null)}
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
                  data={data}
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

                <LinePath
                  data={data}
                  defined={(datum) => isFiniteNumber(getValue(datum, yKey))}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
                  x={x}
                  y={y}
                />

                {data.map((datum) => {
                  const value = getValue(datum, yKey)

                  if (!isFiniteNumber(value)) {
                    return null
                  }

                  return (
                    <circle
                      className="fill-background"
                      cx={x(datum)}
                      cy={y(datum)}
                      key={`${getValue(datum, xKey)}-${value}`}
                      r={3.5}
                      stroke={color}
                      strokeWidth={2}
                    />
                  )
                })}
              </ChartCartesianGroup>
            </ChartSvg>

            <ChartTooltip
              visible={tooltip !== null}
              x={tooltip?.x ?? 0}
              y={tooltip?.y ?? 0}
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
