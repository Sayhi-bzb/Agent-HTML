import { buildChartTheme } from "@visx/xychart"
import type { ReactNode } from "react"

import type {
  ChartColorStrategy,
  ChartConfig,
  ChartResolvedSeries,
  ChartSeries,
  ChartThemeName,
} from "./types"
import { THEMES } from "./types"

export const chartThemes = THEMES

export const defaultChartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const

const sequentialChartColors = [
  "var(--chart-4)",
  "var(--chart-3)",
  "var(--chart-2)",
  "var(--chart-1)",
  "var(--foreground)",
] as const

function resolveStrategyColor({
  index,
  strategy,
}: {
  index: number
  strategy: ChartColorStrategy
}) {
  if (strategy === "single") {
    return defaultChartColors[0]
  }

  if (strategy === "sequential") {
    return sequentialChartColors[
      Math.min(index, sequentialChartColors.length - 1)
    ]
  }

  return defaultChartColors[index % defaultChartColors.length]
}

export function createDefaultChartConfig(
  keys: readonly string[],
  labels: Partial<Record<string, ReactNode>> = {},
  strategy: ChartColorStrategy = "categorical"
): ChartConfig {
  const uniqueKeys = Array.from(new Set(keys.filter(Boolean)))
  const resolvedKeys = uniqueKeys.length > 0 ? uniqueKeys : ["value"]

  return Object.fromEntries(
    resolvedKeys.map((key, index) => [
      key,
      {
        color: resolveStrategyColor({ index, strategy }),
        label: labels[key] ?? key,
      },
    ])
  ) satisfies ChartConfig
}

export function createChartColorConfig({
  keys,
  labels,
  strategy = "categorical",
}: {
  keys: readonly string[]
  labels?: Partial<Record<string, ReactNode>>
  strategy?: ChartColorStrategy
}) {
  return createDefaultChartConfig(keys, labels, strategy)
}

export function mergeChartConfig(
  defaultConfig: ChartConfig,
  config?: ChartConfig
): ChartConfig {
  return {
    ...defaultConfig,
    ...config,
  }
}

export const chartXYTheme = buildChartTheme({
  backgroundColor: "var(--background)",
  colors: [...defaultChartColors],
  gridColor: "var(--border)",
  gridColorDark: "var(--border)",
  gridStyles: {
    strokeDasharray: "3 3",
  },
  svgLabelSmall: {
    className: "fill-muted-foreground text-[0.68rem]",
    fill: "var(--muted-foreground)",
    fontSize: 10.88,
    fontWeight: 400,
    letterSpacing: 0,
  },
  tickLength: 0,
})

export function getChartConfigItem(config: ChartConfig, key: string) {
  return config[key]
}

export function getChartSeriesColor({
  config,
  index = 0,
  key,
  series,
  theme = "light",
}: {
  config: ChartConfig
  index?: number
  key: string
  series?: ChartSeries
  theme?: ChartThemeName
}) {
  const configItem = getChartConfigItem(config, key)

  return (
    series?.color ??
    configItem?.color ??
    configItem?.theme?.[theme] ??
    defaultChartColors[index % defaultChartColors.length]
  )
}

export function resolveChartSeries({
  config,
  series,
}: {
  config: ChartConfig
  series?: ChartSeries[]
}): ChartResolvedSeries[] {
  const sourceSeries: ChartSeries[] =
    series && series.length > 0
      ? series
      : Object.keys(config).map((key) => ({ key }))

  return sourceSeries.map((item, index) => {
    const configItem = getChartConfigItem(config, item.key)

    return {
      key: item.key,
      label: item.label ?? configItem?.label ?? item.key,
      color: getChartSeriesColor({
        config,
        index,
        key: item.key,
        series: item,
      }),
      icon: item.icon ?? configItem?.icon,
    }
  })
}

function getChartCssVariableKey(key: string) {
  const encodedKey = encodeURIComponent(key)
    .replace(/%/g, "_")
    .replace(/[^A-Za-z0-9_-]/g, "_")

  return encodedKey || "value"
}

export function getChartCssVariableName(key: string) {
  return `--color-${getChartCssVariableKey(key)}`
}

export function getChartCssVariable(key: string) {
  return `var(${getChartCssVariableName(key)})`
}

export function ChartStyle({
  config,
  id,
}: {
  config: ChartConfig
  id: string
}) {
  const colorConfig = Object.entries(config).filter(
    ([, item]) => item.theme ?? item.color
  )

  if (colorConfig.length === 0) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(chartThemes)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, item]) => {
    const color =
      item.theme?.[theme as keyof typeof item.theme] ?? item.color
    return color ? `  ${getChartCssVariableName(key)}: ${color};` : null
  })
  .filter(Boolean)
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}
