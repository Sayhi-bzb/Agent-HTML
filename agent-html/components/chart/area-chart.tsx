import { curveMonotoneX } from "@visx/curve"
import { Area, LinePath } from "@visx/shape"
import {
  AreaSeries,
  Axis,
  DataContext,
  Grid,
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
import { RoughPath } from "@/lib/rough-svg"
import {
  type ChartMaterial,
  type ChartRoughOptions,
  type ChartTextureOptions,
  ChartRenderedPath,
  ChartRendererDefs,
} from "./runtime"

export interface AreaChartProps<T> {
  aspectRatio?: string
  className?: string
  config?: ChartConfig
  data: readonly T[]
  minHeight?: number
  referenceY?: number
  renderer?: ChartRenderer
  rough?: ChartRoughOptions
  texture?: ChartTextureOptions
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

function AreaReferenceLine({ yValue }: { yValue: number }) {
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

function RoughAreaVisualLayer<T extends object>({
  color,
  data,
  rough,
  xKey,
  yKey,
}: {
  color: string
  data: T[]
  rough?: ChartRoughOptions
  xKey: ChartAccessor<T, string>
  yKey: ChartAccessor<T, number>
}) {
  const { xScale, yScale } = React.useContext(DataContext)

  if (!xScale || !yScale) {
    return null
  }

  const scaleX = xScale as (value: unknown) => unknown
  const scaleY = yScale as (value: unknown) => unknown
  const getX = (datum: T) => Number(scaleX(getValue(datum, xKey)))
  const getY = (datum: T) => Number(scaleY(getValue(datum, yKey)))
  const baseline = Number(scaleY(0))
  const isDefined = (datum: T) =>
    isFiniteNumber(getX(datum)) && isFiniteNumber(getY(datum))

  return (
    <g aria-hidden="true" pointerEvents="none">
      <Area
        curve={curveMonotoneX}
        data={data}
        defined={isDefined}
        x={getX}
        y0={() => baseline}
        y1={getY}
      >
        {({ path }) => (
          <RoughPath
            d={path(data) ?? ""}
            options={{
              ...rough,
              fill: color,
              fillStyle: rough?.fillStyle ?? "hachure",
              fillWeight: rough?.fillWeight ?? 0.8,
              hachureGap: rough?.hachureGap ?? 5,
              stroke: color,
              strokeWidth: rough?.strokeWidth ?? 1,
            }}
          />
        )}
      </Area>
      <LinePath
        curve={curveMonotoneX}
        data={data}
        defined={isDefined}
        x={getX}
        y={getY}
      >
        {({ path }) => (
          <RoughPath
            d={path(data) ?? ""}
            options={{
              ...rough,
              fill: "none",
              stroke: color,
              strokeWidth: 2,
            }}
          />
        )}
      </LinePath>
    </g>
  )
}

function TextureAreaVisualLayer<T extends object>({
  data,
  material,
  xKey,
  yKey,
}: {
  data: T[]
  material: ChartMaterial
  xKey: ChartAccessor<T, string>
  yKey: ChartAccessor<T, number>
}) {
  const { xScale, yScale } = React.useContext(DataContext)

  if (!xScale || !yScale) {
    return null
  }

  const scaleX = xScale as (value: unknown) => unknown
  const scaleY = yScale as (value: unknown) => unknown
  const getX = (datum: T) => Number(scaleX(getValue(datum, xKey)))
  const getY = (datum: T) => Number(scaleY(getValue(datum, yKey)))
  const baseline = Number(scaleY(0))
  const isDefined = (datum: T) =>
    isFiniteNumber(getX(datum)) && isFiniteNumber(getY(datum))

  return (
    <g aria-hidden="true" pointerEvents="none">
      <ChartRendererDefs
        color={material.color}
        renderer="texture"
        textureIndex={material.textureIndex}
        textureKey={material.textureKey}
        texture={material.texture}
        textureScopeId={material.textureScopeId}
      />
      <Area
        curve={curveMonotoneX}
        data={data}
        defined={isDefined}
        x={getX}
        y0={() => baseline}
        y1={getY}
      >
        {({ path }) => {
          const d = path(data) ?? ""

          return (
            <ChartRenderedPath
              color={material.color}
              d={d}
              renderer="texture"
              stroke={false}
              textureIndex={material.textureIndex}
              textureKey={material.textureKey}
              texture={material.texture}
              textureScopeId={material.textureScopeId}
            />
          )
        }}
      </Area>
      <LinePath
        curve={curveMonotoneX}
        data={data}
        defined={isDefined}
        x={getX}
        y={getY}
      >
        {({ path }) => (
          <path
            d={path(data) ?? ""}
            fill="none"
            stroke={material.color}
            strokeWidth={2}
          />
        )}
      </LinePath>
    </g>
  )
}

export function AreaChart<T extends object>({
  aspectRatio = "9 / 4",
  className,
  config,
  data,
  minHeight = 320,
  referenceY,
  renderer = "svg",
  rough,
  texture,
  xKey,
  xLabelFormatter,
  yKey,
  yValueFormatter = formatValue,
}: AreaChartProps<T>) {
  const resolvedRenderer = resolveChartRenderer(renderer, [
    "svg",
    "rough",
    "texture",
  ])
  const seriesKey = React.useMemo(
    () => Object.keys(config ?? {})[0] ?? "value",
    [config]
  )
  const materials = useChartMaterialRegistry({
    config,
    keys: [seriesKey],
    renderer: resolvedRenderer,
    rough,
    scope: "area",
    strategy: "single",
    texture,
  })

  return (
    <ChartContainer
      aspectRatio={aspectRatio}
      className={className}
      config={materials.resolvedConfig}
      emptyData={
        <div className="flex h-full min-h-40 items-center justify-center text-muted-foreground">
          No area data
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
        const material = materials.getMaterial(seriesKey)
        const color = material.color
        const xAccessor = (datum: T) => getValue(datum, xKey)
        const yAccessor = (datum: T) => getValue(datum, yKey)

        return (
          <XYChart
            accessibilityLabel="面积趋势图"
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
              <AreaReferenceLine yValue={referenceY} />
            ) : null}

            {resolvedRenderer === "rough" ? (
              <RoughAreaVisualLayer
                color={color}
                data={chartData}
                rough={rough}
                xKey={xKey}
                yKey={yKey}
              />
            ) : null}
            {resolvedRenderer === "texture" ? (
              <TextureAreaVisualLayer
                data={chartData}
                material={material}
                xKey={xKey}
                yKey={yKey}
              />
            ) : null}
            <AreaSeries
              curve={curveMonotoneX}
              data={chartData}
              dataKey={seriesKey}
              fill={resolvedRenderer === "rough" || resolvedRenderer === "texture" ? "transparent" : color}
              fillOpacity={resolvedRenderer === "rough" || resolvedRenderer === "texture" ? 0 : 0.16}
              lineProps={{
                stroke: resolvedRenderer === "rough" || resolvedRenderer === "texture" ? "transparent" : color,
                strokeWidth: 2,
              }}
              renderLine
              stroke="transparent"
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
