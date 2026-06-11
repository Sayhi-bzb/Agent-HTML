export type MediaAsset = {
  alt: string
  caption: string
  credit: string
  sourceUrl: string
  src: string
}

export type SourceLink = {
  label: string
  note: string
  url: string
}

export type Metric = {
  label: string
  value: number
}

export type MediaAssetKey =
  | "arrival"
  | "arrivalRoute"
  | "density"
  | "densityRoute"
  | "lowStimulusRoute"
  | "openLoop"
  | "quiet"
  | "quietRoute"

export type TokyoPoint = {
  coordinates: [number, number]
  day: string
  evidenceKey: MediaAssetKey
  interestLabels: string[]
  label: string
  note: string
  routeId: string
  speed: "arrival" | "density" | "quiet" | "openLoop"
}

export type TokyoRoute = {
  color: string
  coordinates: [number, number][]
  day: string
  distanceLabel: string
  durationLabel: string
  evidenceKey: MediaAssetKey
  id: string
  interestLabel: string
  label: string
  opacity: number
  pointLabels: string[]
  speed: "arrival" | "density" | "quiet"
  summary: string
  tag: string
  viewport: {
    center: [number, number]
    zoom: number
  }
  waypoints: [number, number][]
  width: number
}

export type SelectorOption = {
  dayRewrite: string[]
  evidenceKey: MediaAssetKey
  label: string
  load: Metric[]
  pointLabels: string[]
  route: string
  routeId: string
}

