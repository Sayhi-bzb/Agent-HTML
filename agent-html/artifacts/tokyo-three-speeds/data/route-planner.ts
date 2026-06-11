import type { SelectorOption } from "./types"

export const selectorOptions = [
  {
    label: "food",
    load: [
      { label: "walking", value: 62 },
      { label: "transfer", value: 58 },
      { label: "queue", value: 78 },
      { label: "night", value: 48 },
      { label: "dwell", value: 42 },
    ],
    routeId: "density-route",
    route: "Meals set the clock; queues and return lines become the real cost.",
  },
  {
    label: "design",
    load: [
      { label: "walking", value: 66 },
      { label: "transfer", value: 44 },
      { label: "queue", value: 36 },
      { label: "night", value: 38 },
      { label: "dwell", value: 64 },
    ],
    routeId: "density-route",
    route: "Keep the radius tight and let storefronts become the map.",
  },
  {
    label: "bookstores",
    load: [
      { label: "walking", value: 48 },
      { label: "transfer", value: 34 },
      { label: "queue", value: 18 },
      { label: "night", value: 16 },
      { label: "dwell", value: 86 },
    ],
    routeId: "quiet-route",
    route: "Trade breadth for time inside places.",
  },
  {
    label: "nightlife",
    load: [
      { label: "walking", value: 72 },
      { label: "transfer", value: 82 },
      { label: "queue", value: 58 },
      { label: "night", value: 94 },
      { label: "dwell", value: 36 },
    ],
    routeId: "density-route",
    route: "Night energy requires an exit plan.",
  },
  {
    label: "low stimulus",
    load: [
      { label: "walking", value: 28 },
      { label: "transfer", value: 22 },
      { label: "queue", value: 12 },
      { label: "night", value: 10 },
      { label: "dwell", value: 78 },
    ],
    routeId: "low-stimulus-route",
    route: "Fewer transfers can make the day better, not smaller.",
  },
] satisfies SelectorOption[]
