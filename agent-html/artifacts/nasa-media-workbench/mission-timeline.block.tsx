import { CalendarDaysIcon, ImageIcon, VideoIcon } from "lucide-react"

import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"

import {
  compactDescription,
  formatNasaDate,
  type NasaMediaItem,
} from "./data"

type MissionTimelineBlockProps = {
  items: NasaMediaItem[]
  selectedItem: NasaMediaItem | null
}

function TimelineItem({
  item,
  selected,
}: {
  item: NasaMediaItem
  selected: boolean
}) {
  const Icon = item.mediaType === "video" ? VideoIcon : ImageIcon

  return (
    <div className="canvas-cluster-md canvas-content-panel-sm min-w-0 items-start">
      <div className="canvas-icon-box-sm">
        <Icon />
      </div>
      <div className="canvas-stack-sm min-w-0">
        <div className="canvas-wrap-sm items-center">
          <Badge variant={selected ? "default" : "secondary"}>
            {formatNasaDate(item.dateCreated)}
          </Badge>
          <Badge variant="outline">{item.center}</Badge>
        </div>
        <p className="canvas-text-body">{item.title}</p>
        <p className="canvas-text-caption text-muted-foreground">
          {compactDescription(item.description, 130)}
        </p>
      </div>
    </div>
  )
}

export function MissionTimelineBlock({
  items,
  selectedItem,
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
            timeline
          </Badge>
          {selectedItem ? (
            <Badge variant="outline">selected: {selectedItem.nasaId}</Badge>
          ) : null}
        </div>
        <h2 className="canvas-text-heading">Mission media timeline</h2>
        <p className="canvas-text-body text-muted-foreground">
          The same search results can become a chronological view without
          changing the source data.
        </p>
      </div>

      <Separator />

      <div className="canvas-stack-md">
        {timelineItems.map((item) => (
          <TimelineItem
            item={item}
            key={item.nasaId}
            selected={selectedItem?.nasaId === item.nasaId}
          />
        ))}
      </div>
    </section>
  )
}
