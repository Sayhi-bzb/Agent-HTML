import type { TokyoPoint, TokyoRoute } from "./types"

export const tokyoMap = {
  center: [139.745, 35.675] as [number, number],
  zoom: 10.25,
  styles: {
    dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  },
}

export const tokyoPoints: TokyoPoint[] = [
  {
    coordinates: [139.7798, 35.5494],
    label: "Haneda",
    routeId: "arrival-route",
    speed: "arrival",
  },
  {
    coordinates: [139.7016, 35.6595],
    label: "Shibuya",
    routeId: "density-route",
    speed: "density",
  },
  {
    coordinates: [139.7126, 35.6652],
    label: "Omotesando",
    routeId: "density-route",
    speed: "density",
  },
  {
    coordinates: [139.7005, 35.6896],
    label: "Shinjuku",
    routeId: "density-route",
    speed: "density",
  },
  {
    coordinates: [139.7975, 35.6817],
    label: "Kiyosumi",
    routeId: "quiet-route",
    speed: "quiet",
  },
  {
    coordinates: [139.7606, 35.6959],
    label: "Jimbocho",
    routeId: "quiet-route",
    speed: "quiet",
  },
  {
    coordinates: [139.7663, 35.7274],
    label: "Yanaka",
    routeId: "quiet-route",
    speed: "quiet",
  },
]

export const tokyoRoutes: TokyoRoute[] = [
  {
    color: "#6b7280",
    coordinates: [
      [139.7798, 35.5494],
      [139.7565, 35.6556],
      [139.745, 35.675],
    ],
    day: "Day 1",
    distanceLabel: "18 km",
    durationLabel: "arrival window",
    evidenceKey: "arrivalRoute",
    id: "arrival-route",
    interestLabel: "low stimulus",
    speed: "arrival",
    summary: "Finish airport-to-city movement before chasing the city.",
    tag: "Soft Landing",
    viewport: {
      center: [139.763, 35.61],
      zoom: 10.4,
    },
    waypoints: [
      [139.7798, 35.5494],
      [139.7565, 35.6556],
      [139.745, 35.675],
    ],
    width: 4,
  },
  {
    color: "#e11d48",
    coordinates: [
      [139.7016, 35.6595],
      [139.7126, 35.6652],
      [139.7005, 35.6896],
    ],
    day: "Day 2",
    distanceLabel: "8.4 km",
    durationLabel: "dense half-day",
    evidenceKey: "densityRoute",
    id: "density-route",
    interestLabel: "design",
    speed: "density",
    summary: "Use density while it is useful: crowd flow, stations, commerce.",
    tag: "High Density",
    viewport: {
      center: [139.705, 35.675],
      zoom: 12.25,
    },
    waypoints: [
      [139.7016, 35.6595],
      [139.7126, 35.6652],
      [139.7005, 35.6896],
    ],
    width: 5,
  },
  {
    color: "#059669",
    coordinates: [
      [139.7975, 35.6817],
      [139.7606, 35.6959],
      [139.7663, 35.7274],
    ],
    day: "Day 3",
    distanceLabel: "6.6 km",
    durationLabel: "quiet half-day",
    evidenceKey: "quietRoute",
    id: "quiet-route",
    interestLabel: "bookstores",
    speed: "quiet",
    summary: "Trade breadth for dwell time: garden, books, neighborhood texture.",
    tag: "Quiet / Bookstores",
    viewport: {
      center: [139.774, 35.703],
      zoom: 12,
    },
    waypoints: [
      [139.7975, 35.6817],
      [139.7606, 35.6959],
      [139.7663, 35.7274],
    ],
    width: 6,
  },
  {
    color: "#0f766e",
    coordinates: [
      [139.745, 35.675],
      [139.7975, 35.6817],
      [139.7663, 35.7274],
    ],
    day: "Day 3",
    distanceLabel: "5.1 km",
    durationLabel: "short radius",
    evidenceKey: "lowStimulusRoute",
    id: "low-stimulus-route",
    interestLabel: "low stimulus",
    speed: "quiet",
    summary: "Short radius, fewer transfers, and more sitting time.",
    tag: "Low Stimulus",
    viewport: {
      center: [139.78, 35.704],
      zoom: 11.7,
    },
    waypoints: [
      [139.745, 35.675],
      [139.7975, 35.6817],
      [139.7663, 35.7274],
    ],
    width: 5,
  },
]
