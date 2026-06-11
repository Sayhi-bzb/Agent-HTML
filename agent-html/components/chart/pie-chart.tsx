import * as React from "react"
import type { Options as RoughOptions } from "roughjs/bin/core"

import type { ChartAccessor, ChartConfig } from "./chart"
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  getChartCssVariable,
  getValue,
  isFiniteNumber,
} from "./chart"
import { RoughPath } from "./rough-renderers"

export interface PieChartProps<T> {
  aspectRatio?: string
  className?: string
  config: ChartConfig
  data: readonly T[]
  legend?: boolean
  minHeight?: number
  nameKey: ChartAccessor<T, string>
  roughOptions?: RoughOptions
  valueFormatter?: (value: number) => React.ReactNode
  valueKey: ChartAccessor<T, number>
}

interface PieSlice<T> {
  datum: T
  endAngle: number
  key: string
  label: React.ReactNode
  startAngle: number
  value: number
}

interface TooltipState<T> {
  slice: PieSlice<T>
  x: number
  y: number
}

const TAU = Math.PI * 2

function formatValue(value: number) {
  return `${value}%`
}

function polarToCartesian({
  angle,
  cx,
  cy,
  radius,
}: {
  angle: number
  cx: number
  cy: number
  radius: number
}) {
  return {
    x: cx + radius * Math.cos(angle - Math.PI / 2),
    y: cy + radius * Math.sin(angle - Math.PI / 2),
  }
}

function createSectorPath({
  cx,
  cy,
  endAngle,
  radius,
  startAngle,
}: {
  cx: number
  cy: number
  endAngle: number
  radius: number
  startAngle: number
}) {
  const start = polarToCartesian({ angle: startAngle, cx, cy, radius })
  const end = polarToCartesian({ angle: endAngle, cx, cy, radius })
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ")
}

function createSlices<T>({
  config,
  data,
  nameKey,
  valueKey,
}: {
  config: ChartConfig
  data: readonly T[]
  nameKey: ChartAccessor<T, string>
  valueKey: ChartAccessor<T, number>
}) {
  const rows = data
    .map((datum) => ({
      datum,
      key: getValue(datum, nameKey),
      value: getValue(datum, valueKey),
    }))
    .filter((row) => isFiniteNumber(row.value) && row.value > 0)
  const total = rows.reduce((sum, row) => sum + row.value, 0)
  let cursor = 0

  if (total <= 0) {
    return []
  }

  return rows.map<PieSlice<T>>((row) => {
    const startAngle = cursor
    const endAngle = cursor + (row.value / total) * TAU
    cursor = endAngle

    return {
      ...row,
      endAngle,
      label: config[row.key]?.label ?? row.key,
      startAngle,
    }
  })
}

export function PieChart<T>({
  aspectRatio = "1 / 1",
  className,
  config,
  data,
  legend = false,
  minHeight = 220,
  nameKey,
  roughOptions,
  valueFormatter = formatValue,
  valueKey,
}: PieChartProps<T>) {
  const [tooltip, setTooltip] = React.useState<TooltipState<T> | null>(null)

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={className}
      config={config}
      empty={
        <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
          暂无占比数据
        </div>
      }
      minHeight={minHeight}
    >
      {({ height, series, width }) => {
        const slices = createSlices({ config, data, nameKey, valueKey })
        const centerX = width / 2
        const centerY = height / 2
        const legendOffset = legend ? 48 : 0
        const radius = Math.max(
          0,
          Math.min(width, height - legendOffset) / 2 - 12
        )

        return (
          <div className="relative h-full w-full">
            <svg
              aria-label="占比饼图"
              className="h-full w-full overflow-visible"
              onPointerLeave={() => setTooltip(null)}
              role="img"
            >
              {slices.map((slice) => {
                const middleAngle = (slice.startAngle + slice.endAngle) / 2
                const labelPoint = polarToCartesian({
                  angle: middleAngle,
                  cx: centerX,
                  cy: centerY - legendOffset / 2,
                  radius: radius * 0.62,
                })
                const color = getChartCssVariable(slice.key)

                return (
                  <g
                    key={slice.key}
                    onPointerEnter={() =>
                      setTooltip({
                        slice,
                        x: labelPoint.x + 12,
                        y: labelPoint.y - 12,
                      })
                    }
                  >
                    <RoughPath
                      d={createSectorPath({
                        cx: centerX,
                        cy: centerY - legendOffset / 2,
                        endAngle: slice.endAngle,
                        radius,
                        startAngle: slice.startAngle,
                      })}
                      options={{
                        fill: color,
                        stroke: color,
                        ...roughOptions,
                      }}
                    />
                  </g>
                )
              })}
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
                      color: getChartCssVariable(tooltip.slice.key),
                      key: tooltip.slice.key,
                      label: tooltip.slice.label,
                      value: valueFormatter(tooltip.slice.value),
                    },
                  ]}
                  label={tooltip.slice.label}
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
