import { useEffect, useState } from "react"

import {
  buildNasaAssetUrl,
  parseNasaAssetResponse,
  parseNasaSearchResponse,
  type NasaMediaItem,
} from "./data"

export function useNasaSearchResults({
  endpoint,
  limit,
  setItems,
  setSelectedId,
}: {
  endpoint: string
  limit: number
  setItems: (items: NasaMediaItem[]) => void
  setSelectedId: (id: string) => void
}) {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isCurrent = true

    setError("")
    setIsLoading(true)

    fetch(endpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`NASA search failed with ${response.status}`)
        }

        return response.json()
      })
      .then((json) => {
        if (!isCurrent) {
          return
        }

        const nextItems = parseNasaSearchResponse(json).slice(0, limit)

        setItems(nextItems)

        if (nextItems.length > 0) {
          setSelectedId(nextItems[0].nasaId)
        }
      })
      .catch((fetchError: unknown) => {
        if (!isCurrent) {
          return
        }

        setItems([])
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "NASA search request failed."
        )
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [endpoint, limit, setItems, setSelectedId])

  return { error, isLoading }
}

export function useNasaVideoRendition(item: NasaMediaItem | null) {
  const [videoUrl, setVideoUrl] = useState("")
  const [videoError, setVideoError] = useState("")

  useEffect(() => {
    let isCurrent = true

    setVideoUrl("")
    setVideoError("")

    if (!item || item.mediaType !== "video") {
      return () => {
        isCurrent = false
      }
    }

    fetch(buildNasaAssetUrl(item.nasaId))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`NASA asset lookup failed with ${response.status}`)
        }

        return response.json()
      })
      .then((json) => {
        if (!isCurrent) {
          return
        }

        const asset = parseNasaAssetResponse(json)

        if (asset.mp4) {
          setVideoUrl(asset.mp4)
          return
        }

        setVideoError("No playable MP4 rendition was found for this asset.")
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return
        }

        setVideoError(
          error instanceof Error ? error.message : "NASA asset lookup failed."
        )
      })

    return () => {
      isCurrent = false
    }
  }, [item])

  return { videoError, videoUrl }
}
