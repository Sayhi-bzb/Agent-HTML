import { Bar } from "@visx/shape"
import * as React from "react"
import type { Options as RoughOptions } from "roughjs/bin/core"

import {
  type ChartAccessor,
  type ChartConfig,
  ChartCartesianGroup,
  ChartContainer,
  ChartHitRect,
  ChartLegend,
  type ChartRenderer,
  ChartSvg,
  ChartTooltip,
  ChartTooltipContent,
  ChartXAxisGrid,
  createBandScale,
  createCartesianLayout,
  createLinearScale,
  createRoughOptionsByKey,
  getChartCssVariable,
  getFiniteValues,
  getValue,
  isFiniteNumber,
} from "./chart"
import { RoughRect } from "./rough-renderers"

export interface BarHChartProps<T> {
  aspectRatio?: string
  className?: string
  config: ChartConfig
  data: readonly T[]
  legend?: boolean
  minHeight?: number
  renderer?: ChartRenderer
  roughOptions?: RoughOptions
  xKey: ChartAccessor<T, number>
  xValueFormatter?: (value: number) => React.ReactNode
  yKey: ChartAccessor<T, string>
  yLabelFormatter?: (value: string) => React.ReactNode
}

interface TooltipState<T> {
  datum: T
  x: number
  y: number
}

const DEFAULT_MARGIN = {
  bottom: 28,
  left: 150,
  right: 24,
  top: 16,
}

const valueFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
  notation: "compact",
})

function formatValue(value: number) {
  return valueFormatter.format(value)
}

export function BarHChart<T>({
  aspectRatio = "9 / 5",
  className,
  config,
  data,
  legend = false,
  minHeight = 360,
  renderer = "svg",
  roughOptions,
  xKey,
  xValueFormatter = formatValue,
  yKey,
  yLabelFormatter,
}: BarHChartProps<T>) {
  const [tooltip, setTooltip] = React.useState<TooltipState<T> | null>(null)
  const seriesKey = React.useMemo(() => Object.keys(config)[0] ?? "value", [config])
  const roughOptionsByKey = React.useMemo(
    () =>
      createRoughOptionsByKey({
        getColorKey: () => seriesKey,
        getKey: (datum: T) => getValue(datum, yKey),
        options: roughOptions,
        rows: data,
      }) as Map<string, RoughOptions>,
    [data, roughOptions, seriesKey, yKey]
  )

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={className}
      config={config}
      emptyData={
        <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
          No horizontal bar data
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
        const xScale = createLinearScale({
          range: [0, layout.innerWidth],
          values: getFiniteValues(Array.from(data), xKey),
        })
        const yScale = createBandScale({
          data: Array.from(data),
          padding: 0.28,
          range: [0, layout.innerHeight],
          x: yKey,
        })
        const seriesLabel = config[seriesKey]?.label ?? series[0]?.label ?? seriesKey
        const color = getChartCssVariable(seriesKey)
        const y = (datum: T) => yScale(getValue(datum, yKey)) ?? 0

        return (
          <div className="relative h-full w-full">
            <ChartSvg
              aria-label="水平柱形图"
              onPointerLeave={() => setTooltip(null)}
              role="img"
            >
              <ChartCartesianGroup layout={layout}>
                <ChartXAxisGrid
                  formatTick={xValueFormatter}
                  innerHeight={layout.innerHeight}
                  scale={xScale}
                />

                {data.map((datum) => {
                  const label = getValue(datum, yKey)
                  const labelY = y(datum) + yScale.bandwidth() / 2

                  return (
                    <text
                      className="fill-muted-foreground text-[0.68rem]"
                      dy="0.32em"
                      key={label}
                      textAnchor="end"
                      x={-8}
                      y={labelY}
                    >
                      {yLabelFormatter ? yLabelFormatter(label) : label}
                    </text>
                  )
                })}

                {data.map((datum) => {
                  const category = getValue(datum, yKey)
                  const value = getValue(datum, xKey)

                  if (!isFiniteNumber(value)) {
                    return null
                  }

                  const barX = 0
                  const barY = y(datum)
                  const barHeight = yScale.bandwidth()
                  const barWidth = xScale(value)
                  const showTooltip = () =>
                    setTooltip({
                      datum,
                      x: layout.margin.left + barWidth + 12,
                      y: layout.margin.top + barY - 12,
                    })

                  return (
                    <g key={category}>
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
                      value: xValueFormatter(getValue(tooltip.datum, xKey)),
                    },
                  ]}
                  label={
                    yLabelFormatter
                      ? yLabelFormatter(getValue(tooltip.datum, yKey))
                      : getValue(tooltip.datum, yKey)
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
