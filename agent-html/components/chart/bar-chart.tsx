import * as React from "react"

import {
  type ChartTextureOptions,
  ChartRenderedRect,
} from "./runtime"
import {
  type ChartAccessor,
  type ChartConfig,
  type ChartRoughOptions,
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
  type ChartTooltipField,
  ChartXAxisGrid,
  ChartYAxisGrid,
  createBandScale,
  createCartesianLayout,
  createLinearScale,
  getFiniteValues,
  getValue,
  isFiniteNumber,
  resolveChartRenderer,
  resolveChartTooltipItems,
  useChartMarkInteraction,
  useChartMaterialRegistry,
} from "./runtime"

export interface BarChartProps<T> {
  aspectRatio?: string
  className?: string
  config?: ChartConfig
  data: readonly T[]
  legend?: boolean
  minHeight?: number
  renderTooltip?: (props: {
    category: string
    datum: T
    label: React.ReactNode
    value: number
  }) => React.ReactNode
  renderer?: ChartRenderer
  rough?: ChartRoughOptions
  texture?: ChartTextureOptions
  tooltipFields?: readonly ChartTooltipField<T>[]
  tooltipLabel?: ChartAccessor<T, React.ReactNode>
  xKey: ChartAccessor<T, string>
  xLabelFormatter?: (value: string) => React.ReactNode
  yKey: ChartAccessor<T, number>
  yValueFormatter?: (value: number) => React.ReactNode
}

export interface BarHChartProps<T> {
  aspectRatio?: string
  className?: string
  config?: ChartConfig
  data: readonly T[]
  legend?: boolean
  minHeight?: number
  renderTooltip?: (props: {
    category: string
    datum: T
    label: React.ReactNode
    value: number
  }) => React.ReactNode
  renderer?: ChartRenderer
  rough?: ChartRoughOptions
  texture?: ChartTextureOptions
  tooltipFields?: readonly ChartTooltipField<T>[]
  tooltipLabel?: ChartAccessor<T, React.ReactNode>
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
  config?: ChartConfig
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
  renderTooltip?: (props: {
    category: string
    datum: T
    label: React.ReactNode
    value: number
  }) => React.ReactNode
  renderer: ChartRenderer
  rough?: ChartRoughOptions
  texture?: ChartTextureOptions
  tooltipFields?: readonly ChartTooltipField<T>[]
  tooltipLabel?: ChartAccessor<T, React.ReactNode>
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
  renderTooltip,
  renderer,
  rough,
  texture,
  tooltipFields,
  tooltipLabel,
  valueFormatter,
  valueKey,
}: BarCoreProps<T>) {
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
  } = useChartMarkInteraction<TooltipState<T>, "bar">()
  const rows = React.useMemo(() => Array.from(data), [data])
  const categoryKeys = React.useMemo(
    () => rows.map((datum) => getValue(datum, categoryKey)),
    [categoryKey, rows]
  )
  const materials = useChartMaterialRegistry({
    config,
    keys: categoryKeys,
    renderer: resolvedRenderer,
    rough,
    scope: `bar:${orientation}`,
    strategy: "categorical",
    texture,
  })

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={className}
      config={materials.resolvedConfig}
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
        return (
          <ChartInteractionRoot onPointerLeave={hideTooltip}>
            <ChartSvg aria-label={ariaLabel} role="img">
              {materials.defs}
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
                  const material = materials.getMaterial(category)
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
                        <ChartRenderedRect
                          color={material.color}
                          height={rect.height}
                          renderer={material.renderer}
                          rough={material.rough}
                          textureIndex={material.textureIndex}
                          textureKey={material.textureKey}
                          texture={material.texture}
                          textureScopeId={material.textureScopeId}
                          width={rect.width}
                          x={rect.x}
                          y={rect.y}
                        />
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
                (() => {
                  const category = getValue(tooltip.datum, categoryKey)
                  const label = formatCategory({
                    categoryFormatter,
                    categoryKey,
                    datum: tooltip.datum,
                  })
                  const tooltipHeader = tooltipLabel
                    ? getValue(tooltip.datum, tooltipLabel)
                    : label
                  const value = getValue(tooltip.datum, valueKey)

                  return (
                    renderTooltip ? (
                      renderTooltip({
                        category,
                        datum: tooltip.datum,
                        label: tooltipHeader,
                        value,
                      })
                    ) : (
                      <ChartTooltipContent
                        items={
                          tooltipFields
                            ? resolveChartTooltipItems({
                                color: materials.getMaterial(category).color,
                                datum: tooltip.datum,
                                fields: tooltipFields,
                              })
                            : [
                                {
                                  color: materials.getMaterial(category).color,
                                  key: category,
                                  label,
                                  value: valueFormatter(value),
                                },
                              ]
                        }
                        label={tooltipHeader}
                      />
                    )
                  )
                })()
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
  renderTooltip,
  renderer = "svg",
  rough,
  texture,
  tooltipFields,
  tooltipLabel,
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
      renderTooltip={renderTooltip}
      renderer={renderer}
      rough={rough}
      texture={texture}
      tooltipFields={tooltipFields}
      tooltipLabel={tooltipLabel}
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
  renderTooltip,
  renderer = "svg",
  rough,
  texture,
  tooltipFields,
  tooltipLabel,
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
      renderTooltip={renderTooltip}
      renderer={renderer}
      rough={rough}
      texture={texture}
      tooltipFields={tooltipFields}
      tooltipLabel={tooltipLabel}
      valueFormatter={xValueFormatter}
      valueKey={xKey}
    />
  )
}
