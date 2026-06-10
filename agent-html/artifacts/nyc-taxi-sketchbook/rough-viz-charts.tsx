import { useEffect, useId } from "react"
import { Bar, BarH, type RoughVizBarData, type RoughVizBarOptions } from "rough-viz"

type RoughBarCommonProps = Omit<RoughVizBarOptions, "data" | "element"> & {
  className?: string
  data: RoughVizBarData
  heightClassName?: string
}

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

    const chart = new Bar({
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

    const chart = new BarH({
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
