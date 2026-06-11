import type { Options as RoughOptions } from "roughjs/bin/core"
import type { RoughVizBarOptions } from "rough-viz"

const roughSketchBase = {
  fillStyle: "hachure",
  fillWeight: 1,
  roughness: 4,
  strokeWidth: 1,
}

export const roughSketchChartStyle = {
  ...roughSketchBase,
  axisRoughness: 1.2,
  axisStrokeWidth: 1,
  innerStrokeWidth: 1,
  stroke: "var(--foreground)",
} satisfies Omit<RoughVizBarOptions, "data" | "element">

export const roughSketchMarkOptions = {
  ...roughSketchBase,
  stroke: "currentColor",
} satisfies RoughOptions

export const roughTaxiChartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--muted-foreground)",
  "var(--border)",
]
