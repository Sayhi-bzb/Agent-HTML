import * as React from "react"

import type { AgentHtmlElementNode } from "@/agent-html/ast/types"
import { schedulePostReadyTask } from "@/agent-html/runtime/scheduling/post-ready-task-scheduler"
import { RuntimeSkeleton } from "@/agent-html/runtime/ui/skeleton"

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const

const LazyChartRuntimeModule = React.lazy(() =>
  import("@/agent-html/runtime/render/chart-runtime").then((module) => ({
    default: module.ChartRuntime,
  }))
)

function isElement(
  node: AgentHtmlElementNode["children"][number]
): node is AgentHtmlElementNode {
  return node.type === "element"
}

function ChartRuntimeFallback({ node }: { node: AgentHtmlElementNode }) {
  const chartCssVariables = Object.fromEntries(
    node.children
      .filter(
        (child): child is AgentHtmlElementNode =>
          isElement(child) && child.tag === "ChartSeries"
      )
      .map((series, index) => [
        `--color-${series.attrs.key}`,
        chartColors[index % chartColors.length],
      ])
  ) as React.CSSProperties

  return (
    <div
      aria-busy="true"
      aria-label="Chart loading"
      className="h-60 w-full rounded-md border bg-muted/20 p-4"
      data-slot="chart"
      data-chart-state="loading"
      role="status"
      style={chartCssVariables}
    >
      <div className="relative h-full w-full overflow-hidden rounded-sm">
        <RuntimeSkeleton className="absolute inset-0 bg-muted/50" />
        <div className="absolute inset-x-4 top-1/4 h-px bg-border/50" />
        <div className="absolute inset-x-4 top-1/2 h-px bg-border/40" />
        <div className="absolute inset-x-4 top-3/4 h-px bg-border/30" />
        <RuntimeSkeleton className="absolute bottom-4 left-4 h-2 w-1/3 bg-muted" />
        <RuntimeSkeleton className="absolute bottom-4 right-4 h-2 w-1/5 bg-muted" />
      </div>
    </div>
  )
}

export function LazyChartRuntime({ node }: { node: AgentHtmlElementNode }) {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const [canLoadChartRuntime, setCanLoadChartRuntime] = React.useState(false)
  const chartType = node.attrs.type

  React.useEffect(() => {
    if (typeof window === "undefined" || canLoadChartRuntime) {
      return
    }

    let scheduledLoad: { cancel: () => void } | null = null
    const scheduleChartLoad = () => {
      if (scheduledLoad) {
        return
      }

      scheduledLoad = schedulePostReadyTask({
        delay: 900,
        id: `chart-runtime:${chartType}`,
        idleTimeout: 2200,
        priority: "visible-enhancement",
        run: () => {
          setCanLoadChartRuntime(true)
        },
      })
    }

    if (!("IntersectionObserver" in window)) {
      scheduleChartLoad()
      return () => {
        scheduledLoad?.cancel()
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect()
          scheduleChartLoad()
        }
      },
      { rootMargin: "160px" }
    )
    const root = rootRef.current
    if (root) {
      observer.observe(root)
    } else {
      scheduleChartLoad()
    }

    return () => {
      observer.disconnect()
      scheduledLoad?.cancel()
    }
  }, [canLoadChartRuntime, chartType])

  return (
    <div ref={rootRef}>
      {canLoadChartRuntime ? (
        <React.Suspense fallback={<ChartRuntimeFallback node={node} />}>
          <LazyChartRuntimeModule node={node} />
        </React.Suspense>
      ) : (
        <ChartRuntimeFallback node={node} />
      )}
    </div>
  )
}
