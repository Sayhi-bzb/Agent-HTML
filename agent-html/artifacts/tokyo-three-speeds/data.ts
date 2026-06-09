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

export type MediaAssetKey = keyof typeof mediaAssets

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

export const mediaAssets = {
  arrivalRoute: {
    alt: "Tokyo Monorail near Haneda Airport seen from Keihinjima island.",
    caption: "Soft landing is a moving edge between airport and city.",
    credit: "Wikimedia Commons / Yamaguchi Yoshiaki / CC BY-SA 2.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Tokyo_monorail_-_Haneda_airport_view_from_Keihinjima_island_(488414141).jpg",
    src: "/__agent-html/public/tokyo-three-speeds/route-arrival-haneda-monorail.jpg",
  },
  densityRoute: {
    alt: "A view along Cat Street in Tokyo.",
    caption: "High density works best when the route stays street-readable.",
    credit: "Wikimedia Commons / Another Believer / CC BY-SA 4.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:View_along_Cat_Street_in_Tokyo,_2019_-_801.jpg",
    src: "/__agent-html/public/tokyo-three-speeds/route-density-cat-street.jpg",
  },
  quietRoute: {
    alt: "Books along a walkway in the Kanda-Jimbocho area of Tokyo.",
    caption: "Quiet routes trade movement for time inside a neighborhood.",
    credit: "Wikimedia Commons / Nick-D / CC BY-SA 3.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Books_along_a_walkway_in_the_Kanda-Jimbocho_area_of_Tokyo.JPG",
    src: "/__agent-html/public/tokyo-three-speeds/open-loop-jimbocho-bookshop.jpg",
  },
  lowStimulusRoute: {
    alt: "Yanaka Ginza Street seen from Yuyake Dandan in Tokyo.",
    caption: "Low-stimulus Tokyo is neighborhood scale before it is itinerary.",
    credit: "Wikimedia Commons / SuFlyer / CC0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Yanaka_Ginza_Street_from_Yuyake_Dandan_(Oct_2024).jpg",
    src: "/__agent-html/public/tokyo-three-speeds/route-low-stimulus-yanaka-ginza.jpg",
  },
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

export const headerSlides = [
  {
    alt: "A train passenger looking out at Tokyo from a moving train.",
    caption: "Arrival begins inside the transit rhythm, before the city opens.",
    credit: "Unsplash",
    label: "Soft Landing",
    note: "Day 1 begins by letting the body arrive before the city expands.",
    sourceUrl:
      "https://unsplash.com/photos/a-man-standing-on-a-train-looking-out-the-window-PrgOionplMo",
    src: "/__agent-html/public/tokyo-three-speeds/header-train-motion.jpg",
  },
  {
    alt: "A dense group of commuters moving through a subway station.",
    caption: "Density is useful when movement, signs, and timing stay legible.",
    credit: "Pexels / Dương Nhân",
    label: "High Density",
    note: "Day 2 uses density as structure: crowd flow, stations, commerce.",
    sourceUrl: "https://www.pexels.com/photo/crowd-on-the-subway-1628032/",
    src: "/__agent-html/public/tokyo-three-speeds/header-station-density.jpg",
  },
  {
    alt: "Urban train tracks and power lines seen through a train window in Tokyo.",
    caption: "The route is a moving frame, not only a list of stops.",
    credit: "Pexels / Kaz Yura",
    label: "Route Frame",
    note: "The plan stays readable when movement becomes part of the image.",
    sourceUrl:
      "https://www.pexels.com/photo/urban-train-view-through-window-with-power-lines-33986319/",
    src: "/__agent-html/public/tokyo-three-speeds/header-urban-route.jpg",
  },
  {
    alt: "A quiet residential alleyway in Tokyo.",
    caption: "Quiet Tokyo is made from smaller streets and lower volume.",
    credit: "Pexels / Shottrotter",
    label: "Open Loop",
    note: "The route ends by preserving one unfinished reason to return.",
    sourceUrl:
      "https://www.pexels.com/photo/quiet-residential-alleyway-in-tokyo-japan-31403258/",
    src: "/__agent-html/public/tokyo-three-speeds/header-quiet-street.jpg",
  },
]

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
    day: "D1",
    evidenceKey: "arrivalRoute",
    interestLabels: ["low stimulus"],
    label: "Haneda",
    note: "Soft landing begins with airport-to-city movement.",
    routeId: "arrival-route",
    speed: "arrival",
  },
  {
    coordinates: [139.7016, 35.6595],
    day: "D2",
    evidenceKey: "densityRoute",
    interestLabels: ["food", "nightlife"],
    label: "Shibuya",
    note: "Crowd flow and crossing logic.",
    routeId: "density-route",
    speed: "density",
  },
  {
    coordinates: [139.7126, 35.6652],
    day: "D2",
    evidenceKey: "density",
    interestLabels: ["design"],
    label: "Omotesando",
    note: "Dense but legible design-facing city interface.",
    routeId: "density-route",
    speed: "density",
  },
  {
    coordinates: [139.7005, 35.6896],
    day: "D2",
    evidenceKey: "density",
    interestLabels: ["nightlife"],
    label: "Shinjuku",
    note: "Station exits and return planning.",
    routeId: "density-route",
    speed: "density",
  },
  {
    coordinates: [139.7975, 35.6817],
    day: "D3",
    evidenceKey: "quietRoute",
    interestLabels: ["bookstores", "low stimulus"],
    label: "Kiyosumi",
    note: "Garden pause and low-stimulus route anchor.",
    routeId: "quiet-route",
    speed: "quiet",
  },
  {
    coordinates: [139.7606, 35.6959],
    day: "D3",
    evidenceKey: "openLoop",
    interestLabels: ["bookstores"],
    label: "Jimbocho",
    note: "Bookstore dwell and unfinished shelf.",
    routeId: "quiet-route",
    speed: "quiet",
  },
  {
    coordinates: [139.7663, 35.7274],
    day: "D3",
    evidenceKey: "lowStimulusRoute",
    interestLabels: ["low stimulus"],
    label: "Yanaka",
    note: "Neighborhood texture at slower speed.",
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
    durationLabel: "45 min",
    evidenceKey: "arrival",
    id: "arrival-route",
    interestLabel: "low stimulus",
    label: "Day 1 arrival",
    opacity: 0.34,
    pointLabels: ["Haneda"],
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
    durationLabel: "3h 40m",
    evidenceKey: "density",
    id: "density-route",
    interestLabel: "design",
    label: "Day 2 density",
    opacity: 0.82,
    pointLabels: ["Shibuya", "Omotesando", "Shinjuku"],
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
    durationLabel: "4h 10m",
    evidenceKey: "quiet",
    id: "quiet-route",
    interestLabel: "bookstores",
    label: "Day 3 quiet",
    opacity: 0.92,
    pointLabels: ["Kiyosumi", "Jimbocho", "Yanaka"],
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
    durationLabel: "3h 20m",
    evidenceKey: "quiet",
    id: "low-stimulus-route",
    interestLabel: "low stimulus",
    label: "Low stimulus",
    opacity: 0.7,
    pointLabels: ["Kiyosumi", "Yanaka"],
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

export const densityAreas = [
  {
    area: "Shibuya",
    bestTime: "late afternoon",
    commercial: 84,
    crowd: 92,
    exitRule: "Leave before the evening station exits become the plan.",
    flow: "Use the crossing as a movement diagram: wait, release, split, reset.",
    interface:
      "Screens, storefronts, and station edges turn crowd pressure into readable direction.",
    note: "Use the crossing as flow evidence, not as a postcard.",
    transfer: 74,
    useFor: "crowd logic and dinner energy",
    avoidWhen: "fatigue is already high",
  },
  {
    area: "Shinjuku",
    bestTime: "evening",
    commercial: 88,
    crowd: 86,
    exitRule: "Decide the return line before entering the night layer.",
    flow: "The station is the city interface: exits, levels, and transfers carry the real route.",
    interface:
      "Neon matters less than the ordered sequence of gates, signs, corners, and returns.",
    note: "Station exits and return planning matter more than neon.",
    transfer: 91,
    useFor: "night density with an exit plan",
    avoidWhen: "the next morning must stay slow",
  },
  {
    area: "Omotesando",
    bestTime: "day to dusk",
    commercial: 78,
    crowd: 68,
    exitRule: "Stop while the radius is still walkable.",
    flow: "The route works as a tight surface walk: browse, pause, turn, compare.",
    interface:
      "Reflections, entrances, and glass edges make density feel designed instead of chaotic.",
    note: "Dense, legible, design-facing city interface.",
    transfer: 54,
    useFor: "design-facing density",
    avoidWhen: "the route needs cheap food first",
  },
]

export const quietRoute = [
  {
    dwell: "sit before choosing the next stop",
    label: "Kiyosumi",
    note: "Garden pause before the city gets loud again.",
    time: "morning",
    whyStay: "A quiet route needs a first place where nothing needs to be optimized.",
  },
  {
    dwell: "walk short streets without collecting landmarks",
    label: "Yanaka",
    note: "Low-speed streets and neighborhood texture.",
    time: "midday",
    whyStay: "The value is neighborhood texture, not coverage.",
  },
  {
    dwell: "leave one shelf unfinished",
    label: "Jimbocho",
    note: "Bookstores turn the route into dwell time.",
    time: "afternoon",
    whyStay: "A bookstore route is better when it resists completion.",
  },
]

export const quietOptions = [
  {
    choice: "cut a transfer",
    label: "garden pause",
    note: "Best when fatigue or rain changes the plan.",
  },
  {
    choice: "protect dwell time",
    label: "bookstore dwell",
    note: "Spend time in fewer places instead of crossing the city again.",
  },
  {
    choice: "start before density",
    label: "morning street",
    note: "Use quiet hours to read the city before density returns.",
  },
]

export const selectorOptions = [
  {
    dayRewrite: ["Tsukiji edge", "Shibuya dinner", "Jimbocho cafe"],
    evidenceKey: "density",
    label: "food",
    load: [
      { label: "walking", value: 62 },
      { label: "transfer", value: 58 },
      { label: "queue", value: 78 },
      { label: "night", value: 48 },
      { label: "dwell", value: 42 },
    ],
    pointLabels: ["Shibuya", "Jimbocho"],
    routeId: "density-route",
    route: "Meals set the clock; queues become the real cost.",
  },
  {
    dayRewrite: ["Aoyama", "Omotesando", "gallery stop"],
    evidenceKey: "density",
    label: "design",
    load: [
      { label: "walking", value: 66 },
      { label: "transfer", value: 44 },
      { label: "queue", value: 36 },
      { label: "night", value: 38 },
      { label: "dwell", value: 64 },
    ],
    pointLabels: ["Omotesando", "Shibuya"],
    routeId: "density-route",
    route: "Keep the radius tight and let storefronts become the map.",
  },
  {
    dayRewrite: ["Kiyosumi", "Jimbocho", "missed shelf"],
    evidenceKey: "openLoop",
    label: "bookstores",
    load: [
      { label: "walking", value: 48 },
      { label: "transfer", value: 34 },
      { label: "queue", value: 18 },
      { label: "night", value: 16 },
      { label: "dwell", value: 86 },
    ],
    pointLabels: ["Kiyosumi", "Jimbocho", "Yanaka"],
    routeId: "quiet-route",
    route: "Trade breadth for time inside places.",
  },
  {
    dayRewrite: ["Shinjuku", "late train", "short morning"],
    evidenceKey: "density",
    label: "nightlife",
    load: [
      { label: "walking", value: 72 },
      { label: "transfer", value: 82 },
      { label: "queue", value: 58 },
      { label: "night", value: 94 },
      { label: "dwell", value: 36 },
    ],
    pointLabels: ["Shinjuku", "Shibuya"],
    routeId: "density-route",
    route: "Night energy requires an exit plan.",
  },
  {
    dayRewrite: ["hotel area", "garden", "one bookstore"],
    evidenceKey: "quiet",
    label: "low stimulus",
    load: [
      { label: "walking", value: 28 },
      { label: "transfer", value: 22 },
      { label: "queue", value: 12 },
      { label: "night", value: 10 },
      { label: "dwell", value: 78 },
    ],
    pointLabels: ["Haneda", "Kiyosumi", "Yanaka"],
    routeId: "low-stimulus-route",
    route: "Fewer transfers can make the day better, not smaller.",
  },
]

export type SelectorOption = (typeof selectorOptions)[number] & {
  evidenceKey: MediaAssetKey
}

export const sourceGroups = [
  {
    label: "Photos",
    links: [
      {
        label: "Tokyo Monorail near Haneda",
        note: "Arrival route photo. Wikimedia Commons, Yamaguchi Yoshiaki, CC BY-SA 2.0.",
        url: "https://commons.wikimedia.org/wiki/File:Tokyo_monorail_-_Haneda_airport_view_from_Keihinjima_island_(488414141).jpg",
      },
      {
        label: "Cat Street, Tokyo",
        note: "Density route photo. Wikimedia Commons, Another Believer, CC BY-SA 4.0.",
        url: "https://commons.wikimedia.org/wiki/File:View_along_Cat_Street_in_Tokyo,_2019_-_801.jpg",
      },
      {
        label: "Books along Kanda-Jimbocho walkway",
        note: "Quiet route photo. Wikimedia Commons, Nick-D, CC BY-SA 3.0.",
        url: "https://commons.wikimedia.org/wiki/File:Books_along_a_walkway_in_the_Kanda-Jimbocho_area_of_Tokyo.JPG",
      },
      {
        label: "Yanaka Ginza from Yuyake Dandan",
        note: "Low-stimulus route photo. Wikimedia Commons, SuFlyer, CC0.",
        url: "https://commons.wikimedia.org/wiki/File:Yanaka_Ginza_Street_from_Yuyake_Dandan_(Oct_2024).jpg",
      },
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
      {
        label: "Tokyo train motion",
        note: "Header photo. Unsplash.",
        url: "https://unsplash.com/photos/a-man-standing-on-a-train-looking-out-the-window-PrgOionplMo",
      },
      {
        label: "Subway crowd",
        note: "Header photo. Pexels, Dương Nhân.",
        url: "https://www.pexels.com/photo/crowd-on-the-subway-1628032/",
      },
      {
        label: "Urban train window",
        note: "Header photo. Pexels, Kaz Yura.",
        url: "https://www.pexels.com/photo/urban-train-view-through-window-with-power-lines-33986319/",
      },
      {
        label: "Quiet residential alleyway",
        note: "Header photo. Pexels, Shottrotter.",
        url: "https://www.pexels.com/photo/quiet-residential-alleyway-in-tokyo-japan-31403258/",
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
