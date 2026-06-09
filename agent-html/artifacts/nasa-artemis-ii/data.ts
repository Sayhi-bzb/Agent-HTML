export type CrewMember = {
  agency: string
  meaning: string
  name: string
  role: string
}

export type MissionRoutePhase = {
  id: string
  label: string
  note: string
  time: string
  why: string
}

export type SourceLink = {
  label: string
  url: string
}

export type MediaAsset = {
  alt: string
  caption: string
  credit: string
  sourceUrl: string
  src: string
}

export type VideoAsset = {
  caption: string
  credit: string
  sourceUrl: string
  src: string
  title: string
}

export const missionTags = [
  "ARTEMIS II",
  "CREWED LUNAR FLYBY",
  "9 DAYS",
  "ORION + SLS",
]

export const telemetryItems = [
  { label: "crew count", value: "four astronauts" },
  { label: "mission duration", value: "nine days" },
  { label: "launch site", value: "Launch Complex 39B" },
  { label: "destination", value: "lunar space" },
]

export const crewMembers: CrewMember[] = [
  {
    agency: "NASA",
    meaning: "Mission command anchors the return to crewed lunar space.",
    name: "Reid Wiseman",
    role: "Commander",
  },
  {
    agency: "NASA",
    meaning: "The crewed return carries a modern human story, not only a vehicle.",
    name: "Victor Glover",
    role: "Pilot",
  },
  {
    agency: "NASA",
    meaning: "Deep-space experience turns the crew into the mission's human evidence.",
    name: "Christina Koch",
    role: "Mission Specialist",
  },
  {
    agency: "CSA",
    meaning: "International partnership becomes visible inside the flight crew.",
    name: "Jeremy Hansen",
    role: "Mission Specialist",
  },
]

export const systemPanels = [
  {
    label: "SLS",
    summary: "Provides the launch capability needed to leave Earth.",
  },
  {
    label: "Orion",
    summary: "Carries the crew and validates human deep-space flight systems.",
  },
  {
    label: "Ground Systems",
    summary: "Handles launch preparation, countdown, and ground support.",
  },
  {
    label: "Mission Control",
    summary: "Monitors mission state and supports critical decisions.",
  },
]

export const missionRoutePhases: MissionRoutePhase[] = [
  {
    id: "launch",
    label: "Launch",
    note: "The mission and vehicle begin integrated operation.",
    time: "T+0",
    why: "This starts the full deep-space system, not only a rocket ascent.",
  },
  {
    id: "earth-orbit-testing",
    label: "Earth Orbit Testing",
    note: "Orion and crew systems are checked before committing to lunar space.",
    time: "Day 1",
    why: "The crew stays close enough to Earth while the vehicle proves readiness.",
  },
  {
    id: "trans-lunar-injection",
    label: "Trans-Lunar Injection",
    note: "Orion leaves Earth orbit on a path toward lunar space.",
    time: "Outbound",
    why: "This is the commitment point that turns checkout into deep-space flight.",
  },
  {
    id: "lunar-flyby",
    label: "Lunar Flyby",
    note: "The crew validates navigation near the Moon.",
    time: "Moon",
    why: "The Moon becomes a real flight landmark, not an abstract destination.",
  },
  {
    id: "free-return",
    label: "Free Return",
    note: "The route keeps a safety-constrained return path to Earth.",
    time: "Return path",
    why: "The mission proves return logic as part of the route design.",
  },
  {
    id: "splashdown",
    label: "Splashdown",
    note: "Orion returns to Earth and closes the recovery loop.",
    time: "Day 9",
    why: "Recovery completes the mission as an operational system.",
  },
]

export const lunarMediaBeats = [
  {
    angle: "distance",
    title: "Lunar space becomes close enough to navigate.",
  },
  {
    angle: "scale",
    title: "Earth and Moon stop being map symbols and become flight geometry.",
  },
  {
    angle: "solitude",
    title: "Orion crosses a quiet deep-space environment with the crew inside.",
  },
  {
    angle: "relationship",
    title: "The flyby makes the return path and future landing credible.",
  },
]

export const closureItems = [
  {
    label: "Return",
    summary: "Orion comes back to Earth.",
  },
  {
    label: "Recovery",
    summary: "Sea recovery closes the physical mission loop.",
  },
  {
    label: "Validation",
    summary: "Mission data proves the next step is credible.",
  },
  {
    label: "Next Artemis Step",
    summary: "The flight points toward a true lunar-surface return.",
  },
]

export const sourceLinks = {
  crew: [
    {
      label: "Artemis II Crew",
      url: "https://www.nasa.gov/feature/our-artemis-crew/",
    },
    {
      label: "Artemis II Media Resources",
      url: "https://www.nasa.gov/artemis-ii-media-resources/",
    },
  ],
  launch: [
    {
      label: "Artemis II Launch Gallery",
      url: "https://www.nasa.gov/gallery/artemis-ii-launch/",
    },
    {
      label: "Artemis II Media Resources",
      url: "https://www.nasa.gov/artemis-ii-media-resources/",
    },
  ],
  lunar: [
    {
      label: "Lunar Flyby Gallery",
      url: "https://www.nasa.gov/gallery/lunar-flyby/",
    },
    {
      label: "Artemis II Multimedia",
      url: "https://www.nasa.gov/artemis-ii-multimedia/",
    },
    {
      label: "Simulated Artemis II Lunar Flyby",
      url: "https://svs.gsfc.nasa.gov/5536/",
    },
  ],
  mediaUsage: [
    {
      label: "NASA Images And Media Usage",
      url: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    },
  ],
  opening: [
    {
      label: "Artemis II Multimedia",
      url: "https://www.nasa.gov/artemis-ii-multimedia/",
    },
    {
      label: "NASA Images Search",
      url: "https://images.nasa.gov/search?keywords=Artemis+II&media=image%2Cvideo%2Caudio",
    },
  ],
  return: [
    {
      label: "Artemis II Media Resources",
      url: "https://www.nasa.gov/artemis-ii-media-resources/",
    },
    {
      label: "NASA Images Search: Splashdown Recovery",
      url: "https://images.nasa.gov/search?keywords=Artemis+II+splashdown+recovery&media=image%2Cvideo%2Caudio",
    },
  ],
  route: [
    {
      label: "Artemis II Map",
      url: "https://www.nasa.gov/image-article/artemis-ii-map-2/",
    },
    {
      label: "Flight Path Animation",
      url: "https://svs.gsfc.nasa.gov/20412/",
    },
  ],
} satisfies Record<string, SourceLink[]>

export const mediaAssets = {
  crew: {
    christinaKoch: {
      alt: "Official NASA portrait of Artemis II mission specialist Christina Koch.",
      caption: "Christina Koch, mission specialist.",
      credit: "Credit: NASA",
      sourceUrl: "https://www.nasa.gov/feature/our-artemis-crew/",
      src: "https://www.nasa.gov/wp-content/uploads/2023/06/jsc2023e0016435-alt.jpg?w=768",
    },
    jeremyHansen: {
      alt: "Official portrait of Artemis II mission specialist Jeremy Hansen.",
      caption: "Jeremy Hansen, mission specialist.",
      credit: "Credit: NASA",
      sourceUrl: "https://www.nasa.gov/feature/our-artemis-crew/",
      src: "https://www.nasa.gov/wp-content/uploads/2023/06/jsc2023e0016436-alt.jpg?w=768",
    },
    reidWiseman: {
      alt: "Official NASA portrait of Artemis II commander Reid Wiseman.",
      caption: "Reid Wiseman, commander.",
      credit: "Credit: NASA",
      sourceUrl: "https://www.nasa.gov/feature/our-artemis-crew/",
      src: "https://www.nasa.gov/wp-content/uploads/2023/06/jsc2023e0016434-alt.jpg?w=768",
    },
    victorGlover: {
      alt: "Official NASA portrait of Artemis II pilot Victor Glover.",
      caption: "Victor Glover, pilot.",
      credit: "Credit: NASA",
      sourceUrl: "https://www.nasa.gov/feature/our-artemis-crew/",
      src: "https://www.nasa.gov/wp-content/uploads/2023/06/jsc2023e0016433-alt.jpg?w=768",
    },
  },
  launch: {
    alt: "SLS rocket lifting off for Artemis II from Launch Complex 39B.",
    caption: "SLS launch imagery anchors the system ignition scene.",
    credit: "Credit: NASA",
    sourceUrl: "https://www.nasa.gov/gallery/artemis-ii-launch/",
    src: "https://www.nasa.gov/wp-content/uploads/2026/04/nhq202604010230.jpg?w=1775",
  },
  lunarFlyby: {
    earthset: {
      alt: "Earth setting beyond the lunar far side.",
      caption: "Earth and Moon become flight geometry during the lunar flyby.",
      credit: "Credit: NASA",
      sourceUrl:
        "https://science.nasa.gov/earth/earth-observatory/earthset-from-the-lunar-far-side/",
      src: "https://assets.science.nasa.gov/content/dam/science/esd/eo/images/iotd/2026/earthset-from-the-lunar-far-side/earthset_55192132107_00dc598014_o.jpg",
    },
    flybyVideo: {
      caption:
        "A simulated Orion viewpoint turns the lunar flyby into motion, not only a still landmark.",
      credit: "Credit: NASA Scientific Visualization Studio",
      sourceUrl: "https://svs.gsfc.nasa.gov/5536/",
      src: "https://svs.gsfc.nasa.gov/vis/a000000/a005500/a005536/a2_flyby_1min_1080p30.mp4",
      title: "Simulated Artemis II Lunar Flyby",
    },
    moonView: {
      alt: "The Moon eclipsing the Sun as seen from Orion during Artemis II.",
      caption: "The Moon eclipses the Sun during the Artemis II lunar flyby.",
      credit: "Credit: NASA",
      sourceUrl: "https://www.nasa.gov/image-detail/amf-art002e009301/",
      src: "https://images-assets.nasa.gov/image/art002e009301/art002e009301~large.jpg?crop=faces%2Cfocalpoint&fit=clip&h=1280&w=1920",
    },
  },
  opening: {
    alt: "Earth seen from Orion during Artemis II.",
    caption: "Earth seen from Orion establishes the first-person deep-space view.",
    credit: "Credit: NASA",
    sourceUrl: "https://www.nasa.gov/artemis-ii-multimedia/",
    src: "https://images-assets.nasa.gov/image/art002e000190/art002e000190~large.jpg?crop=faces%2Cfocalpoint&fit=clip&h=1280&w=1920",
  },
  recovery: {
    alt: "Recovery operations after Artemis II splashdown.",
    caption: "Recovery confirms the mission's operational closure.",
    credit: "Credit: NASA",
    sourceUrl: "https://www.nasa.gov/gallery/artemis-ii-splashdown-and-recovery/",
    src: "https://images-assets.nasa.gov/image/NHQ202604110006/NHQ202604110006~large.jpg?crop=faces%2Cfocalpoint&fit=clip&h=1280&w=1920",
  },
  route: {
    alt: "Artemis II mission map showing the flight path around the Moon and back to Earth.",
    caption: "The mission map turns the nine-day route into a readable flight path.",
    credit: "Credit: NASA Scientific Visualization Studio",
    sourceUrl: "https://svs.gsfc.nasa.gov/20412/",
    src: "https://svs.gsfc.nasa.gov/vis/a020000/a020400/a020412/Artemis_II_MissionMap_still_2025.png",
  },
  splashdown: {
    alt: "Orion spacecraft after Artemis II splashdown.",
    caption: "Splashdown brings the flight back to Earth.",
    credit: "Credit: NASA",
    sourceUrl: "https://www.nasa.gov/image-article/artemis-ii-splashes-down/",
    src: "https://www.nasa.gov/wp-content/uploads/2026/04/nhq202604100018.jpg?w=2048",
  },
} satisfies Record<string, unknown>
