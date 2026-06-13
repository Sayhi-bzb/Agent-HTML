import type { Options as RoughOptions } from "roughjs/bin/core"
import type { ChartRoughOptions } from "../../components/chart/types"

const roughSketchBase = {
  fillStyle: "hachure",
  fillWeight: 1,
  hachureGap: 3.5,
  roughness: 4,
  strokeWidth: 1,
} satisfies ChartRoughOptions

export const roughSketchMarkOptions = {
  ...roughSketchBase,
  stroke: "currentColor",
} satisfies RoughOptions

export const roughSketchSankeyOptions = {
  ...roughSketchMarkOptions,
  hachureGap: 4,
} satisfies RoughOptions

export const roughTaxiChartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--muted-foreground)",
  "var(--border)",
]
