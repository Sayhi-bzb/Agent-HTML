import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import {
  clusterDefaults,
  gridDefaults,
  layoutGapClassMap,
  pageDefaults,
  stackDefaults,
} from "@/agent-html/schema/defaults"

type Gap = keyof typeof layoutGapClassMap

function resolveGap(gap?: string, fallback: Gap = "md") {
  return layoutGapClassMap[(gap as Gap) ?? fallback] ?? layoutGapClassMap[fallback]
}

export function PageRuntime({
  children,
  gap = pageDefaults.gap,
}: {
  children: ReactNode
  gap?: string
}) {
  return <div className={cn("flex flex-col", resolveGap(gap, "md"))}>{children}</div>
}

export function StackRuntime({
  children,
  gap = stackDefaults.gap,
}: {
  children: ReactNode
  gap?: string
}) {
  return <div className={cn("flex flex-col", resolveGap(gap, "md"))}>{children}</div>
}

export function ClusterRuntime({
  children,
  gap = clusterDefaults.gap,
  justify = clusterDefaults.justify,
  wrap = clusterDefaults.wrap,
}: {
  children: ReactNode
  gap?: string
  justify?: string
  wrap?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center",
        wrap === "false" ? "flex-nowrap" : "flex-wrap",
        justify === "center" && "justify-center",
        justify === "end" && "justify-end",
        justify === "between" && "justify-between",
        justify !== "center" &&
          justify !== "end" &&
          justify !== "between" &&
          "justify-start",
        resolveGap(gap, "md")
      )}
    >
      {children}
    </div>
  )
}

export function GridRuntime({
  children,
  columns = gridDefaults.columns,
  gap = gridDefaults.gap,
}: {
  children: ReactNode
  columns?: string
  gap?: string
}) {
  return (
    <div
      className={cn(
        "grid",
        columns === "1" && "grid-cols-1",
        columns === "2" && "grid-cols-2",
        columns === "3" && "grid-cols-3",
        columns === "4" && "grid-cols-4",
        resolveGap(gap, "md")
      )}
    >
      {children}
    </div>
  )
}


