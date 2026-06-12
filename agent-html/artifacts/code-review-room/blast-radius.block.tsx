import { SankeyChart } from "../../components/chart"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs"
import { blastRadiusLayers, packageSankeyData } from "./data/blast-radius"

function nodeColor(category: unknown) {
  if (category === "source") {
    return "var(--chart-1)"
  }

  if (category === "outcome") {
    return "var(--chart-3)"
  }

  return "var(--chart-2)"
}

export function BlastRadiusBlock() {
  return (
    <section className="canvas-stack-md">
      <div className="canvas-stack-xs">
        <p className="canvas-text-caption text-muted-foreground">
          blast radius
        </p>
        <h2 className="canvas-text-heading">
          The edit is only the center point.
        </h2>
      </div>

      <div className="grid gap-5 rounded-md bg-background p-4 lg:grid-cols-[minmax(0,0.62fr)_minmax(240px,0.38fr)]">
        <SankeyChart
          data={packageSankeyData}
          getLinkColor={() => "var(--chart-1)"}
          getNodeColor={(node) => nodeColor(node.category)}
          layout={{
            aspectRatio: "5 / 2.4",
            margin: { top: 24, right: 156, bottom: 24, left: 156 },
            nodePadding: 16,
            nodeRadius: 3,
            nodeWidth: 12,
          }}
          renderLinkTooltip={({ link }) => (
            <div className="grid gap-1">
              <strong>package edge</strong>
              <span>{link.value} review signals</span>
            </div>
          )}
          renderNodeTooltip={({ node }) => (
            <div className="grid gap-1">
              <strong>{node.name}</strong>
              <span>{node.value ?? 0} connected signals</span>
            </div>
          )}
          roughOptions={{
            bowing: 1.2,
            fillStyle: "hachure",
            roughness: 1.8,
          }}
          strokeOpacity={0.62}
        />

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
