import type { ComponentType, ReactNode } from "react"

const THEMES = { light: "", dark: ".dark" } as const

export type ChartThemeName = keyof typeof THEMES

export type ChartConfig = Record<
  string,
  {
    label?: ReactNode
    icon?: ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<ChartThemeName, string> }
  )
>

export interface ChartSeries {
  key: string
  label?: ReactNode
  color?: string
  icon?: ComponentType
}

export interface ChartResolvedSeries {
  key: string
  label: ReactNode
  color: string
  icon?: ComponentType
}

export type ChartColorStrategy =
  | "categorical"
  | "relational"
  | "sequential"
  | "single"

export type ChartRenderer = "rough" | "svg" | "texture"

export interface ChartRoughOptions {
  bowing?: number
  fill?: string
  fillStyle?: "hachure" | "solid" | "zigzag" | "cross-hatch" | "dots"
  fillWeight?: number
  hachureGap?: number
  roughness?: number
  seed?: number
  stroke?: string
  strokeWidth?: number
}

export interface ChartBounds {
  height: number
  id: string
  series: ChartResolvedSeries[]
  width: number
}

export interface ChartMargin {
  bottom: number
  left: number
  right: number
  top: number
}

export type ChartAccessor<T, TValue> = keyof T | ((datum: T) => TValue)

export { THEMES }
