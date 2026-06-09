import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"

import { dayRhythms, mapRegions } from "./data"

const regionToneClass: Record<string, string> = {
  arrival: "bg-muted text-muted-foreground",
  density: "bg-foreground text-background",
  quiet: "bg-secondary text-secondary-foreground",
}

export function RhythmPlanBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">three-day rhythm board</Badge>
        <h2 className="canvas-text-heading">
          东京太丰富，所以真正的问题不是去哪，而是如何取舍。
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          The board keeps the plan readable: each day has a speed, a radius,
          and a load profile before it has attractions.
        </p>
      </div>

      <div className="canvas-grid-gap md:grid-cols-[1.2fr_0.8fr]">
        <Tabs defaultValue={dayRhythms[1].day} className="canvas-stack-md">
          <TabsList>
            {dayRhythms.map((day) => (
              <TabsTrigger key={day.day} value={day.day}>
                {day.day}
              </TabsTrigger>
            ))}
          </TabsList>

          {dayRhythms.map((day) => (
            <TabsContent className="canvas-stack-md" key={day.day} value={day.day}>
              <div className="canvas-wrap-sm items-center">
                <Badge>{day.mood}</Badge>
                <Badge variant="outline">{day.range}</Badge>
              </div>
              <div className="canvas-grid-gap-md md:grid-cols-3">
                <LoadMetric label="energy" value={day.energy} />
                <LoadMetric label="transfer" value={day.transfer} />
                <LoadMetric label="walking" value={day.walking} />
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="canvas-stack-md">
          <div className="grid min-h-72 grid-cols-3 gap-2 rounded-md bg-muted/40 p-3">
            {mapRegions.map((region) => (
              <div
                className={`flex min-h-16 flex-col justify-between rounded-sm p-3 ${regionToneClass[region.tone]}`}
                key={`${region.day}-${region.label}`}
              >
                <span className="canvas-text-caption opacity-80">{region.day}</span>
                <span className="canvas-text-body">{region.label}</span>
              </div>
            ))}
          </div>
          <p className="canvas-text-caption text-muted-foreground">
            Abstract route map. © OpenStreetMap contributors for map context;
            regions shown as a planning layer, not a navigation product.
          </p>
        </div>
      </div>
    </section>
  )
}

function LoadMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="canvas-stack-xs">
      <div className="canvas-wrap-sm items-center justify-between">
        <span className="canvas-text-caption text-muted-foreground">{label}</span>
        <span className="canvas-text-caption">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  )
}
