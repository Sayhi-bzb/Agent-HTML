import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { clusterDefaults, gridDefaults, layoutDefaultGapClass } from "@/agent-html/schema/defaults"

export function PageRuntime({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className={cn("flex flex-col", layoutDefaultGapClass)}>
      {children}
    </div>
  )
}

export function StackRuntime({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className={cn("flex flex-col", layoutDefaultGapClass)}>
      {children}
    </div>
  )
}

export function ClusterRuntime({
  children,
  justify = clusterDefaults.justify,
  wrap = clusterDefaults.wrap,
}: {
  children: ReactNode
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
        layoutDefaultGapClass
      )}
    >
      {children}
    </div>
  )
}

export function GridRuntime({
  children,
  columns = gridDefaults.columns,
}: {
  children: ReactNode
  columns?: string
}) {
  return (
    <div
      className={cn(
        "grid",
        columns === "1" && "grid-cols-1",
        columns === "2" && "grid-cols-2",
        columns === "3" && "grid-cols-3",
        columns === "4" && "grid-cols-4",
        layoutDefaultGapClass
      )}
    >
      {children}
    </div>
  )
}


