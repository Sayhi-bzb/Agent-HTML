import { useEffect, useState } from "react"
import { ImageIcon, Loader2Icon, SearchIcon, VideoIcon } from "lucide-react"

import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { ScrollArea } from "../../components/ui/scroll-area"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../components/ui/toggle-group"

import {
  compactDescription,
  formatNasaDate,
  parseNasaSearchResponse,
  type NasaMediaFilter,
  type NasaMediaItem,
} from "./data"

type MediaSearchBlockProps = {
  endpoint: string
  filter: NasaMediaFilter
  items: NasaMediaItem[]
  query: string
  selectedItem: NasaMediaItem | null
  setFilter: (filter: NasaMediaFilter) => void
  setItems: (items: NasaMediaItem[]) => void
  setQuery: (query: string) => void
  setSelectedId: (id: string) => void
}

function MediaKindIcon({ mediaType }: { mediaType: NasaMediaItem["mediaType"] }) {
  const Icon = mediaType === "video" ? VideoIcon : ImageIcon

  return <Icon data-icon="inline-start" />
}

export function MediaSearchBlock({
  endpoint,
  filter,
  items,
  query,
  selectedItem,
  setFilter,
  setItems,
  setQuery,
  setSelectedId,
}: MediaSearchBlockProps) {
  const [draftQuery, setDraftQuery] = useState(query)
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

        const nextItems = parseNasaSearchResponse(json).slice(0, 18)

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
  }, [endpoint, setItems, setSelectedId])

  function submitSearch() {
    setQuery(draftQuery)
  }

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">Live NASA API</Badge>
          <Badge variant="outline">{items.length} results</Badge>
        </div>
        <h2 className="canvas-text-title">Media search workbench</h2>
        <p className="canvas-text-body text-muted-foreground">
          Search NASA images and videos, select an asset, and let the other
          blocks react to the same media state.
        </p>
      </div>

      <div className="canvas-content-panel canvas-stack-md">
        <div className="canvas-cluster-md flex-wrap items-center">
          <Input
            aria-label="NASA search query"
            id="nasa-media-query"
            name="nasa-media-query"
            onChange={(event) => setDraftQuery(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submitSearch()
              }
            }}
            value={draftQuery}
          />
          <Button onClick={submitSearch} type="button">
            <SearchIcon data-icon="inline-start" />
            Search
          </Button>
        </div>

        <ToggleGroup
          onValueChange={(value) => {
            if (value === "all" || value === "image" || value === "video") {
              setFilter(value)
            }
          }}
          type="single"
          value={filter}
        >
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="image">Images</ToggleGroupItem>
          <ToggleGroupItem value="video">Videos</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="canvas-cluster-md canvas-content-panel-sm items-center">
          <Loader2Icon data-icon="inline-start" />
          <p className="canvas-text-body text-muted-foreground">
            Loading NASA media...
          </p>
        </div>
      ) : null}

      <ScrollArea className="h-96 rounded-md border">
        <div className="canvas-grid-gap-md p-3 md:grid-cols-2">
          {items.map((item) => (
            <Button
              aria-pressed={selectedItem?.nasaId === item.nasaId}
              className="canvas-stack-sm h-auto w-full justify-start whitespace-normal border-border bg-background p-3 text-left text-foreground hover:bg-muted/30 aria-pressed:border-ring"
              key={item.nasaId}
              onClick={() => setSelectedId(item.nasaId)}
              type="button"
              variant="outline"
            >
              <img
                alt=""
                className="aspect-video w-full rounded-md object-cover"
                src={item.thumbnailUrl}
              />
              <div className="canvas-stack-xs">
                <div className="canvas-wrap-sm items-center">
                  <Badge variant="outline">
                    <MediaKindIcon mediaType={item.mediaType} />
                    {item.mediaType}
                  </Badge>
                  <span className="canvas-text-caption text-muted-foreground">
                    {formatNasaDate(item.dateCreated)}
                  </span>
                </div>
                <p className="canvas-text-body">{item.title}</p>
                <p className="canvas-text-caption text-muted-foreground">
                  {compactDescription(item.description, 120)}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </section>
  )
}
