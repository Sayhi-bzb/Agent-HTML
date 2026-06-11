import { Badge } from "../../components/ui/badge"
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "../../components/timeline"

import { mediaAssets } from "./data/media"
import { quietRoute } from "./data/quiet-route"

export function QuietRouteBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-grid-gap md:grid-cols-[1fr_1fr]">
        <div className="canvas-stack-md">
          <div className="canvas-wrap-sm items-center">
            <Badge variant="secondary">quiet route</Badge>
            <Badge variant="outline">Day 3</Badge>
          </div>
          <h2 className="canvas-text-heading">
            Tokyo can speak at a lower volume.
          </h2>
          <Timeline defaultValue={2}>
            {quietRoute.map((stop, index) => (
              <TimelineItem key={stop.label} step={index + 1}>
                <TimelineIndicator />
                <TimelineSeparator />
                <TimelineContent>
                  <TimelineHeader>
                    <TimelineDate>{stop.time}</TimelineDate>
                    <TimelineTitle>{stop.label}</TimelineTitle>
                  </TimelineHeader>
                  <p className="canvas-text-caption text-muted-foreground">
                    {stop.note} {stop.dwell}. {stop.whyStay}
                  </p>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </div>

        <div className="canvas-stack-md">
          <figure className="canvas-stack-sm">
            <img
              alt={mediaAssets.quiet.alt}
              className="max-h-[420px] w-full rounded-md object-cover"
              src={mediaAssets.quiet.src}
            />
            <p className="canvas-text-caption text-muted-foreground">
              {mediaAssets.quiet.caption} {mediaAssets.quiet.credit}.
            </p>
          </figure>
        </div>
      </div>
    </section>
  )
}
