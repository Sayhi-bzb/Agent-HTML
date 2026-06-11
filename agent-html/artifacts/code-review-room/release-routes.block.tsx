import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
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
import { packageTimelineSteps, releaseRoutes } from "./data/review-decision"

export function ReleaseRoutesBlock() {
  return (
    <section className="canvas-stack-md">
      <div className="canvas-stack-xs">
        <p className="canvas-text-caption text-muted-foreground">
          package routes
        </p>
        <h2 className="canvas-text-subheading">
          The path depends on which Canvas package boundary is touched.
        </h2>
      </div>

      <div className="rounded-md bg-background p-4">
        <Timeline className="w-full" defaultValue={2} orientation="horizontal">
          {packageTimelineSteps.map((step) => (
            <TimelineItem key={step.label} step={step.step}>
              <TimelineIndicator />
              <TimelineSeparator />
              <TimelineContent>
                <TimelineHeader>
                  <TimelineDate>{step.time}</TimelineDate>
                  <TimelineTitle>{step.label}</TimelineTitle>
                </TimelineHeader>
                <p className="canvas-text-caption text-muted-foreground">
                  {step.detail}
                </p>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </div>

      <RadioGroup
        className="grid gap-4 lg:grid-cols-3"
        defaultValue={releaseRoutes[1].value}
      >
        {releaseRoutes.map((route) => (
          <label
            className="canvas-stack-sm rounded-md bg-background p-4"
            key={route.value}
          >
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="canvas-text-caption text-muted-foreground">
                  option
                </p>
                <RadioGroupItem value={route.value} />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <h3 className="canvas-text-body font-semibold">
                  {route.value}
                </h3>
                <Badge variant="secondary">{route.badge}</Badge>
              </div>
              <p className="mt-2 canvas-text-caption text-muted-foreground">
                {route.condition}
              </p>
            </div>
            {route.metrics.map((item) => (
              <div className="canvas-stack-xs" key={item.label}>
                <span className="canvas-text-caption text-muted-foreground">
                  {item.label}
                </span>
                <Progress value={item.value} />
              </div>
            ))}
          </label>
        ))}
      </RadioGroup>
    </section>
  )
}
