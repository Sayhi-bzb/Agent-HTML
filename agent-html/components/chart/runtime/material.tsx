import * as React from "react"

import type { ChartTextureOptions } from "./texture"
import {
  createChartColorConfig,
  getChartCssVariable,
  mergeChartConfig,
  resolveChartSeries,
} from "./theme"
import type {
  ChartColorStrategy,
  ChartConfig,
  ChartRenderer,
  ChartResolvedSeries,
  ChartRoughOptions,
} from "./types"
import { ChartRendererDefs } from "./renderer"

export interface ChartMaterial {
  color: string
  key: string
  label: React.ReactNode
  renderer: ChartRenderer
  rough?: ChartRoughOptions
  texture?: ChartTextureOptions
  textureIndex: number
  textureKey: string
  textureScopeId: string
}

export interface ChartMaterialRegistry {
  defs: React.ReactNode
  getMaterial: (key: string) => ChartMaterial
  resolvedConfig: ChartConfig
  series: ChartResolvedSeries[]
}

const numericBucketKeys = ["low", "mid", "high"] as const
const referenceBucketKeys = ["below-reference", "above-reference"] as const

export type ChartNumericBucketKey = (typeof numericBucketKeys)[number]
export type ChartReferenceBucketKey = (typeof referenceBucketKeys)[number]
export type ChartRangeBucketKey = ChartNumericBucketKey | ChartReferenceBucketKey

function getFiniteChartValues(values: readonly number[]) {
  return values.filter((value) => Number.isFinite(value))
}

function canUseReferenceBuckets({
  reference,
  values,
}: {
  reference?: number
  values: readonly number[]
}) {
  if (!Number.isFinite(reference)) {
    return false
  }

  const resolvedReference = reference as number

  return (
    values.some((value) => value < resolvedReference) &&
    values.some((value) => value >= resolvedReference)
  )
}

export function getChartRangeBucketKeys({
  fallbackKey = "value",
  reference,
  values,
}: {
  fallbackKey?: string
  reference?: number
  values: readonly number[]
}): readonly string[] {
  const finiteValues = getFiniteChartValues(values)

  if (finiteValues.length === 0) {
    return [fallbackKey]
  }

  if (canUseReferenceBuckets({ reference, values: finiteValues })) {
    return referenceBucketKeys
  }

  const uniqueValues = new Set(finiteValues)

  if (uniqueValues.size < 2) {
    return [fallbackKey]
  }

  return numericBucketKeys
}

export function getChartRangeBucketKey({
  fallbackKey = "value",
  reference,
  value,
  values,
}: {
  fallbackKey?: string
  reference?: number
  value: number
  values: readonly number[]
}): string {
  if (!Number.isFinite(value)) {
    return fallbackKey
  }

  if (canUseReferenceBuckets({ reference, values })) {
    return value >= (reference as number) ? "above-reference" : "below-reference"
  }

  const finiteValues = getFiniteChartValues(values).sort((a, b) => a - b)

  if (finiteValues.length === 0 || new Set(finiteValues).size < 2) {
    return fallbackKey
  }

  const lowIndex = Math.floor((finiteValues.length - 1) / 3)
  const highIndex = Math.floor(((finiteValues.length - 1) * 2) / 3)
  const lowCutoff = finiteValues[lowIndex] ?? finiteValues[0]
  const highCutoff =
    finiteValues[highIndex] ?? finiteValues[finiteValues.length - 1]

  if (value <= lowCutoff) {
    return "low"
  }

  if (value >= highCutoff) {
    return "high"
  }

  return "mid"
}

export function getChartSequentialOpacity({
  max,
  min = 0,
  value,
}: {
  max: number
  min?: number
  value: number
}) {
  if (value <= 0) {
    return 0.08
  }

  if (max <= min) {
    return 0.76
  }

  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)))

  return 0.14 + ratio * 0.76
}

function filterChartConfigByKeys(
  config: ChartConfig | undefined,
  keys: readonly string[]
) {
  if (!config) {
    return undefined
  }

  const keySet = new Set(keys)

  return Object.fromEntries(
    Object.entries(config).filter(([key]) => keySet.has(key))
  ) satisfies ChartConfig
}

export function useChartMaterialRegistry({
  config,
  defaults,
  includeDefaultKeys = true,
  keys,
  renderer,
  rough,
  scope,
  strategy = "categorical",
  texture,
}: {
  config?: ChartConfig
  defaults?: ChartConfig
  includeDefaultKeys?: boolean
  keys: readonly string[]
  renderer: ChartRenderer
  rough?: ChartRoughOptions
  scope: string
  strategy?: ChartColorStrategy
  texture?: ChartTextureOptions
}): ChartMaterialRegistry {
  const textureScopeId = React.useId()
  const resolvedConfig = React.useMemo(
    () =>
      mergeChartConfig(
        mergeChartConfig(
          createChartColorConfig({ keys, strategy }),
          includeDefaultKeys
            ? defaults
            : filterChartConfigByKeys(defaults, keys)
        ),
        config
      ),
    [config, defaults, includeDefaultKeys, keys, strategy]
  )
  const series = React.useMemo(
    () => resolveChartSeries({ config: resolvedConfig }),
    [resolvedConfig]
  )
  const materialIndex = React.useMemo(
    () =>
      new Map(
        series.map((item, index) => [
          item.key,
          {
            color: getChartCssVariable(item.key),
            index,
            label: item.label,
          },
        ])
      ),
    [series]
  )
  const getMaterial = React.useCallback(
    (key: string): ChartMaterial => {
      const material = materialIndex.get(key)
      const textureIndex = material?.index ?? 0

      return {
        color: material?.color ?? getChartCssVariable(key),
        key,
        label: material?.label ?? resolvedConfig[key]?.label ?? key,
        renderer,
        rough,
        texture,
        textureIndex,
        textureKey: `${scope}:${key}`,
        textureScopeId,
      }
    },
    [materialIndex, renderer, resolvedConfig, rough, scope, texture, textureScopeId]
  )
  const defs = React.useMemo(
    () =>
      series.map((item, index) => (
        <ChartRendererDefs
          color={getChartCssVariable(item.key)}
          key={item.key}
          renderer={renderer}
          textureIndex={index}
          textureKey={`${scope}:${item.key}`}
          texture={texture}
          textureScopeId={textureScopeId}
        />
      )),
    [renderer, scope, series, texture, textureScopeId]
  )

  return {
    defs,
    getMaterial,
    resolvedConfig,
    series,
  }
}
