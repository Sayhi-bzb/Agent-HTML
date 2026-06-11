import { Bar } from "@visx/shape"
import * as React from "react"
import type { Options as RoughOptions } from "roughjs/bin/core"

import {
  type ChartAccessor,
  type ChartConfig,
  type ChartHoverState,
  ChartCartesianGroup,
  ChartContainer,
  ChartHitRect,
  ChartLegend,
  type ChartRenderer,
  ChartSvg,
  ChartTooltip,
  ChartTooltipContent,
  ChartXAxisLabels,
  ChartYAxisGrid,
  createBandScale,
  createCartesianLayout,
  createLinearScale,
  createRoughOptionsByKey,
  chartHoverTransition,
  getChartHoverOpacity,
  getChartHoverPresence,
  getChartCssVariable,
  getFiniteValues,
  getValue,
  isFiniteNumber,
} from "./chart"
import { RoughRect } from "./rough-renderers"

export interface BarChartProps<T> {
  aspectRatio?: string
  className?: string
  config: ChartConfig
  data: readonly T[]
  legend?: boolean
  minHeight?: number
  renderer?: ChartRenderer
  roughOptions?: RoughOptions
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
  bottom: 42,
  left: 42,
  right: 16,
  top: 16,
}

const valueFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
})

function formatValue(value: number) {
  return valueFormatter.format(value)
}

export function BarChart<T>({
  aspectRatio = "9 / 4",
  className,
  config,
  data,
  legend = false,
  minHeight = 320,
  renderer = "svg",
  roughOptions,
  xKey,
  xLabelFormatter,
  yKey,
  yValueFormatter = formatValue,
}: BarChartProps<T>) {
  const [tooltip, setTooltip] = React.useState<TooltipState<T> | null>(null)
  const [hover, setHover] = React.useState<ChartHoverState<"bar"> | null>(null)
  const seriesKey = React.useMemo(() => Object.keys(config)[0] ?? "value", [config])
  const roughOptionsByKey = React.useMemo(
    () =>
      createRoughOptionsByKey({
        getColorKey: () => seriesKey,
        getKey: (datum: T) => getValue(datum, xKey),
        options: roughOptions,
        rows: data,
      }) as Map<string, RoughOptions>,
    [data, roughOptions, seriesKey, xKey]
  )

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={className}
      config={config}
      emptyData={
        <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
          No bar data
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
        const xScale = createBandScale({
          data: Array.from(data),
          padding: 0.28,
          range: [0, layout.innerWidth],
          x: xKey,
        })
        const yScale = createLinearScale({
          range: [layout.innerHeight, 0],
          values: getFiniteValues(Array.from(data), yKey),
        })
        const seriesLabel = config[seriesKey]?.label ?? series[0]?.label ?? seriesKey
        const color = getChartCssVariable(seriesKey)
        const x = (datum: T) => xScale(getValue(datum, xKey)) ?? 0

        return (
          <div className="relative h-full w-full">
            <ChartSvg
              aria-label="柱形图"
              onPointerLeave={() => {
                setHover(null)
                setTooltip(null)
              }}
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
                  x={(datum) => x(datum) + xScale.bandwidth() / 2}
                  xKey={xKey}
                />

                {data.map((datum) => {
                  const category = getValue(datum, xKey)
                  const value = getValue(datum, yKey)

                  if (!isFiniteNumber(value)) {
                    return null
                  }

                  const barX = x(datum)
                  const barY = yScale(value)
                  const barHeight = layout.innerHeight - barY
                  const barWidth = xScale.bandwidth()
                  const presence = getChartHoverPresence({
                    hover,
                    isRelated: hover?.key === category,
                  })
                  const opacity = getChartHoverOpacity({ presence })
                  const showTooltip = () => {
                    setHover({ key: category, type: "bar" })
                    setTooltip({
                      datum,
                      x: layout.margin.left + barX + barWidth / 2,
                      y: layout.margin.top + barY,
                    })
                  }

                  return (
                    <g key={category}>
                      <g
                        opacity={opacity}
                        style={{
                          transition: `opacity ${chartHoverTransition.duration}s ease-out`,
                        }}
                      >
                        {renderer === "rough" ? (
                          <RoughRect
                            height={barHeight}
                            options={roughOptionsByKey.get(category)}
                            width={barWidth}
                            x={barX}
                            y={barY}
                          />
                        ) : (
                          <Bar
                            fill={color}
                            height={barHeight}
                            width={barWidth}
                            x={barX}
                            y={barY}
                          />
                        )}
                      </g>
                      <ChartHitRect
                        height={barHeight}
                        onPointerEnter={showTooltip}
                        width={barWidth}
                        x={barX}
                        y={barY}
                      />
                    </g>
                  )
                })}
              </ChartCartesianGroup>
            </ChartSvg>

            <ChartTooltip
              bounds={{ height, width }}
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

            {legend ? (
              <ChartLegend
                className="absolute inset-x-0 bottom-0 justify-center"
                series={series}
              />
            ) : null}
          </div>
        )
      }}
    </ChartContainer>
  )
}
