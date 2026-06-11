import { Pie } from "@visx/shape"
import * as React from "react"
import type { Options as RoughOptions } from "roughjs/bin/core"

import type { ChartAccessor, ChartConfig } from "./chart"
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
  createRoughOptionsByKey,
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
  renderer?: "rough" | "svg"
  roughOptions?: RoughOptions
  valueFormatter?: (value: number) => React.ReactNode
  valueKey: ChartAccessor<T, number>
}

interface PieSlice<T> {
  datum: T
  key: string
  label: React.ReactNode
  value: number
}

interface TooltipState<T> {
  slice: PieSlice<T>
  x: number
  y: number
}

function formatValue(value: number) {
  return `${value}%`
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

  if (total <= 0) {
    return []
  }

  return rows.map<PieSlice<T>>((row) => ({
    ...row,
    label: config[row.key]?.label ?? row.key,
  }))
}

export function PieChart<T>({
  aspectRatio = "1 / 1",
  className,
  config,
  data,
  legend = false,
  minHeight = 220,
  nameKey,
  renderer = "svg",
  roughOptions,
  valueFormatter = formatValue,
  valueKey,
}: PieChartProps<T>) {
  const [tooltip, setTooltip] = React.useState<TooltipState<T> | null>(null)
  const slices = React.useMemo(
    () => createSlices({ config, data, nameKey, valueKey }),
    [config, data, nameKey, valueKey]
  )
  const roughOptionsByKey = React.useMemo(
    () =>
      createRoughOptionsByKey({
        getKey: (slice) => slice.key,
        options: roughOptions,
        rows: slices,
      }) as Map<string, RoughOptions>,
    [roughOptions, slices]
  )

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
        const centerX = width / 2
        const centerY = height / 2
        const legendOffset = legend ? 48 : 0
        const pieCenterY = centerY - legendOffset / 2
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
              <Pie
                data={Array.from(slices)}
                outerRadius={radius}
                pieValue={(slice) => slice.value}
              >
                {({ arcs, path }) => (
                  <g transform={`translate(${centerX}, ${pieCenterY})`}>
                    {arcs.map((arc) => {
                      const [centroidX, centroidY] = path.centroid(arc)
                      const d = path(arc) ?? ""
                      const color = getChartCssVariable(arc.data.key)
                      const showTooltip = () =>
                        setTooltip({
                          slice: arc.data,
                          x: centerX + centroidX + 12,
                          y: pieCenterY + centroidY - 12,
                        })

                      return (
                        <g key={arc.data.key}>
                          {renderer === "rough" ? (
                            <RoughPath
                              d={d}
                              options={roughOptionsByKey.get(arc.data.key)}
                            />
                          ) : (
                            <path d={d} fill={color} stroke={color} />
                          )}
                          <path
                            d={d}
                            fill="transparent"
                            onPointerEnter={showTooltip}
                            pointerEvents="all"
                            stroke="transparent"
                          />
                        </g>
                      )
                    })}
                  </g>
                )}
              </Pie>
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
