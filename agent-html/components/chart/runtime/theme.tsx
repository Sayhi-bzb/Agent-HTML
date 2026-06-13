import { buildChartTheme } from "@visx/xychart"

import type {
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

export function getChartCssVariableName(key: string) {
  return `--color-${key}`
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
