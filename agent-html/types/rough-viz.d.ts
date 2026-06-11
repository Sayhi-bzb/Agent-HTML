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

  type RoughVizNetworkLink = {
    source: number | string
    target: number | string
  }

  type RoughVizNetworkOptions<
    TData extends Record<string, unknown>,
    TLink extends RoughVizNetworkLink = RoughVizNetworkLink,
  > = RoughVizForceOptions<TData> & {
    links: TLink[]
  }

  type RoughVizBarData = {
    labels: string[]
    values: number[]
  }

  type RoughVizPieData = {
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

  type RoughVizPieOptions = {
    axisRoughness?: number
    axisStrokeWidth?: number
    colors?: string[]
    data: RoughVizPieData
    element: string
    fillStyle?: string
    fillWeight?: number
    highlight?: string
    innerStrokeWidth?: number
    legend?: boolean
    legendPosition?: "left" | "right"
    margin?: {
      bottom: number
      left: number
      right: number
      top: number
    }
    roughness?: number
    stroke?: string
    strokeWidth?: number
    title?: string
    titleFontSize?: string
    tooltipFontSize?: string
  }

  class Bar {
    constructor(options: RoughVizBarOptions)
    remove(): void
  }

  class BarH {
    constructor(options: RoughVizBarOptions)
    remove(): void
  }

  class Pie {
    constructor(options: RoughVizPieOptions)
    remove(): void
  }

  class Force<TData extends Record<string, unknown>> {
    constructor(options: RoughVizForceOptions<TData>)
    remove(): void
  }

  class Network<
    TData extends Record<string, unknown>,
    TLink extends RoughVizNetworkLink = RoughVizNetworkLink,
  > {
    constructor(options: RoughVizNetworkOptions<TData, TLink>)
    remove(): void
  }

  export {
    Bar,
    BarH,
    Force,
    Network,
    Pie,
    type RoughVizBarData,
    type RoughVizBarOptions,
    type RoughVizForceOptions,
    type RoughVizNetworkLink,
    type RoughVizNetworkOptions,
    type RoughVizPieData,
    type RoughVizPieOptions,
    type RoughVizLegendItem,
  }
}
