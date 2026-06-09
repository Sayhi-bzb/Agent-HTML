import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion"
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

import { mediaAssets, quietMetrics, quietOptions, quietRoute } from "./data"

export function QuietLayerBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-grid-gap md:grid-cols-[1fr_1fr]">
        <div className="canvas-stack-md">
          <div className="canvas-wrap-sm items-center">
            <Badge variant="secondary">quiet layer</Badge>
            <Badge variant="outline">Day 3</Badge>
          </div>
          <h2 className="canvas-text-heading">东京也可以很低声量。</h2>
          <Timeline activeIndex={1}>
            {quietRoute.map((stop) => (
              <TimelineItem key={stop.label}>
                <TimelineDot />
                <TimelineConnector />
                <TimelineContent>
                  <TimelineHeader>
                    <TimelineTime>{stop.time}</TimelineTime>
                    <TimelineTitle>{stop.label}</TimelineTitle>
                  </TimelineHeader>
                  <p className="canvas-text-caption text-muted-foreground">
                    {stop.note}
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
          {quietMetrics.map((metric) => (
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

      <Accordion type="single" collapsible>
        {quietOptions.map((option) => (
          <AccordionItem key={option.label} value={option.label}>
            <AccordionTrigger>{option.label}</AccordionTrigger>
            <AccordionContent>{option.note}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
