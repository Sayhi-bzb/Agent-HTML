import { scaleBand, scaleLinear } from "@visx/scale"

import type { ChartAccessor, ChartRenderer } from "./types"

export function resolveChartRenderer(
  renderer: ChartRenderer | undefined,
  supported: readonly ChartRenderer[]
): ChartRenderer {
  if (renderer && supported.includes(renderer)) {
    return renderer
  }

  return "svg"
}

export function getValue<T, TValue>(
  datum: T,
  accessor: ChartAccessor<T, TValue>
): TValue {
  if (typeof accessor === "function") {
    return accessor(datum)
  }

  return datum[accessor] as TValue
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

export function getFiniteValues<T>(
  data: T[],
  accessor: ChartAccessor<T, number>
) {
  return data.map((datum) => getValue(datum, accessor)).filter(isFiniteNumber)
}

export function getNumberDomain(values: number[]) {
  if (values.length === 0) {
    return [0, 1]
  }

  const min = Math.min(...values)
  const max = Math.max(...values)

  if (min === max) {
    return [Math.min(0, min), max + 1]
  }

  return [Math.min(0, min), max]
}

export function createLinearScale({
  range,
  values,
}: {
  range: [number, number]
  values: number[]
}) {
  return scaleLinear({
    domain: getNumberDomain(values),
    nice: true,
    range,
  })
}

export function createBandScale<T>({
  data,
  padding = 0.2,
  range,
  x,
}: {
  data: T[]
  padding?: number
  range: [number, number]
  x: ChartAccessor<T, string>
}) {
  return scaleBand<string>({
    domain: data.map((datum) => getValue(datum, x)),
    padding,
    range,
  })
}
