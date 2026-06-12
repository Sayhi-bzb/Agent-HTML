import { HeatmapCircle } from "@visx/heatmap"
import * as React from "react"
import type { Options as RoughOptions } from "roughjs/bin/core"

import {
  type ChartAccessor,
  type ChartConfig,
  type ChartRenderer,
  ChartContainer,
  ChartHitCircle,
  ChartInteractionRoot,
  ChartMotionGroup,
  ChartSvg,
  ChartTooltip,
  ChartTooltipContent,
  ChartTooltipPanel,
  chartMotion,
  getChartCssVariable,
  getValue,
  isFiniteNumber,
  useChartMarkTooltip,
} from "../ui/chart"
import { RoughCircle } from "@/lib/rough-svg"

export interface HeatmapChartProps<T> {
  aspectRatio?: string
  className?: string
  config: ChartConfig
  data: readonly T[]
  minHeight?: number
  renderTooltip?: (datum: T) => React.ReactNode
  renderer?: ChartRenderer
  roughOptions?: RoughOptions
  valueFormatter?: (value: number) => React.ReactNode
  valueKey: ChartAccessor<T, number>
  xKey: ChartAccessor<T, string | number>
  xLabelFormatter?: (value: string | number) => React.ReactNode
  xLabels: readonly (string | number)[]
  yKey: ChartAccessor<T, string | number>
  yLabelFormatter?: (value: string | number) => React.ReactNode
  yLabels: readonly (string | number)[]
}

interface HeatmapColumn<T> {
  bins: Array<HeatmapBin<T>>
  key: string
  label: string | number
}

interface HeatmapBin<T> {
  datum: T | null
  key: string
  label: string | number
  value: number
}

interface TooltipState<T> {
  bin: HeatmapBin<T>
  column: HeatmapColumn<T>
}

const DEFAULT_MARGIN = {
  bottom: 10,
  left: 46,
  right: 8,
  top: 28,
}

const numberFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
})

function formatValue(value: number) {
  return numberFormatter.format(value)
}

function createHeatmapColumns<T>({
  data,
  valueKey,
  xKey,
  xLabels,
  yKey,
  yLabels,
}: Pick<
  HeatmapChartProps<T>,
  "data" | "valueKey" | "xKey" | "xLabels" | "yKey" | "yLabels"
>): HeatmapColumn<T>[] {
  const datumByCell = new Map(
    data.map((datum) => [
      `${String(getValue(datum, xKey))}\u0000${String(getValue(datum, yKey))}`,
      datum,
    ])
  )

  return xLabels.map((xLabel) => ({
    bins: yLabels.map((yLabel) => {
      const datum = datumByCell.get(`${String(xLabel)}\u0000${String(yLabel)}`) ?? null
      const value = datum ? getValue(datum, valueKey) : 0

      return {
        datum,
        key: String(yLabel),
        label: yLabel,
        value: isFiniteNumber(value) ? value : 0,
      }
    }),
    key: String(xLabel),
    label: xLabel,
  }))
}

export function HeatmapChart<T>({
  aspectRatio = "4 / 1",
  className,
  config,
  data,
  minHeight = 220,
  renderTooltip,
  renderer = "svg",
  roughOptions,
  valueFormatter = formatValue,
  valueKey,
  xKey,
  xLabelFormatter,
  xLabels,
  yKey,
  yLabelFormatter,
  yLabels,
}: HeatmapChartProps<T>) {
  const {
    currentTooltipData: tooltip,
    followTooltip,
    hideTooltip,
    hover,
    setHover,
    showTooltip,
    tooltipLeft,
    tooltipOpen,
    tooltipTop,
  } = useChartMarkTooltip<TooltipState<T>, "cell">()
  const columns = React.useMemo(
    () =>
      createHeatmapColumns({
        data,
        valueKey,
        xKey,
        xLabels,
        yKey,
        yLabels,
      }),
    [data, valueKey, xKey, xLabels, yKey, yLabels]
  )
  const values = React.useMemo(
    () =>
      columns
        .flatMap((column) => column.bins.map((bin) => bin.value))
        .filter((value) => value > 0),
    [columns]
  )
  const maxValue = values.length > 0 ? Math.max(...values) : 1
  const seriesKey = React.useMemo(() => Object.keys(config)[0] ?? "value", [config])
  const color = getChartCssVariable(seriesKey)

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={className}
      config={config}
      emptyData={
        <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
          No heatmap data
        </div>
      }
      isEmpty={data.length === 0 || xLabels.length === 0 || yLabels.length === 0}
      minHeight={minHeight}
    >
      {({ height, series, width }) => {
        const innerWidth = Math.max(0, width - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right)
        const innerHeight = Math.max(0, height - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom)
        const columnStep = xLabels.length > 0 ? innerWidth / xLabels.length : 0
        const rowStep = yLabels.length > 0 ? innerHeight / yLabels.length : 0
        const radius = Math.max(0, Math.min(columnStep, rowStep) / 2)
        const gap = Math.min(4, radius * 0.28)
        const seriesLabel = series[0]?.label ?? seriesKey

        return (
          <ChartInteractionRoot
            onPointerLeave={hideTooltip}
            onPointerMove={followTooltip}
          >
            <ChartSvg aria-label="heatmap chart" role="img">
              {xLabels.map((label, index) => (
                <text
                  className="fill-muted-foreground text-xs"
                  key={String(label)}
                  textAnchor="middle"
                  x={DEFAULT_MARGIN.left + index * columnStep + columnStep / 2}
                  y={14}
                >
                  {index % 3 === 0
                    ? xLabelFormatter
                      ? xLabelFormatter(label)
                      : label
                    : ""}
                </text>
              ))}
              {yLabels.map((label, index) => (
                <text
                  className="fill-muted-foreground text-xs"
                  dy="0.32em"
                  key={String(label)}
                  x={0}
                  y={DEFAULT_MARGIN.top + index * rowStep + rowStep / 2}
                >
                  {yLabelFormatter ? yLabelFormatter(label) : label}
                </text>
              ))}
              <g transform={`translate(${DEFAULT_MARGIN.left},${DEFAULT_MARGIN.top})`}>
                <HeatmapCircle<HeatmapColumn<T>, HeatmapBin<T>>
                  colorScale={() => color}
                  count={(bin) => bin.value}
                  data={columns}
                  gap={gap}
                  opacityScale={(value) => {
                    const count = Number(value)

                    return count > 0 ? 0.14 + (count / maxValue) * 0.76 : 0.08
                  }}
                  radius={radius}
                  xScale={(columnIndex) =>
                    columnIndex * columnStep + columnStep / 2 - radius
                  }
                  yScale={(rowIndex) =>
                    rowIndex * rowStep + rowStep / 2 - radius - gap
                  }
                >
                  {(heatmap) => (
                    <>
                      {heatmap.flatMap((column) =>
                        column.map((cell) => {
                          const key = `${cell.datum.key}-${cell.bin.key}`
                          const isActive = hover?.key === key
                          const opacity = isActive ? 1 : cell.opacity

                          return (
                            <g key={key}>
                              <ChartMotionGroup
                                animate={{ opacity }}
                                initial={false}
                                transition={chartMotion.hover}
                              >
                                {renderer === "rough" ? (
                                  <RoughCircle
                                    diameter={cell.r * 2}
                                    options={{
                                      ...roughOptions,
                                      fill: color,
                                      stroke: roughOptions?.stroke ?? color,
                                    }}
                                    x={cell.cx}
                                    y={cell.cy}
                                  />
                                ) : (
                                  <circle
                                    cx={cell.cx}
                                    cy={cell.cy}
                                    fill={cell.color}
                                    r={cell.r}
                                  />
                                )}
                              </ChartMotionGroup>
                              <ChartHitCircle
                                ariaLabel={`${cell.datum.label} ${cell.bin.label}: ${valueFormatter(
                                  cell.bin.value
                                )}`}
                                className="outline-none focus-visible:stroke-foreground focus-visible:stroke-2"
                                cx={cell.cx}
                                cy={cell.cy}
                                onPointerEnter={(event) => {
                                  setHover({ key, type: "cell" })
                                  showTooltip(event, {
                                    bin: cell.bin,
                                    column: cell.datum,
                                  })
                                }}
                                onPointerLeave={hideTooltip}
                                onPointerMove={followTooltip}
                                r={Math.max(cell.radius, 12)}
                                tabIndex={0}
                              />
                            </g>
                          )
                        })
                      )}
                    </>
                  )}
                </HeatmapCircle>
              </g>
            </ChartSvg>

            <ChartTooltip
              visible={tooltipOpen}
              x={tooltipLeft ?? 0}
              y={tooltipTop ?? 0}
            >
              {tooltip ? (
                tooltip.bin.datum && renderTooltip ? (
                  <ChartTooltipPanel>
                    {renderTooltip(tooltip.bin.datum)}
                  </ChartTooltipPanel>
                ) : (
                  <ChartTooltipContent
                    items={[
                      {
                        color,
                        key: seriesKey,
                        label: seriesLabel,
                        value: valueFormatter(tooltip.bin.value),
                      },
                    ]}
                    label={`${tooltip.column.label} ${tooltip.bin.label}`}
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
