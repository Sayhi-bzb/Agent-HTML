import { Badge } from "../../components/ui/badge"
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "../../components/timeline"

import { mediaAssets, missionRoutePhases } from "./data"

export function MissionRouteBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">nine-day route</Badge>
        <h2 className="canvas-text-heading">
          This is not a straight trip, but a deep-space route shaped by safety.
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          The route board uses the existing Timeline component while the
          surrounding panels explain why each node matters.
        </p>
      </div>

      <figure className="canvas-stack-sm">
        <img
          alt={mediaAssets.route.alt}
          className="max-h-[32rem] w-full rounded-md object-contain"
          src={mediaAssets.route.src}
        />
        <p className="canvas-text-caption text-muted-foreground">
          {mediaAssets.route.caption} {mediaAssets.route.credit}.
        </p>
      </figure>

      <Timeline activeIndex={3}>
        {missionRoutePhases.map((phase) => (
          <TimelineItem key={phase.id}>
            <TimelineDot />
            <TimelineConnector />
            <TimelineContent>
              <div className="canvas-stack-xs">
                <TimelineHeader>
                  <TimelineTime>{phase.time}</TimelineTime>
                  <TimelineTitle>{phase.label}</TimelineTitle>
                </TimelineHeader>
                <p className="canvas-text-body">{phase.note}</p>
                <p className="canvas-text-caption text-muted-foreground">
                  Why it matters: {phase.why}
                </p>
              </div>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </section>
  )
}
