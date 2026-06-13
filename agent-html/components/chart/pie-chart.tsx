import { Pie } from "@visx/shape"
import * as React from "react"

import {
  type ChartRoughOptions,
  type ChartTextureOptions,
  ChartRenderedPath,
} from "./runtime"
import type {
  ChartAccessor,
  ChartConfig,
  ChartRenderer,
} from "./runtime"
import {
  ChartContainer,
  ChartHitPath,
  ChartInteractionRoot,
  ChartLegend,
  ChartMotionGroup,
  ChartSvg,
  ChartTooltip,
  ChartTooltipContent,
  getValue,
  isFiniteNumber,
  resolveChartRenderer,
  useChartMarkInteraction,
  useChartMaterialRegistry,
} from "./runtime"

export interface PieChartProps<T> {
  aspectRatio?: string
  className?: string
  config?: ChartConfig
  data: readonly T[]
  legend?: boolean
  minHeight?: number
  nameKey: ChartAccessor<T, string>
  renderer?: ChartRenderer
  rough?: ChartRoughOptions
  texture?: ChartTextureOptions
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
  rough,
  texture,
  valueFormatter = formatValue,
  valueKey,
}: PieChartProps<T>) {
  const resolvedRenderer = resolveChartRenderer(renderer, [
    "svg",
    "rough",
    "texture",
  ])
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
  const sliceKeys = React.useMemo(
    () => data.map((datum) => getValue(datum, nameKey)),
    [data, nameKey]
  )
  const materials = useChartMaterialRegistry({
    config,
    keys: sliceKeys,
    renderer: resolvedRenderer,
    rough,
    scope: "pie",
    strategy: "categorical",
    texture,
  })
  const slices = React.useMemo(
    () =>
      createSlices({
        config: materials.resolvedConfig,
        data,
        nameKey,
        valueKey,
      }),
    [materials.resolvedConfig, data, nameKey, valueKey]
  )

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={className}
      config={materials.resolvedConfig}
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
              {materials.defs}
              <Pie
                data={model.slices}
                outerRadius={model.radius}
                pieValue={(slice) => slice.value}
              >
                {({ arcs, path }) => (
                  <g transform={`translate(${model.centerX}, ${model.pieCenterY})`}>
                    {arcs.map((arc) => {
                      const d = path(arc) ?? ""
                      const material = materials.getMaterial(arc.data.key)
                      const key = getMarkKey("slice", arc.data.key)
                      const markMotion = getMarkMotion({ key })
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
                            <ChartRenderedPath
                              color={material.color}
                              d={d}
                              renderer={material.renderer}
                              rough={material.rough}
                              stroke={material.color}
                              textureIndex={material.textureIndex}
                              textureKey={material.textureKey}
                              texture={material.texture}
                              textureScopeId={material.textureScopeId}
                            />
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
                      color: materials.getMaterial(tooltip.slice.key).color,
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
