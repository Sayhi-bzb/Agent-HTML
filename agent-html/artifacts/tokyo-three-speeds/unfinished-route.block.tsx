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

import { mediaAssets, openLoopItems } from "./data"

export function UnfinishedRouteBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-grid-gap md:grid-cols-[0.9fr_1.1fr]">
        <div className="canvas-stack-md">
          <div className="canvas-wrap-sm items-center">
            <Badge variant="secondary">open loop</Badge>
            <Badge variant="outline">next time</Badge>
          </div>
          <h2 className="canvas-text-heading">
            好的城市计划，不是把城市用完，而是知道下次从哪里继续。
          </h2>
          <p className="canvas-text-body text-muted-foreground">
            The ending should leave a route open, not convert Tokyo into a
            completed checklist.
          </p>

          <Timeline activeIndex={2}>
            {openLoopItems.map((item, index) => (
              <TimelineItem key={item.label}>
                <TimelineDot />
                <TimelineConnector />
                <TimelineContent>
                  <TimelineHeader>
                    <TimelineTime>next {index + 1}</TimelineTime>
                    <TimelineTitle>{item.label}</TimelineTitle>
                  </TimelineHeader>
                  <p className="canvas-text-caption text-muted-foreground">
                    {item.note}
                  </p>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </div>

        <figure className="canvas-stack-sm">
          <img
            alt={mediaAssets.openLoop.alt}
            className="max-h-[520px] w-full rounded-md object-cover"
            src={mediaAssets.openLoop.src}
          />
          <p className="canvas-text-caption text-muted-foreground">
            {mediaAssets.openLoop.caption} {mediaAssets.openLoop.credit}.
          </p>
        </figure>
      </div>
    </section>
  )
}
