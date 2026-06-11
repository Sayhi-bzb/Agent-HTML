import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs"

const nodes = [
  { cx: 50, cy: 50, label: "session" },
  { cx: 31, cy: 34, label: "checkout" },
  { cx: 70, cy: 31, label: "payment" },
  { cx: 24, cy: 72, label: "retry job" },
  { cx: 75, cy: 70, label: "customer" },
]
const layers = [
  {
    items: [
      ["Checkout page", "starts session creation"],
      ["Subscription upgrade", "reuses session helper"],
      ["Admin replay", "can re-run stale intents"],
    ],
    value: "callers",
  },
  {
    items: [
      ["Payment adapter", "receives idempotency key"],
      ["Webhook retry", "reads intent state"],
      ["Session cache", "stores reusable lookup"],
    ],
    value: "downstream",
  },
  {
    items: [
      ["Duplicate charge", "highest severity failure mode"],
      ["Stale subscription", "state mismatch after retry"],
      ["Support ticket", "customer-visible recovery"],
    ],
    value: "impact",
  },
]

export function BlastRadiusBlock() {
  return (
    <section className="canvas-stack-md">
      <div className="canvas-stack-xs">
        <p className="canvas-text-caption text-muted-foreground">
          blast radius
        </p>
        <h2 className="canvas-text-subheading">
          The edit is only the center point.
        </h2>
      </div>

      <div className="grid gap-5 rounded-md bg-background p-4 lg:grid-cols-[minmax(0,0.62fr)_minmax(240px,0.38fr)]">
        <svg
          aria-label="Checkout change blast radius"
          className="min-h-80 w-full text-foreground"
          viewBox="0 0 100 100"
        >
          {[18, 34, 48].map((radius) => (
            <circle
              className="fill-transparent stroke-border"
              cx="50"
              cy="50"
              key={radius}
              r={radius}
              strokeDasharray="2 3"
            />
          ))}
          {nodes.map((node) => (
            <g key={node.label}>
              <circle
                className="fill-muted stroke-foreground"
                cx={node.cx}
                cy={node.cy}
                r="4"
              />
              <text
                className="fill-muted-foreground text-[4px]"
                x={node.cx + 5}
                y={node.cy + 1}
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>

        <Tabs defaultValue={layers[0].value}>
          <TabsList>
            {layers.map((layer) => (
              <TabsTrigger key={layer.value} value={layer.value}>
                {layer.value}
              </TabsTrigger>
            ))}
          </TabsList>
          {layers.map((layer) => (
            <TabsContent className="canvas-stack-sm" key={layer.value} value={layer.value}>
              {layer.items.map(([name, detail]) => (
                <div className="rounded-md bg-muted/40 p-3" key={name}>
                  <p className="canvas-text-caption text-muted-foreground">
                    {name}
                  </p>
                  <p className="canvas-text-body">{detail}</p>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
