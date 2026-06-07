import { useMemo, useState } from "react"
import { Artifact, Block } from "@agent-html/react"

import { AssetPreviewBlock } from "./artemis-ii-media-story-builder/asset-preview.block"
import {
  artemisTimelinePhases,
  buildNasaSearchUrl,
  createStoryBeatFromAsset,
  defaultArtemisQuery,
  initialStoryBeats,
  type ArtemisMediaFilter,
  type ArtemisMediaItem,
  type StoryBeat,
} from "./artemis-ii-media-story-builder/data"
import { MediaDiscoveryBlock } from "./artemis-ii-media-story-builder/media-discovery.block"
import { MissionTimelineBlock } from "./artemis-ii-media-story-builder/mission-timeline.block"
import { SourceTrackerBlock } from "./artemis-ii-media-story-builder/source-tracker.block"
import { StoryBuilderBlock } from "./artemis-ii-media-story-builder/story-builder.block"
import { ThemeSourceBlock } from "./artemis-ii-media-story-builder/theme-source.block"

export default function ArtemisIiMediaStoryBuilderArtifact() {
  const [query, setQuery] = useState(defaultArtemisQuery)
  const [filter, setFilter] = useState<ArtemisMediaFilter>("all")
  const [items, setItems] = useState<ArtemisMediaItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activePhaseId, setActivePhaseId] = useState(
    artemisTimelinePhases[0]?.id ?? "mission-overview"
  )
  const [sourceFocusId, setSourceFocusId] = useState<string | null>(null)
  const [storyBeats, setStoryBeats] =
    useState<StoryBeat[]>(initialStoryBeats)

  const selectedItem =
    items.find((item) => item.nasaId === selectedId) ?? items[0] ?? null
  const sourceFocusItem =
    items.find((item) => item.nasaId === sourceFocusId) ?? selectedItem
  const endpoint = useMemo(
    () => buildNasaSearchUrl({ filter, query }),
    [filter, query]
  )

  function addSelectedItemToStory() {
    if (!selectedItem) {
      return
    }

    setStoryBeats((current) => [
      ...current,
      createStoryBeatFromAsset({
        item: selectedItem,
        phaseId: activePhaseId,
        sequence: current.length + 1,
      }),
    ])
    setSourceFocusId(selectedItem.nasaId)
  }

  function updateStoryBeat(id: string, patch: Partial<StoryBeat>) {
    setStoryBeats((current) =>
      current.map((beat) => (beat.id === id ? { ...beat, ...patch } : beat))
    )
  }

  function removeStoryBeat(id: string) {
    setStoryBeats((current) => current.filter((beat) => beat.id !== id))
  }

  return (
    <Artifact title="Artemis II Media Story Builder">
      <Block id="theme-source" title="Theme Source">
        <ThemeSourceBlock
          activePhaseId={activePhaseId}
          endpoint={endpoint}
          setActivePhaseId={setActivePhaseId}
        />
      </Block>

      <Block id="media-discovery" title="Media Discovery">
        <MediaDiscoveryBlock
          activePhaseId={activePhaseId}
          endpoint={endpoint}
          filter={filter}
          items={items}
          query={query}
          selectedItem={selectedItem}
          setActivePhaseId={setActivePhaseId}
          setFilter={setFilter}
          setItems={setItems}
          setQuery={setQuery}
          setSelectedId={setSelectedId}
          setSourceFocusId={setSourceFocusId}
          addSelectedItemToStory={addSelectedItemToStory}
        />
      </Block>

      <Block id="mission-timeline" title="Mission Timeline">
        <MissionTimelineBlock
          activePhaseId={activePhaseId}
          items={items}
          selectedItem={selectedItem}
          setActivePhaseId={setActivePhaseId}
          setSelectedId={setSelectedId}
          storyBeats={storyBeats}
        />
      </Block>

      <Block id="asset-preview" title="Asset Preview">
        <AssetPreviewBlock
          addSelectedItemToStory={addSelectedItemToStory}
          item={selectedItem}
          setSourceFocusId={setSourceFocusId}
        />
      </Block>

      <Block id="source-tracker" title="Source Tracker">
        <SourceTrackerBlock
          endpoint={endpoint}
          item={sourceFocusItem}
          sourceFocusId={sourceFocusId}
          storyBeats={storyBeats}
        />
      </Block>

      <Block id="story-builder" title="Story Builder">
        <StoryBuilderBlock
          activePhaseId={activePhaseId}
          addSelectedItemToStory={addSelectedItemToStory}
          items={items}
          removeStoryBeat={removeStoryBeat}
          selectedItem={selectedItem}
          setSourceFocusId={setSourceFocusId}
          storyBeats={storyBeats}
          updateStoryBeat={updateStoryBeat}
        />
      </Block>
    </Artifact>
  )
}
