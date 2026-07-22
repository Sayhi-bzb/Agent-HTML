import { AxisBottom, AxisLeft } from "@visx/axis"
import { GridColumns, GridRows } from "@visx/grid"
import { Group } from "@visx/group"
import type { scaleLinear } from "@visx/scale"
import type { ReactNode } from "react"

import type { ChartMargin } from "./types"

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
      <GridRows
        numTicks={ticks}
        scale={scale}
        stroke="var(--border)"
        strokeDasharray="3 3"
        strokeOpacity={0.5}
        width={innerWidth}
      />
      <AxisLeft
        hideAxisLine
        hideTicks
        numTicks={ticks}
        scale={scale}
        tickFormat={(value) => String(formatTick(Number(value)))}
        tickLabelProps={() => ({
          className: "fill-muted-foreground text-2xs",
          dx: -8,
          dy: "0.32em",
          textAnchor: "end",
        })}
      />
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
      <GridColumns
        height={innerHeight}
        numTicks={ticks}
        scale={scale}
        stroke="var(--border)"
        strokeDasharray="3 3"
        strokeOpacity={0.5}
      />
      <AxisBottom
        hideAxisLine
        hideTicks
        numTicks={ticks}
        scale={scale}
        tickFormat={(value) => String(formatTick(Number(value)))}
        tickLabelProps={() => ({
          className: "fill-muted-foreground text-2xs",
          dy: "0.72em",
          textAnchor: "middle",
        })}
        top={innerHeight}
      />
    </>
  )
}
