import * as React from "react"

import { chartMotion } from "./motion"

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

export const chartHoverTransition = chartMotion.hover

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

export function getChartMarkKey(
  ...parts: Array<ChartHoverKey | null | undefined>
) {
  return parts
    .filter((part): part is ChartHoverKey => part !== null && part !== undefined)
    .map((part) => encodeURIComponent(String(part)))
    .join(":")
}

export function getChartMarkPresence({
  hover,
  isRelated,
  key,
}: {
  hover: ChartHoverState | null
  isRelated?: boolean
  key: ChartHoverKey
}) {
  return getChartHoverPresence({
    hover,
    isRelated: isRelated ?? hover?.key === key,
  })
}

export function getChartMarkOpacity({
  baseOpacity,
  presence,
}: {
  baseOpacity?: number
  presence: ChartHoverPresence
}) {
  return getChartHoverOpacity({ baseOpacity, presence })
}

export interface ChartMarkState {
  isFaded: boolean
  isHighlighted: boolean
  opacity: number
  presence: ChartHoverPresence
}

export interface ChartMarkTooltipState<TooltipData, THoverType extends string> {
  activeTooltipData: TooltipData | null
  currentTooltipData: TooltipData | null
  followTooltip: (
    event: React.MouseEvent<Element> | React.PointerEvent<Element>
  ) => void
  hideMark: () => void
  hideTooltip: () => void
  hover: ChartHoverState<THoverType> | null
  moveMark: (
    event: React.MouseEvent<Element> | React.PointerEvent<Element>
  ) => void
  setHover: React.Dispatch<React.SetStateAction<ChartHoverState<THoverType> | null>>
  showMark: (
    event: React.MouseEvent<Element> | React.PointerEvent<Element>,
    data: TooltipData
  ) => void
  showTooltip: (
    event: React.MouseEvent<Element> | React.PointerEvent<Element>,
    data: TooltipData
  ) => void
  tooltipLeft?: number
  tooltipOpen: boolean
  tooltipTop?: number
}
