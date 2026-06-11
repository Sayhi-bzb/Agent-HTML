import { localPoint } from "@visx/event"
import { Group } from "@visx/group"
import { scalePoint } from "@visx/scale"
import * as React from "react"

import {
  type ChartAccessor,
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  createLinearScale,
  createCartesianLayout,
  getChartCssVariable,
  getFiniteValues,
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

function getNearestDatum<T>({
  data,
  pointerX,
  x,
}: {
  data: T[]
  pointerX: number
  x: (datum: T) => number
}) {
  let nearestDatum: T | null = null
  let nearestDistance = Number.POSITIVE_INFINITY

  for (const datum of data) {
    const distance = Math.abs(x(datum) - pointerX)

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestDatum = datum
    }
  }

  return nearestDatum
}

function createLinePath<T>({
  data,
  x,
  y,
}: {
  data: T[]
  x: (datum: T) => number
  y: (datum: T) => number
}) {
  return data
    .map((datum, index) => {
      const command = index === 0 ? "M" : "L"
      return `${command}${x(datum)},${y(datum)}`
    })
    .join(" ")
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
      empty={
        <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
          暂无趋势数据
        </div>
      }
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
        const yTicks = yScale.ticks(4)
        const x = (datum: T) => xScale(getValue(datum, xKey)) ?? 0
        const y = (datum: T) => {
          const value = getValue(datum, yKey)
          return isFiniteNumber(value) ? yScale(value) : 0
        }
        const handlePointerMove = (
          event: React.PointerEvent<SVGSVGElement>
        ) => {
          const point = localPoint(event)

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
            <svg
              aria-label="趋势折线图"
              className="h-full w-full overflow-visible"
              onPointerLeave={() => setTooltip(null)}
              onPointerMove={handlePointerMove}
              role="img"
            >
              <Group left={layout.margin.left} top={layout.margin.top}>
                {yTicks.map((tick) => {
                  const tickY = yScale(tick)

                  return (
                    <g key={tick}>
                      <line
                        className="stroke-border/50"
                        strokeDasharray="3 3"
                        x1={0}
                        x2={layout.innerWidth}
                        y1={tickY}
                        y2={tickY}
                      />
                      <text
                        className="fill-muted-foreground text-[0.68rem]"
                        dy="0.32em"
                        textAnchor="end"
                        x={-8}
                        y={tickY}
                      >
                        {yValueFormatter(tick)}
                      </text>
                    </g>
                  )
                })}

                {data.map((datum) => {
                  const value = getValue(datum, xKey)
                  const tickX = x(datum)

                  return (
                    <text
                      className="fill-muted-foreground text-[0.68rem]"
                      key={value}
                      textAnchor="middle"
                      x={tickX}
                      y={layout.innerHeight + 20}
                    >
                      {xLabelFormatter ? xLabelFormatter(value) : value}
                    </text>
                  )
                })}

                {isFiniteNumber(referenceY) ? (
                  <line
                    className="stroke-border"
                    strokeDasharray="3 3"
                    x1={0}
                    x2={layout.innerWidth}
                    y1={yScale(referenceY)}
                    y2={yScale(referenceY)}
                  />
                ) : null}

                <path
                  d={createLinePath({
                    data: data.filter((datum) =>
                      isFiniteNumber(getValue(datum, yKey))
                    ),
                    x,
                    y,
                  })}
                  fill="none"
                  stroke={color}
                  strokeWidth={2}
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
              </Group>
            </svg>

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
