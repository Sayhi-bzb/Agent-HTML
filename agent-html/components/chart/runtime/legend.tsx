import type { ReactNode } from "react"

import { cn } from "@/lib/cn"

import type { ChartResolvedSeries } from "./types"

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
            <span>{item.label as ReactNode}</span>
          </div>
        )
      })}
    </div>
  )
}
