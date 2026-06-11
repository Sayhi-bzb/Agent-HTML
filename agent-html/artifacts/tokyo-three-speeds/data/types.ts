export type MediaAsset = {
  alt: string
  caption: string
  credit: string
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
  label: string
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
  label: string
  load: Metric[]
  route: string
  routeId: string
}
