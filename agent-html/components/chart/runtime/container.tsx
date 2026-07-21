import { ParentSize } from "@visx/responsive"
import * as React from "react"

import { cn } from "@/lib/cn"

import type { ChartBounds, ChartConfig, ChartResolvedSeries, ChartSeries } from "./types"
import { ChartStyle, resolveChartSeries } from "./theme"

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
  emptyData = null,
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
