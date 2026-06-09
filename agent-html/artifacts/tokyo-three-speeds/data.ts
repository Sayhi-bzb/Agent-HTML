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

export const mediaAssets = {
  arrival: {
    alt: "A Tokyo Monorail platform at Haneda Airport Terminal 3.",
    caption: "Airport rail makes arrival feel like a controlled first step.",
    credit: "Wikimedia Commons / MaedaAkihiko / CC0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Tokyo-Monorail_Haneda-Airport-Terminal-3-STA_Platforms.jpg",
    src: "/__agent-html/public/tokyo-three-speeds/arrival-monorail-platform.jpg",
  },
  density: {
    alt: "A crowd reflected in the mirrored entrance of Tokyu Plaza Omotesando Harajuku.",
    caption: "High density is legible when crowd, signage, and interface align.",
    credit: "Wikimedia Commons / Basile Morin / CC BY-SA 4.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Street_crowd_reflecting_in_the_polyhedral_mirrors_of_the_station_Tokyu_Plaza_Omotesando,_Harajuku,_Tokyo,_Japan.jpg",
    src: "/__agent-html/public/tokyo-three-speeds/density-omotesando-mirror-crowd.jpg",
  },
  quiet: {
    alt: "Kiyosumi Garden in Tokyo.",
    caption: "Quiet Tokyo is built from pause, texture, and dwell time.",
    credit: "Wikimedia Commons / Guilhem Vellut / CC BY 2.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Kiyosumi_Garden_(9224595703).jpg",
    src: "/__agent-html/public/tokyo-three-speeds/quiet-kiyosumi-garden.jpg",
  },
  openLoop: {
    alt: "A bookshop in the Kanda-Jimbocho area of Tokyo.",
    caption: "The best ending leaves one route unfinished.",
    credit: "Wikimedia Commons / Nick-D / CC BY-SA 3.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Bookshop_in_Kanda-Jimbocho_area_of_Tokyo.JPG",
    src: "/__agent-html/public/tokyo-three-speeds/open-loop-jimbocho-bookshop.jpg",
  },
} satisfies Record<string, MediaAsset>

export const arrivalTimeline = [
  {
    label: "Haneda",
    note: "First decision: finish airport-to-city movement before chasing Tokyo.",
    time: "arrival",
  },
  {
    label: "Monorail",
    note: "A controlled transfer sets the first tempo.",
    time: "13 min+",
  },
  {
    label: "Hotel area",
    note: "The first base is a neighborhood, not a landmark.",
    time: "base",
  },
  {
    label: "Dinner and sleep",
    note: "Keep the radius short enough for the next two days to work.",
    time: "night",
  },
]

export const arrivalMetrics: Metric[] = [
  { label: "energy load", value: 28 },
  { label: "transfer load", value: 34 },
  { label: "walking radius", value: 22 },
]

export const dayRhythms = [
  {
    day: "Day 1",
    energy: 35,
    mood: "Soft Landing",
    range: "Haneda, hotel area, first dinner",
    transfer: 32,
    walking: 24,
  },
  {
    day: "Day 2",
    energy: 86,
    mood: "High Density",
    range: "Shibuya, Shinjuku, Omotesando",
    transfer: 78,
    walking: 72,
  },
  {
    day: "Day 3",
    energy: 48,
    mood: "Quiet Tokyo",
    range: "Yanaka, Kiyosumi, Jimbocho",
    transfer: 38,
    walking: 52,
  },
]

export const mapRegions = [
  { day: "D1", label: "Haneda", tone: "arrival" },
  { day: "D2", label: "Shibuya", tone: "density" },
  { day: "D2", label: "Shinjuku", tone: "density" },
  { day: "D2", label: "Omotesando", tone: "density" },
  { day: "D3", label: "Yanaka", tone: "quiet" },
  { day: "D3", label: "Kiyosumi", tone: "quiet" },
  { day: "D3", label: "Jimbocho", tone: "quiet" },
]

export const densityAreas = [
  {
    area: "Shibuya",
    bestTime: "late afternoon",
    commercial: 84,
    crowd: 92,
    note: "Use the crossing as flow evidence, not as a postcard.",
    transfer: 74,
  },
  {
    area: "Shinjuku",
    bestTime: "evening",
    commercial: 88,
    crowd: 86,
    note: "Station exits and return planning matter more than neon.",
    transfer: 91,
  },
  {
    area: "Omotesando",
    bestTime: "day to dusk",
    commercial: 78,
    crowd: 68,
    note: "Dense, legible, design-facing city interface.",
    transfer: 54,
  },
]

export const quietRoute = [
  {
    label: "Kiyosumi",
    note: "Garden pause before the city gets loud again.",
    time: "morning",
  },
  {
    label: "Yanaka",
    note: "Low-speed streets and neighborhood texture.",
    time: "midday",
  },
  {
    label: "Jimbocho",
    note: "Bookstores turn the route into dwell time.",
    time: "afternoon",
  },
]

export const quietOptions = [
  {
    label: "garden pause",
    note: "Best when fatigue or rain changes the plan.",
  },
  {
    label: "bookstore dwell",
    note: "Spend time in fewer places instead of crossing the city again.",
  },
  {
    label: "morning street",
    note: "Use quiet hours to read the city before density returns.",
  },
]

export const quietMetrics: Metric[] = [
  { label: "low stimulus", value: 82 },
  { label: "walking", value: 46 },
  { label: "dwell time", value: 76 },
]

export const selectorOptions = [
  {
    dayRewrite: ["Tsukiji edge", "Shibuya dinner", "Jimbocho cafe"],
    label: "food",
    load: [
      { label: "walking", value: 62 },
      { label: "transfer", value: 58 },
      { label: "queue", value: 78 },
      { label: "night", value: 48 },
      { label: "dwell", value: 42 },
    ],
    route: "Meals set the clock; queues become the real cost.",
  },
  {
    dayRewrite: ["Aoyama", "Omotesando", "gallery stop"],
    label: "design",
    load: [
      { label: "walking", value: 66 },
      { label: "transfer", value: 44 },
      { label: "queue", value: 36 },
      { label: "night", value: 38 },
      { label: "dwell", value: 64 },
    ],
    route: "Keep the radius tight and let storefronts become the map.",
  },
  {
    dayRewrite: ["Kiyosumi", "Jimbocho", "missed shelf"],
    label: "bookstores",
    load: [
      { label: "walking", value: 48 },
      { label: "transfer", value: 34 },
      { label: "queue", value: 18 },
      { label: "night", value: 16 },
      { label: "dwell", value: 86 },
    ],
    route: "Trade breadth for time inside places.",
  },
  {
    dayRewrite: ["Shinjuku", "late train", "short morning"],
    label: "nightlife",
    load: [
      { label: "walking", value: 72 },
      { label: "transfer", value: 82 },
      { label: "queue", value: 58 },
      { label: "night", value: 94 },
      { label: "dwell", value: 36 },
    ],
    route: "Night energy requires an exit plan.",
  },
  {
    dayRewrite: ["hotel area", "garden", "one bookstore"],
    label: "low stimulus",
    load: [
      { label: "walking", value: 28 },
      { label: "transfer", value: 22 },
      { label: "queue", value: 12 },
      { label: "night", value: 10 },
      { label: "dwell", value: 78 },
    ],
    route: "Fewer transfers can make the day better, not smaller.",
  },
]

export const routeComparison = selectorOptions.map((option) => ({
  cost: option.load
    .filter((metric) => metric.label !== "dwell")
    .reduce((sum, metric) => sum + metric.value, 0),
  dwell: option.load.find((metric) => metric.label === "dwell")?.value ?? 0,
  label: option.label,
  route: option.route,
}))

export const openLoopItems = [
  {
    label: "missed bookstore",
    note: "Keep one Jimbocho shelf for next time.",
  },
  {
    label: "morning neighborhood",
    note: "Return before the city reaches full speed.",
  },
  {
    label: "slower Tokyo",
    note: "The next trip starts with less movement, not more.",
  },
]

export const sourceGroups = [
  {
    label: "Photos",
    links: [
      {
        label: "Tokyo Monorail Haneda platform",
        note: "Arrival photo. Wikimedia Commons, MaedaAkihiko, CC0.",
        url: "https://commons.wikimedia.org/wiki/File:Tokyo-Monorail_Haneda-Airport-Terminal-3-STA_Platforms.jpg",
      },
      {
        label: "Omotesando mirror crowd",
        note: "Density photo. Wikimedia Commons, Basile Morin, CC BY-SA 4.0.",
        url: "https://commons.wikimedia.org/wiki/File:Street_crowd_reflecting_in_the_polyhedral_mirrors_of_the_station_Tokyu_Plaza_Omotesando,_Harajuku,_Tokyo,_Japan.jpg",
      },
      {
        label: "Kiyosumi Garden",
        note: "Quiet photo. Wikimedia Commons, Guilhem Vellut, CC BY 2.0.",
        url: "https://commons.wikimedia.org/wiki/File:Kiyosumi_Garden_(9224595703).jpg",
      },
      {
        label: "Kanda-Jimbocho bookshop",
        note: "Open loop photo. Wikimedia Commons, Nick-D, CC BY-SA 3.0.",
        url: "https://commons.wikimedia.org/wiki/File:Bookshop_in_Kanda-Jimbocho_area_of_Tokyo.JPG",
      },
    ],
  },
  {
    label: "Maps and transit",
    links: [
      {
        label: "OpenStreetMap copyright",
        note: "Map layer attribution: © OpenStreetMap contributors, ODbL.",
        url: "https://www.openstreetmap.org/copyright",
      },
      {
        label: "ODPT Overview",
        note: "Transit and transfer context. Developer terms apply.",
        url: "https://www.odpt.org/en/overview/",
      },
      {
        label: "Tokyo Tourism Data Catalog",
        note: "Area intensity context; do not imply official conclusions after processing.",
        url: "https://data.tourism.metro.tokyo.lg.jp/en/",
      },
      {
        label: "Tokyo Tourism mobile data",
        note: "Mobile data attribution: 出典：モバイル空間統計.",
        url: "https://data.tourism.metro.tokyo.lg.jp/data/mobile/",
      },
    ],
  },
  {
    label: "Official place context",
    links: [
      {
        label: "GO TOKYO Haneda access",
        note: "Official access context for arrival and first transfer.",
        url: "https://www.gotokyo.org/en/plan/airport-access/haneda-airport/index.html",
      },
      {
        label: "GO TOKYO Shibuya",
        note: "Day 2 density route context.",
        url: "https://www.gotokyo.org/en/destinations/western-tokyo/shibuya/index.html",
      },
      {
        label: "GO TOKYO Kanda and Jimbocho",
        note: "Quiet and open-loop route context.",
        url: "https://www.gotokyo.org/en/destinations/central-tokyo/kanda-and-jimbocho/index.html",
      },
    ],
  },
] satisfies Array<{ label: string; links: SourceLink[] }>
