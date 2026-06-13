import { curveMonotoneX } from "@visx/curve"
import { GlyphCircle } from "@visx/glyph"
import {
  Axis,
  DataContext,
  GlyphSeries,
  Grid,
  LineSeries,
  Tooltip,
  XYChart,
} from "@visx/xychart"
import * as React from "react"

import {
  type ChartAccessor,
  type ChartConfig,
  ChartContainer,
  ChartMotionCircle,
  ChartTooltipContent,
  type ChartRenderer,
  chartMotion,
  chartXYTheme,
  getFiniteValues,
  getNumberDomain,
  getValue,
  isFiniteNumber,
  resolveChartRenderer,
  useChartMaterialRegistry,
} from "./runtime"

export interface LineChartProps<T> {
  aspectRatio?: string
  className?: string
  config?: ChartConfig
  data: T[]
  minHeight?: number
  referenceY?: number
  renderer?: ChartRenderer
  xKey: ChartAccessor<T, string>
  xLabelFormatter?: (value: string) => React.ReactNode
  yKey: ChartAccessor<T, number>
  yValueFormatter?: (value: number) => React.ReactNode
}

const DEFAULT_MARGIN = {
  bottom: 28,
  left: 38,
  right: 16,
  top: 16,
}

const valueFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
})

function formatValue(value: number) {
  return valueFormatter.format(value)
}

function LineReferenceLine({ yValue }: { yValue: number }) {
  const { margin, width, yScale } = React.useContext(DataContext)
  const y = yScale ? Number(yScale(yValue)) : NaN

  if (!margin || !width || !isFiniteNumber(y)) {
    return null
  }

  return (
    <line
      className="stroke-border"
      strokeDasharray="3 3"
      x1={margin.left}
      x2={width - margin.right}
      y1={y}
      y2={y}
    />
  )
}

export function LineChart<T extends object>({
  aspectRatio = "9 / 4",
  className,
  config,
  data,
  minHeight = 320,
  referenceY,
  renderer,
  xKey,
  xLabelFormatter,
  yKey,
  yValueFormatter = formatValue,
}: LineChartProps<T>) {
  const resolvedRenderer = resolveChartRenderer(renderer, ["svg"])
  const seriesKey = React.useMemo(
    () => Object.keys(config ?? {})[0] ?? "value",
    [config]
  )
  const materials = useChartMaterialRegistry({
    config,
    keys: [seriesKey],
    renderer: resolvedRenderer,
    scope: "line",
    strategy: "single",
  })

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={className}
      config={materials.resolvedConfig}
      emptyData={
        <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
          No trend data
        </div>
      }
      isEmpty={data.length === 0}
      minHeight={minHeight}
    >
      {({ height, series, width }) => {
        const chartData = data.filter((datum) =>
          isFiniteNumber(getValue(datum, yKey))
        )
        const values = getFiniteValues(chartData, yKey)
        const primarySeries = series[0]
        const seriesKey = primarySeries?.key ?? "value"
        const seriesLabel = primarySeries?.label ?? seriesKey
        const color = materials.getMaterial(seriesKey).color
        const xAccessor = (datum: T) => getValue(datum, xKey)
        const yAccessor = (datum: T) => getValue(datum, yKey)

        return (
          <XYChart
            accessibilityLabel="趋势折线图"
            height={height}
            margin={DEFAULT_MARGIN}
            theme={chartXYTheme}
            width={width}
            xScale={{ padding: 0.5, type: "point" }}
            yScale={{
              domain: getNumberDomain(values),
              nice: true,
              type: "linear",
            }}
          >
            <Grid columns={false} numTicks={4} />
            <Axis
              hideAxisLine
              hideTicks
              numTicks={4}
              orientation="left"
              tickFormat={(value) => String(yValueFormatter(Number(value)))}
            />
            <Axis
              hideAxisLine
              hideTicks
              orientation="bottom"
              tickFormat={(value) => {
                const label = String(value)
                return String(xLabelFormatter ? xLabelFormatter(label) : label)
              }}
            />

            {isFiniteNumber(referenceY) ? (
              <LineReferenceLine yValue={referenceY} />
            ) : null}

            <LineSeries
              colorAccessor={() => color}
              curve={curveMonotoneX}
              data={chartData}
              dataKey={seriesKey}
              fill="none"
              strokeWidth={2}
              xAccessor={xAccessor}
              yAccessor={yAccessor}
            />
            <GlyphSeries
              colorAccessor={() => color}
              data={chartData}
              dataKey={`${seriesKey}-glyphs`}
              enableEvents={false}
              renderGlyph={({ color: glyphColor, key, x, y }) => (
                <GlyphCircle
                  className="fill-background"
                  key={key}
                  left={x}
                  size={38}
                  stroke={glyphColor}
                  strokeWidth={2}
                  top={y}
                />
              )}
              xAccessor={xAccessor}
              yAccessor={yAccessor}
            />

            <Tooltip<T>
              applyPositionStyle
              className="pointer-events-none z-50"
              detectBounds
              renderGlyph={({ color: glyphColor, key, x, y }) => (
                <ChartMotionCircle
                  animate={{
                    opacity: 1,
                    r: 5,
                  }}
                  cx={x}
                  cy={y}
                  fill="var(--background)"
                  initial={{
                    opacity: 0,
                    r: 0,
                  }}
                  key={key}
                  stroke={glyphColor}
                  strokeWidth={2}
                  transition={chartMotion.hover}
                />
              )}
              renderTooltip={({ tooltipData }) => {
                const tooltip = tooltipData?.datumByKey[seriesKey]?.datum

                if (!tooltip) {
                  return null
                }

                return (
                  <ChartTooltipContent
                    items={[
                      {
                        color,
                        key: seriesKey,
                        label: seriesLabel,
                        value: yValueFormatter(getValue(tooltip, yKey)),
                      },
                    ]}
                    label={
                      xLabelFormatter
                        ? xLabelFormatter(getValue(tooltip, xKey))
                        : getValue(tooltip, xKey)
                    }
                  />
                )
              }}
              showDatumGlyph
              snapTooltipToDatumX
              snapTooltipToDatumY
              unstyled
            />
          </XYChart>
        )
      }}
    </ChartContainer>
  )
}
