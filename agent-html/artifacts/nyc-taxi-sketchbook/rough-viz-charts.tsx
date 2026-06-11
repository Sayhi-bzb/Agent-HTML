import { useEffect, useId } from "react"
import * as roughViz from "rough-viz"
import type {
  RoughVizBarData,
  RoughVizBarOptions,
  RoughVizPieData,
  RoughVizPieOptions,
} from "rough-viz"

type RoughBarCommonProps = Omit<RoughVizBarOptions, "data" | "element"> & {
  className?: string
  data: RoughVizBarData
  heightClassName?: string
}

type RoughPieChartProps = Omit<RoughVizPieOptions, "data" | "element"> & {
  className?: string
  data: RoughVizPieData
  heightClassName?: string
}

export const roughSketchChartStyle = {
  axisRoughness: 1.2,
  axisStrokeWidth: 1,
  fillStyle: "hachure",
  fillWeight: 1,
  innerStrokeWidth: 1,
  roughness: 4,
  stroke: "var(--foreground)",
  strokeWidth: 1,
} satisfies Omit<RoughVizBarOptions, "data" | "element">

export const roughTaxiChartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--muted-foreground)",
  "var(--border)",
]

function useRoughChartId(prefix: string) {
  const reactId = useId()
  return `${prefix}-${reactId.replace(/:/g, "")}`
}

function RoughChartShell({
  className,
  heightClassName = "min-h-[360px] [&_svg]:min-h-[360px]",
  id,
}: {
  className?: string
  heightClassName?: string
  id: string
}) {
  return (
    <div
      className={`${heightClassName} w-full [&_svg]:w-full ${className ?? ""}`}
      id={id}
    />
  )
}

function optionsKey(options: Omit<RoughVizBarOptions, "data" | "element">) {
  return JSON.stringify(options)
}

export function RoughBarChart({
  className,
  data,
  heightClassName,
  ...options
}: RoughBarCommonProps) {
  const elementId = useRoughChartId("rough-bar")
  const renderKey = optionsKey(options)

  useEffect(() => {
    const element = document.getElementById(elementId)
    if (!element) return

    element.replaceChildren()

    const chart = new roughViz.Bar({
      data,
      element: `#${elementId}`,
      ...options,
    })

    return () => {
      chart.remove()
      element.replaceChildren()
    }
  }, [data, elementId, options, renderKey])

  return (
    <RoughChartShell
      className={className}
      heightClassName={heightClassName}
      id={elementId}
    />
  )
}

export function RoughBarHChart({
  className,
  data,
  heightClassName,
  ...options
}: RoughBarCommonProps) {
  const elementId = useRoughChartId("rough-barh")
  const renderKey = optionsKey(options)

  useEffect(() => {
    const element = document.getElementById(elementId)
    if (!element) return

    element.replaceChildren()

    const chart = new roughViz.BarH({
      data,
      element: `#${elementId}`,
      ...options,
    })

    return () => {
      chart.remove()
      element.replaceChildren()
    }
  }, [data, elementId, options, renderKey])

  return (
    <RoughChartShell
      className={className}
      heightClassName={heightClassName}
      id={elementId}
    />
  )
}

export function RoughPieChart({
  className,
  data,
  heightClassName = "min-h-[380px] [&_svg]:min-h-[380px]",
  ...options
}: RoughPieChartProps) {
  const elementId = useRoughChartId("rough-pie")
  const renderKey = optionsKey(options)

  useEffect(() => {
    const element = document.getElementById(elementId)
    if (!element) return

    element.replaceChildren()

    const chart = new roughViz.Pie({
      data,
      element: `#${elementId}`,
      ...options,
    })

    return () => {
      chart.remove()
      element.replaceChildren()
    }
  }, [data, elementId, options, renderKey])

  return (
    <RoughChartShell
      className={className}
      heightClassName={heightClassName}
      id={elementId}
    />
  )
}
