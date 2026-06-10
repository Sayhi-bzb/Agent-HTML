declare module "rough-viz" {
  type RoughVizLegendItem = {
    color: string
    text: string
  }

  type RoughVizForceOptions<TData extends Record<string, unknown>> = {
    axisRoughness?: number
    axisStrokeWidth?: number
    collision?: number
    colorCallback?: (datum: TData) => string
    data: TData[]
    element: string
    fillStyle?: string
    fillWeight?: number
    innerStrokeWidth?: number
    legend?: RoughVizLegendItem[] | false
    margin?: {
      bottom: number
      left: number
      right: number
      top: number
    }
    radius?: keyof TData | number
    radiusExtent?: [number, number]
    roughness?: keyof TData | number
    roughnessExtent?: [number, number]
    stroke?: string
    strokeWidth?: number
    textCallback?: (datum: TData) => string
    title?: string
  }

  type RoughVizBarData = {
    labels: string[]
    values: number[]
  }

  type RoughVizBarOptions = {
    axisFontSize?: string
    axisRoughness?: number
    axisStrokeWidth?: number
    color?: string
    data: RoughVizBarData
    element: string
    fillStyle?: string
    fillWeight?: number
    highlight?: string
    innerStrokeWidth?: number
    labelFontSize?: string
    margin?: {
      bottom: number
      left: number
      right: number
      top: number
    }
    padding?: number
    roughness?: number
    stroke?: string
    strokeWidth?: number
    title?: string
    titleFontSize?: string
    tooltipFontSize?: string
    xLabel?: string
    xValueFormat?: string
    yLabel?: string
    yValueFormat?: string
  }

  class Bar {
    constructor(options: RoughVizBarOptions)
    remove(): void
  }

  class BarH {
    constructor(options: RoughVizBarOptions)
    remove(): void
  }

  class Force<TData extends Record<string, unknown>> {
    constructor(options: RoughVizForceOptions<TData>)
    remove(): void
  }

  export {
    Bar,
    BarH,
    Force,
    type RoughVizBarData,
    type RoughVizBarOptions,
    type RoughVizForceOptions,
    type RoughVizLegendItem,
  }
}
