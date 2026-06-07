export type ArtemisMediaFilter = "all" | "image" | "video"

export type ArtemisMediaItem = {
  assetUrl: string
  center: string
  dateCreated: string
  description: string
  keywords: string[]
  mediaType: "image" | "video"
  nasaId: string
  thumbnailUrl: string
  title: string
}

export type ArtemisTimelinePhase = {
  id: string
  label: string
  searchHint: string
  sourceStatus: "source URL verified" | "NASA Images API search"
  summary: string
}

export type StoryBeat = {
  id: string
  assetId: string | null
  angle: string
  headline: string
  narration: string
  phaseId: string
  sourceNote: string
  verificationStatus: "source pending verification" | "NASA Images API result"
}

type NasaSearchData = {
  center?: string
  date_created?: string
  description?: string
  keywords?: string[]
  media_type?: string
  nasa_id?: string
  title?: string
}

type NasaSearchItem = {
  data?: NasaSearchData[]
  href?: string
  links?: Array<{
    href?: string
    rel?: string
    render?: string
  }>
}

type NasaSearchResponse = {
  collection?: {
    items?: NasaSearchItem[]
  }
}

type NasaAssetResponse = {
  collection?: {
    items?: Array<{
      href?: string
    }>
  }
}

export const artemisIiSourceUrl =
  "https://www.nasa.gov/artemis-ii-multimedia/"

export const artemisIiSourceSummary =
  "NASA's Artemis II multimedia page is the theme source for mission media categories, source URL tracking, and media discovery entry points."

export const artemisIiSourceUpdated = "Apr 30, 2026"

export const defaultArtemisQuery = "Artemis II"

export const artemisTimelinePhases: ArtemisTimelinePhase[] = [
  {
    id: "mission-overview",
    label: "Mission overview",
    searchHint: "Artemis II mission overview",
    sourceStatus: "source URL verified",
    summary:
      "Frame the crewed lunar flyby mission before choosing specific media assets.",
  },
  {
    id: "crew",
    label: "Crew",
    searchHint: "Artemis II crew astronauts",
    sourceStatus: "NASA Images API search",
    summary:
      "Find crew portraits, training imagery, interviews, and human-centered context.",
  },
  {
    id: "launch",
    label: "Launch",
    searchHint: "Artemis II launch SLS Orion",
    sourceStatus: "NASA Images API search",
    summary:
      "Collect launch-day visuals, SLS and Orion media, and ground-system context.",
  },
  {
    id: "journey",
    label: "Journey",
    searchHint: "Artemis II journey Moon Orion",
    sourceStatus: "NASA Images API search",
    summary:
      "Shape outbound transit, spacecraft operations, and mission-progress beats.",
  },
  {
    id: "lunar-flyby",
    label: "Lunar flyby",
    searchHint: "Artemis II lunar flyby",
    sourceStatus: "NASA Images API search",
    summary:
      "Build the Moon encounter sequence with imagery and explanatory source links.",
  },
  {
    id: "return-recovery",
    label: "Return and recovery",
    searchHint: "Artemis II splashdown recovery",
    sourceStatus: "NASA Images API search",
    summary:
      "Close the story with return, splashdown, recovery, and post-mission media.",
  },
]

export const initialStoryBeats: StoryBeat[] = [
  {
    id: "beat-theme-source",
    assetId: null,
    angle: "Establish the source page and keep the first beat conservative.",
    headline: "Theme source",
    narration:
      "Open with the NASA Artemis II multimedia source URL, then attach verified media as search results are selected.",
    phaseId: "mission-overview",
    sourceNote: artemisIiSourceUrl,
    verificationStatus: "source pending verification",
  },
]

export function buildNasaSearchUrl({
  filter,
  query,
}: {
  filter: ArtemisMediaFilter
  query: string
}) {
  const params = new URLSearchParams()

  params.set("q", query.trim() || defaultArtemisQuery)
  params.set("media_type", filter === "all" ? "image,video" : filter)

  return `https://images-api.nasa.gov/search?${params.toString()}`
}

export function buildNasaAssetUrl(nasaId: string) {
  return `https://images-api.nasa.gov/asset/${encodeURIComponent(nasaId)}`
}

export function parseNasaSearchResponse(value: unknown): ArtemisMediaItem[] {
  const response = value as NasaSearchResponse
  const items = response.collection?.items ?? []

  return items.flatMap((item) => {
    const data = item.data?.[0]
    const nasaId = data?.nasa_id
    const mediaType = data?.media_type
    const thumbnailUrl =
      item.links?.find((link) => link.rel === "preview")?.href ??
      item.links?.[0]?.href

    if (
      !data ||
      !item.href ||
      !nasaId ||
      (mediaType !== "image" && mediaType !== "video") ||
      !thumbnailUrl
    ) {
      return []
    }

    return [
      {
        assetUrl: item.href,
        center: data.center ?? "NASA",
        dateCreated: data.date_created ?? "",
        description: data.description ?? "",
        keywords: data.keywords ?? [],
        mediaType,
        nasaId,
        thumbnailUrl,
        title: data.title ?? nasaId,
      },
    ]
  })
}

export function parseNasaAssetResponse(value: unknown) {
  const response = value as NasaAssetResponse
  const hrefs = response.collection?.items?.map((item) => item.href ?? "") ?? []
  const mp4 =
    hrefs.find((href) => href.toLowerCase().endsWith(".mp4")) ??
    hrefs.find((href) => href.toLowerCase().includes(".mp4"))
  const image =
    hrefs.find((href) => href.toLowerCase().endsWith("~orig.jpg")) ??
    hrefs.find((href) => href.toLowerCase().endsWith(".jpg")) ??
    hrefs.find((href) => href.toLowerCase().endsWith(".png"))

  return {
    hrefs,
    image,
    mp4,
  }
}

export function formatNasaDate(value: string) {
  if (!value) {
    return "Unknown date"
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function compactDescription(value: string, limit = 180) {
  const normalized = value.replace(/\s+/g, " ").trim()

  if (!normalized) {
    return "No description returned by NASA Images API."
  }

  if (normalized.length <= limit) {
    return normalized
  }

  return `${normalized.slice(0, limit - 1).trim()}...`
}

export function getPhaseLabel(phaseId: string) {
  return (
    artemisTimelinePhases.find((phase) => phase.id === phaseId)?.label ??
    "Mission overview"
  )
}

export function getPhaseSearchHint(phaseId: string) {
  return (
    artemisTimelinePhases.find((phase) => phase.id === phaseId)?.searchHint ??
    defaultArtemisQuery
  )
}

export function createStoryBeatFromAsset({
  item,
  phaseId,
  sequence,
}: {
  item: ArtemisMediaItem
  phaseId: string
  sequence: number
}): StoryBeat {
  return {
    id: `beat-${item.nasaId}-${sequence}`,
    assetId: item.nasaId,
    angle: `Use this ${item.mediaType} to support the ${getPhaseLabel(
      phaseId
    ).toLowerCase()} beat.`,
    headline: item.title,
    narration: compactDescription(item.description, 260),
    phaseId,
    sourceNote: buildNasaAssetUrl(item.nasaId),
    verificationStatus: "NASA Images API result",
  }
}
