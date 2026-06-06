import type { ReactNode } from "react"

import { cn } from "@/agent-html/lib/utils"
import {
  clusterDefaults,
  gridDefaults,
  layoutDefaultGapClass,
  sectionDefaults,
} from "@/agent-html/schema/defaults"

export function CellRuntime({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className={cn("flex w-full min-w-0 flex-col", layoutDefaultGapClass)}>
      {children}
    </div>
  )
}

export function BlockRuntime({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div
      className="w-full min-w-0 rounded-[14px]"
      data-slot="agent-html-block-content"
    >
      {children}
    </div>
  )
}

export function SectionRuntime({
  children,
  width = sectionDefaults.width,
}: {
  children: ReactNode
  width?: string
}) {
  return (
    <section
      className={cn(
        "w-full min-w-0",
        width === "reader" && "mx-auto max-w-2xl",
        width === "content" && "mx-auto max-w-4xl"
      )}
    >
      {children}
    </section>
  )
}

export function StackRuntime({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className={cn("flex w-full min-w-0 flex-col", layoutDefaultGapClass)}>
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
        "flex w-full min-w-0 items-center",
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
        "grid w-full min-w-0",
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


