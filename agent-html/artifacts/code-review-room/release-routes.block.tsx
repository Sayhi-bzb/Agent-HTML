import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"

const routes = [
  {
    badge: "fastest",
    condition: "Only after duplicate-session and retry evidence is green.",
    metrics: [
      { label: "time cost", value: 38 },
      { label: "risk reduction", value: 62 },
      { label: "confidence", value: 58 },
    ],
    value: "merge after fixes",
  },
  {
    badge: "draft pick",
    condition: "Ship UI cleanup separately, keep session behavior isolated.",
    metrics: [
      { label: "time cost", value: 56 },
      { label: "risk reduction", value: 82 },
      { label: "confidence", value: 74 },
    ],
    value: "split review",
  },
  {
    badge: "strictest",
    condition: "Pause until billing recovery ownership is explicit.",
    metrics: [
      { label: "time cost", value: 80 },
      { label: "risk reduction", value: 91 },
      { label: "confidence", value: 66 },
    ],
    value: "hold for plan",
  },
]

export function ReleaseRoutesBlock() {
  return (
    <section className="canvas-stack-md">
      <div className="canvas-stack-xs">
        <p className="canvas-text-caption text-muted-foreground">
          release routes
        </p>
        <h2 className="canvas-text-subheading">
          The decision is a route, not a verdict.
        </h2>
      </div>

      <RadioGroup
        className="grid gap-4 lg:grid-cols-3"
        defaultValue={routes[1].value}
      >
        {routes.map((route) => (
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
