import { localPoint } from "@visx/event"
import { TooltipWithBounds, useTooltip } from "@visx/tooltip"
import * as React from "react"
import type { ReactNode } from "react"

import { cn } from "@/lib/cn"

import { getValue } from "./data"
import {
  type ChartHoverKey,
  type ChartHoverState,
  type ChartMarkState,
  getChartMarkKey,
  getChartMarkOpacity,
  getChartMarkPresence,
} from "./interaction"
import { chartMotion } from "./motion"
import type { ChartAccessor } from "./types"

export interface ChartTooltipItem {
  color: string
  key: string
  label: ReactNode
  value: ReactNode
}

export interface ChartTooltipField<T> {
  color?: string | ((datum: T) => string)
  formatter?: (value: unknown, datum: T) => ReactNode
  key: string
  label: ReactNode
  value: ChartAccessor<T, unknown> | ((datum: T) => ReactNode)
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

export function useChartMarkTooltip<
  TooltipData,
  THoverType extends string = string,
>() {
  const [hover, setHover] = React.useState<ChartHoverState<THoverType> | null>(
    null
  )
  const [activeTooltipData, setActiveTooltipData] =
    React.useState<TooltipData | null>(null)
  const {
    hideTooltip: hideChartTooltip,
    showTooltipFromEvent,
    tooltipData,
    tooltipLeft,
    tooltipOpen,
    tooltipTop,
  } = useChartTooltip<TooltipData>()

  const hideTooltip = React.useCallback(() => {
    setHover(null)
    setActiveTooltipData(null)
    hideChartTooltip()
  }, [hideChartTooltip])
  const showTooltip = React.useCallback(
    (
      event: React.MouseEvent<Element> | React.PointerEvent<Element>,
      data: TooltipData
    ) => {
      setActiveTooltipData(data)
      showTooltipFromEvent(event, data)
    },
    [showTooltipFromEvent]
  )
  const followTooltip = React.useCallback(
    (event: React.MouseEvent<Element> | React.PointerEvent<Element>) => {
      if (activeTooltipData) {
        showTooltipFromEvent(event, activeTooltipData)
      }
    },
    [activeTooltipData, showTooltipFromEvent]
  )

  return {
    activeTooltipData,
    currentTooltipData: tooltipData ?? activeTooltipData,
    followTooltip,
    hideMark: hideTooltip,
    hideTooltip,
    hover,
    moveMark: followTooltip,
    setHover,
    showMark: showTooltip,
    showTooltip,
    tooltipLeft,
    tooltipOpen,
    tooltipTop,
  }
}

export function useChartMarkInteraction<
  TooltipData,
  THoverType extends string = string,
>() {
  const markTooltip = useChartMarkTooltip<TooltipData, THoverType>()
  const getMarkKey = React.useCallback(
    (...parts: Array<ChartHoverKey | null | undefined>) =>
      getChartMarkKey(...parts),
    []
  )
  const getMarkState = React.useCallback(
    ({
      baseOpacity,
      isRelated,
      key,
    }: {
      baseOpacity?: number
      isRelated?: boolean
      key: ChartHoverKey
    }): ChartMarkState => {
      const presence = getChartMarkPresence({
        hover: markTooltip.hover,
        isRelated,
        key,
      })

      return {
        isFaded: presence === "faded",
        isHighlighted: presence === "highlighted",
        opacity: getChartMarkOpacity({ baseOpacity, presence }),
        presence,
      }
    },
    [markTooltip.hover]
  )
  const getMarkMotion = React.useCallback(
    (options: {
      baseOpacity?: number
      isRelated?: boolean
      key: ChartHoverKey
    }) => {
      const state = getMarkState(options)

      return {
        animate: { opacity: state.opacity },
        initial: false,
        transition: chartMotion.hover,
      } as const
    },
    [getMarkState]
  )
  const showMark = React.useCallback(
    ({
      data,
      event,
      key,
      type,
    }: {
      data: TooltipData
      event: React.MouseEvent<Element> | React.PointerEvent<Element>
      key: ChartHoverKey
      type: THoverType
    }) => {
      markTooltip.setHover({ key, type })
      markTooltip.showTooltip(event, data)
    },
    [markTooltip]
  )

  return {
    ...markTooltip,
    getMarkKey,
    getMarkMotion,
    getMarkState,
    showMark,
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

export function resolveChartTooltipItems<T>({
  color,
  datum,
  fields,
}: {
  color: string
  datum: T
  fields: readonly ChartTooltipField<T>[]
}): ChartTooltipItem[] {
  return fields.map((field) => {
    const value = getValue(datum, field.value)
    const formattedValue = field.formatter
      ? field.formatter(value, datum)
      : typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "bigint"
        ? value
        : value == null
          ? null
          : String(value)

    return {
      color:
        typeof field.color === "function"
          ? field.color(datum)
          : field.color ?? color,
      key: field.key,
      label: field.label,
      value: formattedValue,
    }
  })
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
