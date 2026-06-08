import { useEffect, useState } from "react"

import {
  buildNasaAssetUrl,
  parseNasaAssetResponse,
  parseNasaSearchResponse,
  type ArtemisMediaItem,
} from "./data"

export function useArtemisSearchResults({
  endpoint,
  limit,
  setItems,
  setSelectedId,
  setSourceFocusId,
}: {
  endpoint: string
  limit: number
  setItems: (items: ArtemisMediaItem[]) => void
  setSelectedId: (id: string | null) => void
  setSourceFocusId: (id: string | null) => void
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
        const nextSelectedId = nextItems[0]?.nasaId ?? null

        setItems(nextItems)
        setSelectedId(nextSelectedId)
        setSourceFocusId(nextSelectedId)
      })
      .catch((fetchError: unknown) => {
        if (!isCurrent) {
          return
        }

        setItems([])
        setSelectedId(null)
        setSourceFocusId(null)
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "NASA Images API search is pending verification."
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
  }, [endpoint, limit, setItems, setSelectedId, setSourceFocusId])

  return { error, isLoading }
}

export function useArtemisAssetRendition(item: ArtemisMediaItem | null) {
  const [renditionUrl, setRenditionUrl] = useState("")
  const [renditionError, setRenditionError] = useState("")

  useEffect(() => {
    let isCurrent = true

    setRenditionUrl("")
    setRenditionError("")

    if (!item) {
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
        const nextUrl = item.mediaType === "video" ? asset.mp4 : asset.image

        if (nextUrl) {
          setRenditionUrl(nextUrl)
          return
        }

        setRenditionError(
          "No direct rendition was found in the selected asset manifest."
        )
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return
        }

        setRenditionError(
          error instanceof Error
            ? error.message
            : "NASA asset lookup is pending verification."
        )
      })

    return () => {
      isCurrent = false
    }
  }, [item])

  return { renditionError, renditionUrl }
}
