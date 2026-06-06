import { useState } from "react"
import { Artifact, Block } from "@agent-html/react"

import { ApiSourceBlock } from "./nasa-media-workbench/api-source.block"
import {
  buildNasaSearchUrl,
  defaultNasaQuery,
  type NasaMediaFilter,
  type NasaMediaItem,
} from "./nasa-media-workbench/data"
import { MediaPreviewBlock } from "./nasa-media-workbench/media-preview.block"
import { MediaSearchBlock } from "./nasa-media-workbench/media-search.block"
import { MissionTimelineBlock } from "./nasa-media-workbench/mission-timeline.block"

export default function NasaMediaWorkbenchArtifact() {
  const [query, setQuery] = useState(defaultNasaQuery)
  const [filter, setFilter] = useState<NasaMediaFilter>("all")
  const [items, setItems] = useState<NasaMediaItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedItem =
    items.find((item) => item.nasaId === selectedId) ?? items[0] ?? null
  const endpoint = buildNasaSearchUrl({ filter, query })

  return (
    <Artifact title="NASA Media Workbench">
      <Block id="media-search" title="Media Search">
        <MediaSearchBlock
          endpoint={endpoint}
          filter={filter}
          items={items}
          query={query}
          selectedItem={selectedItem}
          setFilter={setFilter}
          setItems={setItems}
          setQuery={setQuery}
          setSelectedId={setSelectedId}
        />
      </Block>

      <Block id="media-preview" title="Media Preview">
        <MediaPreviewBlock item={selectedItem} />
      </Block>

      <Block id="mission-timeline" title="Mission Timeline">
        <MissionTimelineBlock items={items} selectedItem={selectedItem} />
      </Block>

      <Block id="api-source" title="API Source">
        <ApiSourceBlock endpoint={endpoint} item={selectedItem} />
      </Block>
    </Artifact>
  )
}
