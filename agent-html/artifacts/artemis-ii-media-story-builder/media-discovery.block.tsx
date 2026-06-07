import { useEffect, useState } from "react"
import {
  ImageIcon,
  Loader2Icon,
  PlusIcon,
  SearchIcon,
  VideoIcon,
} from "lucide-react"

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
  artemisTimelinePhases,
  compactDescription,
  formatNasaDate,
  getPhaseSearchHint,
  parseNasaSearchResponse,
  type ArtemisMediaFilter,
  type ArtemisMediaItem,
} from "./data"

type MediaDiscoveryBlockProps = {
  activePhaseId: string
  addSelectedItemToStory: () => void
  endpoint: string
  filter: ArtemisMediaFilter
  items: ArtemisMediaItem[]
  query: string
  selectedItem: ArtemisMediaItem | null
  setActivePhaseId: (id: string) => void
  setFilter: (filter: ArtemisMediaFilter) => void
  setItems: (items: ArtemisMediaItem[]) => void
  setQuery: (query: string) => void
  setSelectedId: (id: string | null) => void
  setSourceFocusId: (id: string | null) => void
}

function MediaKindIcon({ mediaType }: { mediaType: ArtemisMediaItem["mediaType"] }) {
  const Icon = mediaType === "video" ? VideoIcon : ImageIcon

  return <Icon data-icon="inline-start" />
}

export function MediaDiscoveryBlock({
  activePhaseId,
  addSelectedItemToStory,
  endpoint,
  filter,
  items,
  query,
  selectedItem,
  setActivePhaseId,
  setFilter,
  setItems,
  setQuery,
  setSelectedId,
  setSourceFocusId,
}: MediaDiscoveryBlockProps) {
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

        const nextItems = parseNasaSearchResponse(json).slice(0, 24)

        setItems(nextItems)
        setSelectedId(nextItems[0]?.nasaId ?? null)
        setSourceFocusId(nextItems[0]?.nasaId ?? null)
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
  }, [endpoint, setItems, setSelectedId, setSourceFocusId])

  function submitSearch() {
    setQuery(draftQuery)
  }

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">NASA Images API search</Badge>
          <Badge variant="outline">{items.length} results</Badge>
          {selectedItem ? (
            <Badge variant="outline">selected {selectedItem.mediaType}</Badge>
          ) : (
            <Badge variant="outline">source pending verification</Badge>
          )}
        </div>
        <h2 className="canvas-text-heading">Media discovery</h2>
        <p className="canvas-text-body text-muted-foreground">
          Search, filter, select, and attach NASA Images API results to the
          Artemis II story plan.
        </p>
      </div>

      <div className="canvas-content-panel canvas-stack-md">
        <div className="canvas-cluster-md flex-wrap items-center">
          <Input
            aria-label="NASA Images API search query"
            id="artemis-media-query"
            name="artemis-media-query"
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
          <Button
            disabled={!selectedItem}
            onClick={addSelectedItemToStory}
            type="button"
            variant="outline"
          >
            <PlusIcon data-icon="inline-start" />
            Add to story
          </Button>
        </div>

        <div className="canvas-cluster-md flex-wrap items-center">
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

          <ToggleGroup
            onValueChange={(value) => {
              if (artemisTimelinePhases.some((phase) => phase.id === value)) {
                setActivePhaseId(value)
                const hint = getPhaseSearchHint(value)
                setDraftQuery(hint)
                setQuery(hint)
              }
            }}
            type="single"
            value={activePhaseId}
          >
            {artemisTimelinePhases.slice(0, 4).map((phase) => (
              <ToggleGroupItem key={phase.id} value={phase.id}>
                {phase.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      {error ? (
        <Alert>
          <AlertDescription>
            {error} Source pending verification for live media results.
          </AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="canvas-cluster-md canvas-content-panel-sm items-center">
          <Loader2Icon data-icon="inline-start" />
          <p className="canvas-text-body text-muted-foreground">
            Loading NASA Images API search results...
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
              onClick={() => {
                setSelectedId(item.nasaId)
                setSourceFocusId(item.nasaId)
              }}
              type="button"
              variant="outline"
            >
              <img
                alt=""
                className="aspect-video w-full rounded-md object-cover"
                src={item.thumbnailUrl}
              />
              <span className="canvas-stack-xs">
                <span className="canvas-wrap-sm items-center">
                  <Badge variant="outline">
                    <MediaKindIcon mediaType={item.mediaType} />
                    {item.mediaType}
                  </Badge>
                  <span className="canvas-text-caption text-muted-foreground">
                    {formatNasaDate(item.dateCreated)}
                  </span>
                </span>
                <span className="canvas-text-body">{item.title}</span>
                <span className="canvas-text-caption text-muted-foreground">
                  {compactDescription(item.description, 120)}
                </span>
              </span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </section>
  )
}
