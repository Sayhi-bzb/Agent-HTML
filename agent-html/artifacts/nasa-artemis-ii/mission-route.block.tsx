import { Badge } from "../../components/ui/badge"
import { StatusBadge } from "../../components/ui/status-badge"
import {
  Timeline,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "../../components/timeline"
import { cn } from "../../lib/cn"

import { mediaAssets, missionRoutePhases } from "./data"

const routeConstraints = [
  {
    label: "Safety-shaped path",
    summary:
      "The route is built around proving deep-space systems without treating the Moon as a one-way target.",
  },
  {
    label: "Checkout before commitment",
    summary:
      "Earth orbit testing gives Orion and the crew a close-to-home validation window before the outbound leg.",
  },
  {
    label: "Free-return logic",
    summary:
      "The return path is part of the route design, keeping recovery connected to every major decision.",
  },
]

const activeLeg = missionRoutePhases.find((phase) => phase.id === "lunar-flyby")

export function MissionRouteBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">nine-day route</Badge>
        <h2 className="canvas-text-heading">
          This is not a straight trip, but a deep-space route shaped by safety.
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          The route timeline anchors each phase while the surrounding panels
          explain why each node matters.
        </p>
      </div>

      <div className="canvas-grid-gap sm:grid-cols-[1.05fr_0.95fr]">
        <Timeline className="w-full" defaultValue={4}>
          {missionRoutePhases.map((phase, index) => (
            <TimelineItem
              className={cn(
                "w-[calc(50%-1.5rem)] odd:ms-auto even:me-auto even:text-right even:group-data-[orientation=vertical]/timeline:ms-0 even:group-data-[orientation=vertical]/timeline:me-8",
                "even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-indicator]:-right-6 even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-indicator]:left-auto",
                "even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-indicator]:translate-x-1/2 even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-separator]:-right-6",
                "even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-separator]:left-auto even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-separator]:translate-x-1/2"
              )}
              key={phase.id}
              step={index + 1}
            >
              <TimelineHeader>
                <TimelineSeparator />
                <TimelineDate>{phase.time}</TimelineDate>
                <TimelineTitle>{phase.label}</TimelineTitle>
                <TimelineIndicator />
              </TimelineHeader>
            </TimelineItem>
          ))}
        </Timeline>

        <aside className="canvas-stack-md">
          <figure className="canvas-stack-sm">
            <img
              alt={mediaAssets.route.alt}
              className="max-h-80 w-full rounded-md object-contain"
              src={mediaAssets.route.src}
            />
            <p className="canvas-text-caption text-muted-foreground">
              {mediaAssets.route.caption} {mediaAssets.route.credit}.
            </p>
          </figure>

          <div className="canvas-stack-sm">
            <Badge variant="secondary">route constraints</Badge>
            <div className="canvas-grid-gap-md">
              {routeConstraints.map((constraint) => (
                <article className="canvas-stack-xs" key={constraint.label}>
                  <p className="canvas-text-body">{constraint.label}</p>
                  <p className="canvas-text-caption text-muted-foreground">
                    {constraint.summary}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {activeLeg ? (
            <div className="canvas-stack-xs rounded-md border border-primary/30 bg-primary/5 p-4">
              <StatusBadge status="success">{activeLeg.time}</StatusBadge>
              <p className="canvas-text-body">Active leg: {activeLeg.label}</p>
              <p className="canvas-text-caption text-muted-foreground">
                {activeLeg.why}
              </p>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  )
}
