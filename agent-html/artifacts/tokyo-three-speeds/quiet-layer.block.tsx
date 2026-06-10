import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion"
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

import { mediaAssets, quietOptions, quietRoute } from "./data"

export function QuietLayerBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-grid-gap md:grid-cols-[1fr_1fr]">
        <div className="canvas-stack-md">
          <div className="canvas-wrap-sm items-center">
            <Badge variant="secondary">quiet layer</Badge>
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
                    {stop.note}
                  </p>
                  <div className="canvas-wrap-sm items-center">
                    <Badge variant="outline">{stop.dwell}</Badge>
                    <span className="canvas-text-caption text-muted-foreground">
                      {stop.whyStay}
                    </span>
                  </div>
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
          <div className="canvas-grid-gap-md sm:grid-cols-3">
            <QuietDwell label="sit longer" value="Let the garden set the day speed." />
            <QuietDwell label="skip transfer" value="Cut one movement before adding one stop." />
            <QuietDwell label="leave unfinished" value="Keep the bookstore route open." />
          </div>
        </div>
      </div>

      <Accordion type="single" collapsible>
        {quietOptions.map((option) => (
          <AccordionItem key={option.label} value={option.label}>
            <AccordionTrigger>{option.choice}</AccordionTrigger>
            <AccordionContent>{option.note}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

function QuietDwell({ label, value }: { label: string; value: string }) {
  return (
    <div className="canvas-stack-xs">
      <Badge variant="outline">{label}</Badge>
      <p className="canvas-text-caption text-muted-foreground">{value}</p>
    </div>
  )
}
