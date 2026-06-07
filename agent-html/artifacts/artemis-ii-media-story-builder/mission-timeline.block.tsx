import { CalendarDaysIcon, ImageIcon, VideoIcon } from "lucide-react"

import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Separator } from "../../components/ui/separator"

import {
  artemisTimelinePhases,
  compactDescription,
  formatNasaDate,
  type ArtemisMediaItem,
  type StoryBeat,
} from "./data"

type MissionTimelineBlockProps = {
  activePhaseId: string
  items: ArtemisMediaItem[]
  selectedItem: ArtemisMediaItem | null
  setActivePhaseId: (id: string) => void
  setSelectedId: (id: string) => void
  storyBeats: StoryBeat[]
}

function TimelineAsset({
  item,
  selected,
  setSelectedId,
}: {
  item: ArtemisMediaItem
  selected: boolean
  setSelectedId: (id: string) => void
}) {
  const Icon = item.mediaType === "video" ? VideoIcon : ImageIcon

  return (
    <Button
      aria-pressed={selected}
      className="canvas-cluster-md h-auto w-full items-start justify-start whitespace-normal p-3 text-left"
      onClick={() => setSelectedId(item.nasaId)}
      type="button"
      variant={selected ? "default" : "outline"}
    >
      <span className="canvas-icon-box-sm">
        <Icon />
      </span>
      <span className="canvas-stack-xs min-w-0">
        <span className="canvas-wrap-sm items-center">
          <Badge variant="outline">{formatNasaDate(item.dateCreated)}</Badge>
          <Badge variant="outline">{item.center}</Badge>
        </span>
        <span className="canvas-text-body">{item.title}</span>
        <span className="canvas-text-caption text-muted-foreground">
          {compactDescription(item.description, 130)}
        </span>
      </span>
    </Button>
  )
}

export function MissionTimelineBlock({
  activePhaseId,
  items,
  selectedItem,
  setActivePhaseId,
  setSelectedId,
  storyBeats,
}: MissionTimelineBlockProps) {
  const timelineItems = [...items]
    .sort(
      (left, right) =>
        Date.parse(left.dateCreated) - Date.parse(right.dateCreated)
    )
    .slice(0, 8)

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">
            <CalendarDaysIcon data-icon="inline-start" />
            {storyBeats.length} story beats
          </Badge>
          {selectedItem ? (
            <Badge variant="outline">selected {selectedItem.nasaId}</Badge>
          ) : (
            <Badge variant="outline">source pending verification</Badge>
          )}
        </div>
        <h2 className="canvas-text-heading">Mission narrative timeline</h2>
        <p className="canvas-text-body text-muted-foreground">
          Use the source page structure as a planning timeline, then bind live
          NASA Images API results to each beat.
        </p>
      </div>

      <div className="canvas-grid-gap md:grid-cols-2">
        {artemisTimelinePhases.map((phase) => {
          const beatCount = storyBeats.filter(
            (beat) => beat.phaseId === phase.id
          ).length

          return (
            <Button
              aria-pressed={activePhaseId === phase.id}
              className="canvas-stack-sm h-auto items-start justify-start whitespace-normal p-3 text-left"
              key={phase.id}
              onClick={() => setActivePhaseId(phase.id)}
              type="button"
              variant={activePhaseId === phase.id ? "default" : "outline"}
            >
              <span className="canvas-wrap-sm items-center">
                <span>{phase.label}</span>
                <Badge variant="outline">{beatCount} beats</Badge>
              </span>
              <span className="canvas-text-caption text-muted-foreground">
                {phase.summary}
              </span>
            </Button>
          )
        })}
      </div>

      <Separator />

      <div className="canvas-stack-md">
        {timelineItems.length > 0 ? (
          timelineItems.map((item) => (
            <TimelineAsset
              item={item}
              key={item.nasaId}
              selected={selectedItem?.nasaId === item.nasaId}
              setSelectedId={setSelectedId}
            />
          ))
        ) : (
          <div className="canvas-content-panel-sm canvas-stack-xs">
            <p className="canvas-text-body">No live media results yet.</p>
            <p className="canvas-text-caption text-muted-foreground">
              Source pending verification until a NASA Images API search
              returns assets.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
