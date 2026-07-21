import * as React from "react"
import { Canvas, Node } from "@agent-html/react"

import { AreaChart } from "@/components/chart/area-chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

const throughput = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 58 },
  { day: "Wed", value: 51 },
  { day: "Thu", value: 73 },
  { day: "Fri", value: 68 },
  { day: "Sat", value: 81 },
  { day: "Sun", value: 76 },
]

const activity = [
  "Checkout recovery shipped to 25% of traffic",
  "Inventory sync completed without conflicts",
  "Three enterprise renewals moved to review",
  "Mobile conversion alert returned to baseline",
  "Forecast model ingested the weekly snapshot",
  "Support backlog dropped below the target band",
]

function IntakeForm() {
  const [submitted, setSubmitted] = React.useState(false)

  return (
    <Card className="h-full rounded-none border-0 shadow-none ring-0">
      <CardHeader>
        <CardTitle>New work item</CardTitle>
        <CardDescription>
          Capture a request without leaving the map.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            setSubmitted(true)
          }}
        >
          <label className="grid gap-1.5 text-xs font-medium">
            Summary
            <Input
              name="summary"
              onChange={() => setSubmitted(false)}
              placeholder="Describe the outcome"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium">
            Owner
            <Input name="owner" placeholder="Team or person" />
          </label>
          <button
            className="h-8 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground"
            type="submit"
          >
            Add to plan
          </button>
          {submitted ? (
            <p className="text-xs text-emerald-600" role="status">
              Added to the current planning lane.
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  )
}

export default function OperationsCanvas() {
  return (
    <Canvas id="operations" title="Operations map">
      <Node id="planning-space" title="Planning space" type="group">
        <div className="h-full bg-muted/25 p-5">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Planning space
          </p>
        </div>
      </Node>

      <Node id="intake" parentId="planning-space" title="Intake form">
        <IntakeForm />
      </Node>

      <Node id="activity" parentId="planning-space" title="Activity stream">
        <Card className="h-full rounded-none border-0 shadow-none ring-0">
          <CardHeader>
            <CardTitle>Activity stream</CardTitle>
            <CardDescription>Live operational changes.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-0 flex-1">
            <ScrollArea className="h-full pr-3">
              <div className="grid gap-2">
                {activity.map((item, index) => (
                  <div
                    className="rounded-lg border bg-background p-3 text-xs leading-relaxed"
                    key={item}
                  >
                    <span className="mr-2 text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </Node>

      <Node id="throughput" title="Throughput chart">
        <Card className="h-full rounded-none border-0 shadow-none ring-0">
          <CardHeader>
            <CardTitle>Weekly throughput</CardTitle>
            <CardDescription>Completed work items by day.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-0 flex-1">
            <AreaChart
              aspectRatio="16 / 7"
              config={{ value: { color: "var(--chart-1)", label: "Items" } }}
              data={throughput}
              minHeight={210}
              xKey="day"
              yKey="value"
            />
          </CardContent>
        </Card>
      </Node>

      <Node id="decision" title="Decision card">
        <Card className="h-full rounded-none border-0 shadow-none ring-0">
          <CardHeader>
            <CardTitle>Release decision</CardTitle>
            <CardDescription>
              Signals are inside the expected band.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className="mt-1 text-xl font-semibold">92%</p>
            </div>
            <div className="rounded-lg bg-sky-500/10 p-3">
              <p className="text-xs text-muted-foreground">Open risks</p>
              <p className="mt-1 text-xl font-semibold">3</p>
            </div>
          </CardContent>
        </Card>
      </Node>
    </Canvas>
  )
}
