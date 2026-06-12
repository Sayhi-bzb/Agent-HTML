import { localPoint } from "@visx/event"
import { Group } from "@visx/group"
import { scaleBand, scaleLinear, scalePoint, scaleTime } from "@visx/scale"
import { ParentSize } from "@visx/responsive"
import { TooltipWithBounds, useTooltip } from "@visx/tooltip"
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

export type ChartRenderer = "svg" | "rough"

export type ChartHoverKey = string | number

export interface ChartHoverState<TType extends string = string> {
  key: ChartHoverKey
  type: TType
}

export type ChartHoverPresence = "idle" | "highlighted" | "faded"

export const chartHoverOpacity = {
  activeMultiplier: 1.3,
  faded: 0.1,
  idle: 1,
  textFaded: 0.32,
  visualFaded: 0.4,
} as const

export const chartHoverTransition = {
  duration: 0.18,
  ease: "easeOut",
} as const

export function getChartHoverPresence({
  hover,
  isRelated,
}: {
  hover: ChartHoverState | null
  isRelated: boolean
}): ChartHoverPresence {
  if (!hover) {
    return "idle"
  }

  return isRelated ? "highlighted" : "faded"
}

export function getChartHoverOpacity({
  baseOpacity = chartHoverOpacity.idle,
  presence,
}: {
  baseOpacity?: number
  presence: ChartHoverPresence
}) {
  if (presence === "faded") {
    return chartHoverOpacity.faded
  }

  if (presence === "highlighted") {
    return Math.min(1, baseOpacity * chartHoverOpacity.activeMultiplier)
  }

  return baseOpacity
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
  empty: legacyEmpty,
  emptyData = legacyEmpty ?? null,
  emptySize = null,
  id,
  isEmpty = false,
  minHeight = 240,
  minWidth = 10,
  series,
}: {
  aspectRatio?: string
  children: (bounds: ChartBounds) => React.ReactNode
  className?: string
  config: ChartConfig
  /** @deprecated Use emptyData for data fallback or emptySize for measurement fallback. */
  empty?: React.ReactNode
  emptyData?: React.ReactNode
  emptySize?: React.ReactNode
  id?: string
  isEmpty?: boolean
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
            if (isEmpty) {
              return emptyData
            }

            if (width < minWidth || height < minHeight) {
              return emptySize
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

export interface ChartTooltipContentProps {
  className?: string
  hideIndicator?: boolean
  items: ChartTooltipItem[]
  label?: ReactNode
}

export interface ChartTooltipPoint {
  x: number
  y: number
}

export function useChartTooltip<TooltipData>() {
  const {
    hideTooltip,
    showTooltip,
    tooltipData,
    tooltipLeft,
    tooltipOpen,
    tooltipTop,
  } = useTooltip<TooltipData>()

  const showTooltipFromEvent = React.useCallback(
    (
      event: React.MouseEvent<Element> | React.PointerEvent<Element>,
      data: TooltipData
    ) => {
      const point = localPoint(event)

      if (!point) {
        return
      }

      showTooltip({
        tooltipData: data,
        tooltipLeft: point.x,
        tooltipTop: point.y,
      })
    },
    [showTooltip]
  )

  return {
    hideTooltip,
    showTooltipFromEvent,
    tooltipData,
    tooltipLeft,
    tooltipOpen,
    tooltipTop,
  }
}

export function ChartTooltipPanel({
  children,
  className,
  variant = "default",
}: {
  children: ReactNode
  className?: string
  variant?: "default" | "inverse"
}) {
  return (
    <div
      className={cn(
        variant === "inverse"
          ? "min-w-[140px] max-w-xs overflow-hidden rounded-md bg-foreground text-background shadow-md"
          : "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {children}
    </div>
  )
}

export function ChartTooltipContent({
  className,
  hideIndicator = false,
  items,
  label,
}: ChartTooltipContentProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <ChartTooltipPanel className={className}>
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
    </ChartTooltipPanel>
  )
}

export function ChartTooltip({
  children,
  className,
  offset = 12,
  visible,
  x,
  y,
}: {
  children: ReactNode
  className?: string
  offset?: number
  visible: boolean
  x: number
  y: number
}) {
  if (!visible) {
    return null
  }

  return (
    <TooltipWithBounds
      applyPositionStyle
      className={cn("pointer-events-none z-50", className)}
      left={x}
      offsetLeft={offset}
      offsetTop={offset}
      top={y}
      unstyled
    >
      {children}
    </TooltipWithBounds>
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

export function ChartHitPath({
  d,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
}: {
  d: string
  onPointerEnter?: React.PointerEventHandler<SVGPathElement>
  onPointerLeave?: React.PointerEventHandler<SVGPathElement>
  onPointerMove?: React.PointerEventHandler<SVGPathElement>
}) {
  return (
    <path
      d={d}
      fill="transparent"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
      pointerEvents="all"
      stroke="transparent"
    />
  )
}

export function ChartHitRect({
  height,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  width,
  x,
  y,
}: {
  height: number
  onPointerEnter?: React.PointerEventHandler<SVGRectElement>
  onPointerLeave?: React.PointerEventHandler<SVGRectElement>
  onPointerMove?: React.PointerEventHandler<SVGRectElement>
  width: number
  x: number
  y: number
}) {
  return (
    <rect
      fill="transparent"
      height={height}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
      pointerEvents="all"
      stroke="transparent"
      width={width}
      x={x}
      y={y}
    />
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

export function ChartXAxisGrid({
  formatTick,
  innerHeight,
  scale,
  ticks = 4,
}: {
  formatTick: (value: number) => ReactNode
  innerHeight: number
  scale: ReturnType<typeof scaleLinear<number>>
  ticks?: number
}) {
  return (
    <>
      {scale.ticks(ticks).map((tick) => {
        const tickX = scale(tick)

        return (
          <g key={tick}>
            <line
              className="stroke-border/50"
              strokeDasharray="3 3"
              x1={tickX}
              x2={tickX}
              y1={0}
              y2={innerHeight}
            />
            <text
              className="fill-muted-foreground text-[0.68rem]"
              dy="0.72em"
              textAnchor="middle"
              x={tickX}
              y={innerHeight + 12}
            >
              {formatTick(tick)}
            </text>
          </g>
        )
      })}
    </>
  )
}

export function ChartReferenceLine({
  innerWidth,
  y,
}: {
  innerWidth: number
  y: number
}) {
  return (
    <line
      className="stroke-border"
      strokeDasharray="3 3"
      x1={0}
      x2={innerWidth}
      y1={y}
      y2={y}
    />
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

export type SvgOnlyChartRenderer = Extract<ChartRenderer, "svg">

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
  getColorKey,
  getKey,
  options,
  rows,
}: {
  getColorKey?: (row: T) => string
  getKey: (row: T) => string
  options?: TOptions
  rows: readonly T[]
}) {
  const resolveColorKey = getColorKey ?? getKey

  return new Map(
    rows.map((row) => {
      const key = getKey(row)
      const color = getChartCssVariable(resolveColorKey(row))

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
