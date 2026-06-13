import { AreaChart } from "../../components/chart/area-chart"
import type { ChartConfig } from "../../components/chart/types"
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

const defaultRouteValue = "workspace index refresh"
const decisionProfile =
  releaseRoutes.find((route) => route.value === defaultRouteValue)?.metrics ??
  releaseRoutes[0]?.metrics ??
  []

const decisionProfileConfig = {
  value: {
    color: "var(--chart-2)",
    label: "Decision strength",
  },
} satisfies ChartConfig

export function ReleaseRoutesBlock() {
  return (
    <section className="canvas-stack-md">
      <div className="canvas-stack-xs">
        <p className="canvas-text-caption text-muted-foreground">
          package routes
        </p>
        <h2 className="canvas-text-heading">
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

      <div className="grid gap-4 rounded-md bg-background p-4 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,0.68fr)] lg:items-center">
        <div className="canvas-stack-xs">
          <p className="canvas-text-caption text-muted-foreground">
            workspace index refresh
          </p>
          <h3 className="canvas-text-body">Decision profile</h3>
          <p className="canvas-text-caption text-muted-foreground">
            The draft route trades more time for stronger risk reduction and
            review confidence.
          </p>
        </div>
        <AreaChart
          aspectRatio="3 / 1"
          config={decisionProfileConfig}
          data={decisionProfile}
          minHeight={260}
          referenceY={75}
          renderer="texture"
          texture={{
            density: "normal",
            kind: "waves",
            opacity: 0.35,
          }}
          xKey="label"
          yKey="value"
          yValueFormatter={(value) => `${value}%`}
        />
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
                <h3 className="canvas-text-body">{route.value}</h3>
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
