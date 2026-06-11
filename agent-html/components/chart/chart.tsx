import { localPoint } from "@visx/event"
import { Group } from "@visx/group"
import { scaleBand, scaleLinear, scalePoint, scaleTime } from "@visx/scale"
import { ParentSize } from "@visx/responsive"
import * as React from "react"
import type { ComponentType, ReactNode } from "react"

import { cn } from "@/lib/cn"

const THEMES = { light: "", dark: ".dark" } as const

export type ChartThemeName = keyof typeof THEMES

export type ChartConfig = Record<
  string,
  {
    label?: ReactNode
    icon?: ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<ChartThemeName, string> }
  )
>

export interface ChartSeries {
  key: string
  label?: ReactNode
  color?: string
  icon?: ComponentType
}

export interface ChartResolvedSeries {
  key: string
  label: ReactNode
  color: string
  icon?: ComponentType
}

export const chartThemes = THEMES

export const defaultChartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const

export function getChartConfigItem(config: ChartConfig, key: string) {
  return config[key]
}

export function getChartSeriesColor({
  config,
  index = 0,
  key,
  series,
  theme = "light",
}: {
  config: ChartConfig
  index?: number
  key: string
  series?: ChartSeries
  theme?: ChartThemeName
}) {
  const configItem = getChartConfigItem(config, key)

  return (
    series?.color ??
    configItem?.color ??
    configItem?.theme?.[theme] ??
    defaultChartColors[index % defaultChartColors.length]
  )
}

export function resolveChartSeries({
  config,
  series,
}: {
  config: ChartConfig
  series?: ChartSeries[]
}): ChartResolvedSeries[] {
  const sourceSeries: ChartSeries[] =
    series && series.length > 0
      ? series
      : Object.keys(config).map((key) => ({ key }))

  return sourceSeries.map((item, index) => {
    const configItem = getChartConfigItem(config, item.key)

    return {
      key: item.key,
      label: item.label ?? configItem?.label ?? item.key,
      color: getChartSeriesColor({
        config,
        index,
        key: item.key,
        series: item,
      }),
      icon: item.icon ?? configItem?.icon,
    }
  })
}

export function getChartCssVariableName(key: string) {
  return `--color-${key}`
}

export function getChartCssVariable(key: string) {
  return `var(${getChartCssVariableName(key)})`
}

export function ChartStyle({
  config,
  id,
}: {
  config: ChartConfig
  id: string
}) {
  const colorConfig = Object.entries(config).filter(
    ([, item]) => item.theme ?? item.color
  )

  if (colorConfig.length === 0) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(chartThemes)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, item]) => {
    const color =
      item.theme?.[theme as keyof typeof item.theme] ?? item.color
    return color ? `  ${getChartCssVariableName(key)}: ${color};` : null
  })
  .filter(Boolean)
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

export interface ChartBounds {
  height: number
  id: string
  series: ChartResolvedSeries[]
  width: number
}

interface ChartContextValue {
  config: ChartConfig
  id: string
  series: ChartResolvedSeries[]
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

export function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

export function ChartContainer({
  aspectRatio = "16 / 9",
  children,
  className,
  config,
  empty = null,
  id,
  minHeight = 240,
  minWidth = 10,
  series,
}: {
  aspectRatio?: string
  children: (bounds: ChartBounds) => React.ReactNode
  className?: string
  config: ChartConfig
  empty?: React.ReactNode
  id?: string
  minHeight?: number
  minWidth?: number
  series?: ChartSeries[]
}) {
  const reactId = React.useId()
  const chartId = `chart-${id ?? reactId.replace(/:/g, "")}`
  const resolvedSeries = React.useMemo(
    () => resolveChartSeries({ config, series }),
    [config, series]
  )

  return (
    <ChartContext.Provider
      value={{ config, id: chartId, series: resolvedSeries }}
    >
      <div
        className={cn("relative w-full text-xs", className)}
        data-chart={chartId}
        data-slot="chart"
        style={{ aspectRatio, minHeight }}
      >
        <ChartStyle config={config} id={chartId} />
        <ParentSize>
          {({ height, width }) => {
            if (width < minWidth || height < minHeight) {
              return empty
            }

            return children({
              height,
              id: chartId,
              series: resolvedSeries,
              width,
            })
          }}
        </ParentSize>
      </div>
    </ChartContext.Provider>
  )
}

export interface ChartTooltipItem {
  color: string
  key: string
  label: ReactNode
  value: ReactNode
}

export function ChartTooltipContent({
  className,
  hideIndicator = false,
  items,
  label,
}: {
  className?: string
  hideIndicator?: boolean
  items: ChartTooltipItem[]
  label?: ReactNode
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {label ? <div className="font-medium">{label}</div> : null}
      <div className="grid gap-1.5">
        {items.map((item) => (
          <div className="flex items-center gap-2" key={item.key}>
            {hideIndicator ? null : (
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span className="text-muted-foreground">{item.label}</span>
            <span className="ml-auto font-mono font-medium text-foreground tabular-nums">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ChartTooltip({
  children,
  className,
  visible,
  x,
  y,
}: {
  children: ReactNode
  className?: string
  visible: boolean
  x: number
  y: number
}) {
  if (!visible) {
    return null
  }

  return (
    <div
      className={cn("pointer-events-none absolute z-50", className)}
      style={{ left: x, top: y }}
    >
      {children}
    </div>
  )
}

export function ChartLegend({
  className,
  hideIcon = false,
  series,
}: {
  className?: string
  hideIcon?: boolean
  series: ChartResolvedSeries[]
}) {
  if (series.length === 0) {
    return null
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      {series.map((item) => {
        const Icon = item.icon

        return (
          <div className="flex items-center gap-1.5" key={item.key}>
            {Icon && !hideIcon ? (
              <Icon />
            ) : (
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
            )}
            <span>{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export function ChartSvg({
  children,
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={cn("h-full w-full overflow-visible", className)} {...props}>
      {children}
    </svg>
  )
}

export interface ChartMargin {
  bottom: number
  left: number
  right: number
  top: number
}

export interface CartesianLayoutOptions {
  margin?: Partial<ChartMargin>
}

export interface CartesianLayout {
  height: number
  innerHeight: number
  innerWidth: number
  margin: ChartMargin
  width: number
}

export const defaultCartesianMargin: ChartMargin = {
  bottom: 28,
  left: 40,
  right: 16,
  top: 16,
}

export function createCartesianLayout({
  height,
  margin,
  width,
}: CartesianLayoutOptions & {
  height: number
  width: number
}): CartesianLayout {
  const resolvedMargin = { ...defaultCartesianMargin, ...margin }

  return {
    height,
    innerHeight: Math.max(0, height - resolvedMargin.top - resolvedMargin.bottom),
    innerWidth: Math.max(0, width - resolvedMargin.left - resolvedMargin.right),
    margin: resolvedMargin,
    width,
  }
}

export function ChartCartesianGroup({
  children,
  layout,
}: {
  children: ReactNode
  layout: CartesianLayout
}) {
  return (
    <Group left={layout.margin.left} top={layout.margin.top}>
      {children}
    </Group>
  )
}

export function ChartYAxisGrid({
  formatTick,
  innerWidth,
  scale,
  ticks = 4,
}: {
  formatTick: (value: number) => ReactNode
  innerWidth: number
  scale: ReturnType<typeof scaleLinear<number>>
  ticks?: number
}) {
  return (
    <>
      {scale.ticks(ticks).map((tick) => {
        const tickY = scale(tick)

        return (
          <g key={tick}>
            <line
              className="stroke-border/50"
              strokeDasharray="3 3"
              x1={0}
              x2={innerWidth}
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
              {formatTick(tick)}
            </text>
          </g>
        )
      })}
    </>
  )
}

export function ChartXAxisLabels<T>({
  data,
  formatTick,
  innerHeight,
  x,
  xKey,
}: {
  data: readonly T[]
  formatTick?: (value: string) => ReactNode
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

export type ChartAccessor<T, TValue> = keyof T | ((datum: T) => TValue)

export function getValue<T, TValue>(
  datum: T,
  accessor: ChartAccessor<T, TValue>
): TValue {
  if (typeof accessor === "function") {
    return accessor(datum)
  }

  return datum[accessor] as TValue
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

export function getFiniteValues<T>(
  data: T[],
  accessor: ChartAccessor<T, number>
) {
  return data.map((datum) => getValue(datum, accessor)).filter(isFiniteNumber)
}

export function getPointerPoint(event: React.PointerEvent<SVGElement>) {
  return localPoint(event)
}

export function getNearestDatum<T>({
  data,
  pointerX,
  x,
}: {
  data: readonly T[]
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

export function createRoughOptionsByKey<T, TOptions extends object>({
  getKey,
  options,
  rows,
}: {
  getKey: (row: T) => string
  options?: TOptions
  rows: readonly T[]
}) {
  return new Map(
    rows.map((row) => {
      const key = getKey(row)
      const color = getChartCssVariable(key)

      return [
        key,
        {
          fill: color,
          stroke: color,
          ...options,
        },
      ] as const
    })
  )
}

export function getNumberDomain(values: number[]) {
  if (values.length === 0) {
    return [0, 1]
  }

  const min = Math.min(...values)
  const max = Math.max(...values)

  if (min === max) {
    return [Math.min(0, min), max + 1]
  }

  return [Math.min(0, min), max]
}

export function createLinearScale({
  range,
  values,
}: {
  range: [number, number]
  values: number[]
}) {
  return scaleLinear({
    domain: getNumberDomain(values),
    nice: true,
    range,
  })
}

export function createBandScale<T>({
  data,
  padding = 0.2,
  range,
  x,
}: {
  data: T[]
  padding?: number
  range: [number, number]
  x: ChartAccessor<T, string>
}) {
  return scaleBand<string>({
    domain: data.map((datum) => getValue(datum, x)),
    padding,
    range,
  })
}

export function createPointScale<T>({
  data,
  range,
  x,
}: {
  data: T[]
  range: [number, number]
  x: ChartAccessor<T, string>
}) {
  return scalePoint<string>({
    domain: data.map((datum) => getValue(datum, x)),
    range,
  })
}

export function createTimeScale<T>({
  data,
  range,
  x,
}: {
  data: T[]
  range: [number, number]
  x: ChartAccessor<T, Date>
}) {
  const values = data
    .map((datum) => getValue(datum, x).getTime())
    .filter(isFiniteNumber)

  const [min, max] =
    values.length > 0
      ? [Math.min(...values), Math.max(...values)]
      : [Date.now(), Date.now() + 1]

  return scaleTime({
    domain: [new Date(min), new Date(max)],
    range,
  })
}
