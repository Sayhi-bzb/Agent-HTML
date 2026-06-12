import { Bar } from "@visx/shape"
import * as React from "react"
import type { Options as RoughOptions } from "roughjs/bin/core"

import {
  type ChartAccessor,
  type ChartConfig,
  ChartCartesianGroup,
  ChartContainer,
  ChartHitRect,
  ChartInteractionRoot,
  ChartLegend,
  ChartMotionGroup,
  type ChartRenderer,
  ChartSvg,
  ChartTooltip,
  ChartTooltipContent,
  ChartXAxisGrid,
  ChartYAxisGrid,
  createBandScale,
  createCartesianLayout,
  createLinearScale,
  getChartCssVariable,
  getFiniteValues,
  getValue,
  isFiniteNumber,
  useChartMarkInteraction,
} from "../ui/chart"
import { RoughRect } from "@/lib/rough-svg"

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
}

interface BarRect {
  height: number
  width: number
  x: number
  y: number
}

type BarOrientation = "vertical" | "horizontal"

interface BarCoreProps<T> {
  ariaLabel: string
  aspectRatio: string
  categoryFormatter?: (value: string) => React.ReactNode
  categoryKey: ChartAccessor<T, string>
  className?: string
  config: ChartConfig
  data: readonly T[]
  emptyLabel: string
  legend: boolean
  margin: {
    bottom: number
    left: number
    right: number
    top: number
  }
  minHeight: number
  orientation: BarOrientation
  renderer: ChartRenderer
  roughOptions?: RoughOptions
  valueFormatter: (value: number) => React.ReactNode
  valueKey: ChartAccessor<T, number>
}

interface BarModelOptions<T> {
  categoryKey: ChartAccessor<T, string>
  data: T[]
  layout: ReturnType<typeof createCartesianLayout>
  orientation: BarOrientation
  valueKey: ChartAccessor<T, number>
}

const VERTICAL_MARGIN = {
  bottom: 42,
  left: 42,
  right: 16,
  top: 16,
}

const HORIZONTAL_MARGIN = {
  bottom: 28,
  left: 150,
  right: 24,
  top: 16,
}

const verticalValueFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
})

const horizontalValueFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
  notation: "compact",
})

function formatVerticalValue(value: number) {
  return verticalValueFormatter.format(value)
}

function formatHorizontalValue(value: number) {
  return horizontalValueFormatter.format(value)
}

function formatCategory<T>({
  categoryFormatter,
  categoryKey,
  datum,
}: {
  categoryFormatter?: (value: string) => React.ReactNode
  categoryKey: ChartAccessor<T, string>
  datum: T
}) {
  const category = getValue(datum, categoryKey)

  return categoryFormatter ? categoryFormatter(category) : category
}

function BarXAxisLabels<T>({
  data,
  formatTick,
  innerHeight,
  x,
  xKey,
}: {
  data: readonly T[]
  formatTick?: (value: string) => React.ReactNode
  innerHeight: number
  x: (datum: T) => number
  xKey: ChartAccessor<T, string>
}) {
  return (
    <>
      {data.map((datum) => {
        const value = getValue(datum, xKey)

        return (
          <text
            className="fill-muted-foreground text-[0.68rem]"
            key={value}
            textAnchor="middle"
            x={x(datum)}
            y={innerHeight + 20}
          >
            {formatTick ? formatTick(value) : value}
          </text>
        )
      })}
    </>
  )
}

function createBarModel<T>({
  categoryKey,
  data,
  layout,
  orientation,
  valueKey,
}: BarModelOptions<T>) {
  const categoryScale = createBandScale({
    data,
    padding: 0.28,
    range:
      orientation === "vertical"
        ? [0, layout.innerWidth]
        : [0, layout.innerHeight],
    x: categoryKey,
  })
  const valueScale = createLinearScale({
    range:
      orientation === "vertical"
        ? [layout.innerHeight, 0]
        : [0, layout.innerWidth],
    values: getFiniteValues(data, valueKey),
  })
  const getCategoryPosition = (datum: T) =>
    categoryScale(getValue(datum, categoryKey)) ?? 0
  const getBarRect = (datum: T, value: number): BarRect => {
    const categoryPosition = getCategoryPosition(datum)

    if (orientation === "vertical") {
      const y = valueScale(value)

      return {
        height: layout.innerHeight - y,
        width: categoryScale.bandwidth(),
        x: categoryPosition,
        y,
      }
    }

    return {
      height: categoryScale.bandwidth(),
      width: valueScale(value),
      x: 0,
      y: categoryPosition,
    }
  }

  return {
    categoryScale,
    getBarRect,
    getCategoryPosition,
    valueScale,
  }
}

function BarChartCore<T>({
  ariaLabel,
  aspectRatio,
  categoryFormatter,
  categoryKey,
  className,
  config,
  data,
  emptyLabel,
  legend,
  margin,
  minHeight,
  orientation,
  renderer,
  roughOptions,
  valueFormatter,
  valueKey,
}: BarCoreProps<T>) {
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
  } = useChartMarkInteraction<TooltipState<T>, "bar">()
  const seriesKey = React.useMemo(() => Object.keys(config)[0] ?? "value", [config])
  const rows = React.useMemo(() => Array.from(data), [data])

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={className}
      config={config}
      emptyData={
        <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
          {emptyLabel}
        </div>
      }
      isEmpty={data.length === 0}
      minHeight={minHeight}
    >
      {({ height, series, width }) => {
        const layout = createCartesianLayout({
          height,
          margin,
          width,
        })
        const model = createBarModel({
          categoryKey,
          data: rows,
          layout,
          orientation,
          valueKey,
        })
        const seriesLabel = config[seriesKey]?.label ?? series[0]?.label ?? seriesKey
        const color = getChartCssVariable(seriesKey)

        return (
          <ChartInteractionRoot onPointerLeave={hideTooltip}>
            <ChartSvg aria-label={ariaLabel} role="img">
              <ChartCartesianGroup layout={layout}>
                {orientation === "vertical" ? (
                  <>
                    <ChartYAxisGrid
                      formatTick={valueFormatter}
                      innerWidth={layout.innerWidth}
                      scale={model.valueScale}
                    />
                    <BarXAxisLabels
                      data={data}
                      formatTick={categoryFormatter}
                      innerHeight={layout.innerHeight}
                      x={(datum) =>
                        model.getCategoryPosition(datum) +
                        model.categoryScale.bandwidth() / 2
                      }
                      xKey={categoryKey}
                    />
                  </>
                ) : (
                  <>
                    <ChartXAxisGrid
                      formatTick={valueFormatter}
                      innerHeight={layout.innerHeight}
                      scale={model.valueScale}
                    />
                    {data.map((datum) => {
                      const label = getValue(datum, categoryKey)
                      const labelY =
                        model.getCategoryPosition(datum) +
                        model.categoryScale.bandwidth() / 2

                      return (
                        <text
                          className="fill-muted-foreground text-[0.68rem]"
                          dy="0.32em"
                          key={label}
                          textAnchor="end"
                          x={-8}
                          y={labelY}
                        >
                          {categoryFormatter ? categoryFormatter(label) : label}
                        </text>
                      )
                    })}
                  </>
                )}

                {data.map((datum) => {
                  const category = getValue(datum, categoryKey)
                  const value = getValue(datum, valueKey)

                  if (!isFiniteNumber(value)) {
                    return null
                  }

                  const rect = model.getBarRect(datum, value)
                  const key = getMarkKey("bar", category)
                  const markMotion = getMarkMotion({ key })
                  const showTooltip = (
                    event: React.PointerEvent<SVGRectElement>
                  ) => {
                    showMark({
                      data: { datum },
                      event,
                      key,
                      type: "bar",
                    })
                  }

                  return (
                    <g key={category}>
                      <ChartMotionGroup
                        {...markMotion}
                      >
                        {renderer === "rough" ? (
                          <RoughRect
                            height={rect.height}
                            options={{
                              fill: color,
                              stroke: color,
                              ...roughOptions,
                            }}
                            width={rect.width}
                            x={rect.x}
                            y={rect.y}
                          />
                        ) : (
                          <Bar
                            fill={color}
                            height={rect.height}
                            width={rect.width}
                            x={rect.x}
                            y={rect.y}
                          />
                        )}
                      </ChartMotionGroup>
                      <ChartHitRect
                        height={rect.height}
                        onPointerEnter={showTooltip}
                        onPointerLeave={hideTooltip}
                        onPointerMove={followTooltip}
                        width={rect.width}
                        x={rect.x}
                        y={rect.y}
                      />
                    </g>
                  )
                })}
              </ChartCartesianGroup>
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
                      color,
                      key: seriesKey,
                      label: seriesLabel,
                      value: valueFormatter(getValue(tooltip.datum, valueKey)),
                    },
                  ]}
                  label={formatCategory({
                    categoryFormatter,
                    categoryKey,
                    datum: tooltip.datum,
                  })}
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
  yValueFormatter = formatVerticalValue,
}: BarChartProps<T>) {
  return (
    <BarChartCore
      ariaLabel="柱形图"
      aspectRatio={aspectRatio}
      categoryFormatter={xLabelFormatter}
      categoryKey={xKey}
      className={className}
      config={config}
      data={data}
      emptyLabel="No bar data"
      legend={legend}
      margin={VERTICAL_MARGIN}
      minHeight={minHeight}
      orientation="vertical"
      renderer={renderer}
      roughOptions={roughOptions}
      valueFormatter={yValueFormatter}
      valueKey={yKey}
    />
  )
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
  xValueFormatter = formatHorizontalValue,
  yKey,
  yLabelFormatter,
}: BarHChartProps<T>) {
  return (
    <BarChartCore
      ariaLabel="水平柱形图"
      aspectRatio={aspectRatio}
      categoryFormatter={yLabelFormatter}
      categoryKey={yKey}
      className={className}
      config={config}
      data={data}
      emptyLabel="No horizontal bar data"
      legend={legend}
      margin={HORIZONTAL_MARGIN}
      minHeight={minHeight}
      orientation="horizontal"
      renderer={renderer}
      roughOptions={roughOptions}
      valueFormatter={xValueFormatter}
      valueKey={xKey}
    />
  )
}
