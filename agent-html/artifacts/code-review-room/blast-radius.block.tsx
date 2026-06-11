import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs"
import { blastRadiusLayers, blastRadiusNodes } from "./data/blast-radius"

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
          aria-label="Agent-HTML code-health blast radius"
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
          {blastRadiusNodes.map((node) => (
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

        <Tabs defaultValue={blastRadiusLayers[0].value}>
          <TabsList>
            {blastRadiusLayers.map((layer) => (
              <TabsTrigger key={layer.value} value={layer.value}>
                {layer.value}
              </TabsTrigger>
            ))}
          </TabsList>
          {blastRadiusLayers.map((layer) => (
            <TabsContent
              className="canvas-stack-sm"
              key={layer.value}
              value={layer.value}
            >
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
