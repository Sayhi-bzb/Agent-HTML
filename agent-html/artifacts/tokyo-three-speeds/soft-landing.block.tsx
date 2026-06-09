import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
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

import { arrivalMetrics, arrivalTimeline, mediaAssets } from "./data"

export function SoftLandingBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-grid-gap md:grid-cols-[1.1fr_0.9fr]">
        <div className="canvas-stack-lg">
          <div className="canvas-stack-sm">
            <div className="canvas-wrap-sm items-center">
              <Badge variant="secondary">Day 1</Badge>
              <Badge variant="outline">Soft Landing</Badge>
              <Badge variant="outline">low intensity</Badge>
            </div>
            <h1 className="canvas-text-title">
              第一天的任务不是打卡，而是让身体抵达。
            </h1>
            <p className="canvas-text-body text-muted-foreground">
              Tokyo starts as a short arrival strip: finish the airport move,
              set a base neighborhood, eat nearby, and protect the next two
              days.
            </p>
          </div>

          <Timeline activeIndex={1}>
            {arrivalTimeline.map((item) => (
              <TimelineItem key={item.label}>
                <TimelineDot />
                <TimelineConnector />
                <TimelineContent>
                  <TimelineHeader>
                    <TimelineTime>{item.time}</TimelineTime>
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

        <div className="canvas-stack-md">
          <figure className="canvas-stack-sm">
            <img
              alt={mediaAssets.arrival.alt}
              className="max-h-[520px] w-full rounded-md object-cover"
              src={mediaAssets.arrival.src}
            />
            <p className="canvas-text-caption text-muted-foreground">
              {mediaAssets.arrival.caption} {mediaAssets.arrival.credit}.
            </p>
          </figure>

          <div className="canvas-stack-sm">
            {arrivalMetrics.map((metric) => (
              <div className="canvas-stack-xs" key={metric.label}>
                <div className="canvas-wrap-sm items-center justify-between">
                  <span className="canvas-text-caption text-muted-foreground">
                    {metric.label}
                  </span>
                  <span className="canvas-text-caption">{metric.value}%</span>
                </div>
                <Progress value={metric.value} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
