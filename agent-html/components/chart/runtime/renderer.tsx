import * as React from "react"

import {
  ChartTextureCircle,
  ChartTextureDefs,
  ChartTexturePath,
  ChartTextureRect,
  createChartTextureId,
  resolveChartTextureOptions,
  type ChartTextureOptions,
} from "./texture"
import { RoughCircle, RoughPath, RoughRect } from "@/lib/rough-svg"

import { resolveChartRenderer } from "./data"
import type { ChartRenderer, ChartRoughOptions } from "./types"

export type { ChartTextureOptions } from "./texture"

const ALL_RENDERERS = ["svg", "rough", "texture"] as const satisfies readonly ChartRenderer[]

interface ChartRendererBaseProps {
  color: string
  renderer: ChartRenderer | undefined
  rough?: ChartRoughOptions
  texture?: ChartTextureOptions
  textureIndex?: number
  textureKey: string | number
  textureScopeId: string
}

export function useChartRenderer(
  renderer: ChartRenderer | undefined,
  supported: readonly ChartRenderer[] = ALL_RENDERERS
) {
  return resolveChartRenderer(renderer, supported)
}

export function ChartRendererDefs({
  color,
  renderer,
  textureIndex,
  textureKey,
  texture,
  textureScopeId,
}: Omit<ChartRendererBaseProps, "rough">) {
  if (renderer !== "texture") {
    return null
  }

  return (
    <ChartTextureDefs
      color={color}
      id={createChartTextureId("mark", textureScopeId, textureKey)}
      index={textureIndex}
      options={texture}
    />
  )
}

export function ChartRenderedCircle({
  color,
  cx,
  cy,
  opacity,
  r,
  renderer,
  rough,
  stroke,
  strokeOpacity,
  strokeWidth,
  textureIndex,
  textureKey,
  texture,
  textureScopeId,
}: ChartRendererBaseProps & {
  cx: number
  cy: number
  opacity?: number
  r: number
  stroke?: string
  strokeOpacity?: number
  strokeWidth?: number
}) {
  const textureId = createChartTextureId("mark", textureScopeId, textureKey)
  const resolvedTexture = resolveChartTextureOptions({
    index: textureIndex,
    options: texture,
  })

  if (renderer === "rough") {
    return (
      <RoughCircle
        diameter={r * 2}
        options={{
          ...rough,
          fill: color,
          stroke: stroke ?? rough?.stroke ?? color,
          strokeWidth: strokeWidth ?? rough?.strokeWidth,
        }}
        x={cx}
        y={cy}
      />
    )
  }

  if (renderer === "texture") {
    return (
      <>
        <ChartTextureCircle
          cx={cx}
          cy={cy}
          id={textureId}
          opacity={opacity ?? resolvedTexture.opacity}
          r={r}
        />
        {stroke || strokeWidth ? (
          <circle
            fill="transparent"
            r={r}
            stroke={stroke ?? color}
            strokeOpacity={strokeOpacity}
            strokeWidth={strokeWidth}
            cx={cx}
            cy={cy}
          />
        ) : null}
      </>
    )
  }

  return (
    <circle
      cx={cx}
      cy={cy}
      fill={color}
      opacity={opacity}
      r={r}
      stroke={stroke}
      strokeOpacity={strokeOpacity}
      strokeWidth={strokeWidth}
    />
  )
}

export function ChartRenderedRect({
  color,
  height,
  opacity,
  renderer,
  rough,
  textureIndex,
  textureKey,
  texture,
  textureScopeId,
  width,
  x,
  y,
}: ChartRendererBaseProps & {
  height: number
  opacity?: number
  width: number
  x: number
  y: number
}) {
  const textureId = createChartTextureId("mark", textureScopeId, textureKey)
  const resolvedTexture = resolveChartTextureOptions({
    index: textureIndex,
    options: texture,
  })

  if (renderer === "rough") {
    return (
      <RoughRect
        height={height}
        options={{
          fill: color,
          stroke: color,
          ...rough,
        }}
        width={width}
        x={x}
        y={y}
      />
    )
  }

  if (renderer === "texture") {
    return (
      <ChartTextureRect
        height={height}
        id={textureId}
        opacity={opacity ?? resolvedTexture.opacity}
        width={width}
        x={x}
        y={y}
      />
    )
  }

  return (
    <rect
      fill={color}
      height={height}
      opacity={opacity}
      width={width}
      x={x}
      y={y}
    />
  )
}

export function ChartRenderedPath({
  color,
  d,
  fill = color,
  opacity,
  renderer,
  rough,
  stroke,
  strokeLinecap,
  strokeOpacity,
  strokeWidth,
  textureIndex,
  textureKey,
  texture,
  textureScopeId,
}: ChartRendererBaseProps & {
  d: string
  fill?: string
  opacity?: number
  stroke?: string
  strokeLinecap?: React.SVGProps<SVGPathElement>["strokeLinecap"]
  strokeOpacity?: number
  strokeWidth?: number
}) {
  const textureId = createChartTextureId("mark", textureScopeId, textureKey)
  const resolvedTexture = resolveChartTextureOptions({
    index: textureIndex,
    options: texture,
  })

  if (renderer === "rough") {
    return (
      <RoughPath
        d={d}
        options={{
          fill,
          stroke: stroke ?? color,
          strokeWidth,
          ...rough,
        }}
      />
    )
  }

  if (renderer === "texture") {
    if (fill === "none") {
      return (
        <path
          d={d}
          fill="none"
          opacity={opacity}
          stroke={stroke ?? color}
          strokeLinecap={strokeLinecap}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth}
        />
      )
    }

    return (
      <ChartTexturePath
        d={d}
        id={textureId}
        opacity={opacity ?? resolvedTexture.opacity}
      />
    )
  }

  return (
    <path
      d={d}
      fill={fill}
      opacity={opacity}
      stroke={stroke}
      strokeLinecap={strokeLinecap}
      strokeOpacity={strokeOpacity}
      strokeWidth={strokeWidth}
    />
  )
}
