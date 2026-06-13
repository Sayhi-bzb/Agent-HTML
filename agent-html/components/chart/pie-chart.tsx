import { Pie } from "@visx/shape"
import * as React from "react"
import type { Options as RoughOptions } from "roughjs/bin/core"

import {
  ChartTextureDefs,
  ChartTexturePath,
  createChartTextureId,
  resolveChartTextureOptions,
  type ChartTextureOptions,
} from "@/lib/chart-texture"
import { RoughPath } from "@/lib/rough-svg"
import type {
  ChartAccessor,
  ChartConfig,
  ChartRenderer,
} from "../ui/chart"
import {
  ChartContainer,
  ChartHitPath,
  ChartInteractionRoot,
  ChartLegend,
  ChartMotionGroup,
  ChartSvg,
  ChartTooltip,
  ChartTooltipContent,
  getChartCssVariable,
  getValue,
  isFiniteNumber,
  useChartMarkInteraction,
} from "../ui/chart"

export interface PieChartProps<T> {
  aspectRatio?: string
  className?: string
  config: ChartConfig
  data: readonly T[]
  legend?: boolean
  minHeight?: number
  nameKey: ChartAccessor<T, string>
  renderer?: ChartRenderer
  roughOptions?: RoughOptions
  textureOptions?: ChartTextureOptions
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
}

interface PieModel<T> {
  centerX: number
  pieCenterY: number
  radius: number
  slices: PieSlice<T>[]
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

function createPieModel<T>({
  height,
  legend,
  slices,
  width,
}: {
  height: number
  legend: boolean
  slices: PieSlice<T>[]
  width: number
}): PieModel<T> {
  const centerX = width / 2
  const centerY = height / 2
  const legendOffset = legend ? 48 : 0
  const pieCenterY = centerY - legendOffset / 2
  const radius = Math.max(0, Math.min(width, height - legendOffset) / 2 - 12)

  return {
    centerX,
    pieCenterY,
    radius,
    slices,
  }
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
  textureOptions,
  valueFormatter = formatValue,
  valueKey,
}: PieChartProps<T>) {
  const {
    currentTooltipData: tooltip,
    followTooltip,
    getMarkKey,
    getMarkMotion,
    hideTooltip,
    showMark,
    tooltipLeft,
    tooltipOpen,
    tooltipTop,
  } = useChartMarkInteraction<TooltipState<T>, "slice">()
  const slices = React.useMemo(
    () => createSlices({ config, data, nameKey, valueKey }),
    [config, data, nameKey, valueKey]
  )
  const textureScopeId = React.useId()

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={className}
      config={config}
      emptyData={
        <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
          No share data
        </div>
      }
      isEmpty={slices.length === 0}
      minHeight={minHeight}
    >
      {({ height, series, width }) => {
        const model = createPieModel({
          height,
          legend,
          slices,
          width,
        })

        return (
          <ChartInteractionRoot onPointerLeave={hideTooltip}>
            <ChartSvg aria-label="占比饼图" role="img">
              {renderer === "texture"
                ? model.slices.map((slice, index) => (
                    <ChartTextureDefs
                      color={getChartCssVariable(slice.key)}
                      id={createChartTextureId("pie", textureScopeId, slice.key)}
                      index={index}
                      key={slice.key}
                      options={textureOptions}
                    />
                  ))
                : null}
              <Pie
                data={model.slices}
                outerRadius={model.radius}
                pieValue={(slice) => slice.value}
              >
                {({ arcs, path }) => (
                  <g transform={`translate(${model.centerX}, ${model.pieCenterY})`}>
                    {arcs.map((arc) => {
                      const d = path(arc) ?? ""
                      const color = getChartCssVariable(arc.data.key)
                      const key = getMarkKey("slice", arc.data.key)
                      const markMotion = getMarkMotion({ key })
                      const textureId = createChartTextureId(
                        "pie",
                        textureScopeId,
                        arc.data.key
                      )
                      const texture = resolveChartTextureOptions({
                        index: arcs.indexOf(arc),
                        options: textureOptions,
                      })
                      const showTooltip = (
                        event: React.PointerEvent<SVGPathElement>
                      ) => {
                        showMark({
                          data: { slice: arc.data },
                          event,
                          key,
                          type: "slice",
                        })
                      }

                      return (
                        <g key={arc.data.key}>
                          <ChartMotionGroup
                            {...markMotion}
                          >
                            {renderer === "rough" ? (
                              <RoughPath
                                d={d}
                                options={{
                                  fill: color,
                                  stroke: color,
                                  ...roughOptions,
                                }}
                              />
                            ) : renderer === "texture" ? (
                              <ChartTexturePath
                                d={d}
                                id={textureId}
                                opacity={texture.opacity}
                              />
                            ) : (
                              <path d={d} fill={color} stroke={color} />
                            )}
                          </ChartMotionGroup>
                          <ChartHitPath
                            d={d}
                            onPointerEnter={showTooltip}
                            onPointerLeave={hideTooltip}
                            onPointerMove={followTooltip}
                          />
                        </g>
                      )
                    })}
                  </g>
                )}
              </Pie>
            </ChartSvg>

            <ChartTooltip
              visible={tooltipOpen}
              x={tooltipLeft ?? 0}
              y={tooltipTop ?? 0}
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
          </ChartInteractionRoot>
        )
      }}
    </ChartContainer>
  )
}
