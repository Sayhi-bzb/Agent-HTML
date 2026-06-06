export type NasaMediaFilter = "all" | "image" | "video"

export type NasaMediaItem = {
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

export const defaultNasaQuery = "Artemis"

export function buildNasaSearchUrl({
  filter,
  query,
}: {
  filter: NasaMediaFilter
  query: string
}) {
  const params = new URLSearchParams()

  params.set("q", query.trim() || defaultNasaQuery)
  params.set("media_type", filter === "all" ? "image,video" : filter)

  return `https://images-api.nasa.gov/search?${params.toString()}`
}

export function buildNasaAssetUrl(nasaId: string) {
  return `https://images-api.nasa.gov/asset/${encodeURIComponent(nasaId)}`
}

export function parseNasaSearchResponse(value: unknown): NasaMediaItem[] {
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

  return {
    hrefs,
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

  if (normalized.length <= limit) {
    return normalized
  }

  return `${normalized.slice(0, limit - 1).trim()}…`
}
