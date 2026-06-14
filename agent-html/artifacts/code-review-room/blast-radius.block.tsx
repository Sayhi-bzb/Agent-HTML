import { SankeyChart } from "../../components/chart/sankey-chart"
import type { ChartConfig } from "../../components/chart/types"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs"
import { blastRadiusLayers, packageSankeyData } from "./data/blast-radius"
import {
  ReviewPanel,
  ReviewRailGrid,
  ReviewSectionHeader,
  ReviewStage,
} from "./review-layout"

const blastRadiusSankeyConfig = {
  link: {
    label: "Package edge",
  },
  landing: {
    label: "Landing",
  },
  outcome: {
    label: "Outcome",
  },
  source: {
    label: "Source",
  },
} satisfies ChartConfig

function nodeColorKey(category: unknown) {
  if (category === "source") {
    return "source"
  }

  if (category === "outcome") {
    return "outcome"
  }

  return "landing"
}

export default function BlastRadiusBlock() {
  return (
    <section className="canvas-stack-lg">
      <ReviewSectionHeader
        eyebrow="blast radius"
        title="The edit is only the center point."
      />

      <ReviewStage>
        <SankeyChart
          config={blastRadiusSankeyConfig}
          data={packageSankeyData}
          getLinkColorKey={() => "link"}
          getNodeColorKey={(node) => nodeColorKey(node.category)}
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
          renderer="texture"
          strokeOpacity={0.62}
          texture={{ density: "dense", kind: "lines", opacity: 0.8 }}
        />
      </ReviewStage>

      <ReviewPanel>
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
              className="mt-4"
              key={layer.value}
              value={layer.value}
            >
              <ReviewRailGrid className="md:grid-cols-3 xl:grid-cols-3">
                {layer.items.map(([name, detail]) => (
                  <div className="rounded-md bg-muted/40 p-3" key={name}>
                    <p className="canvas-text-caption text-muted-foreground">
                      {name}
                    </p>
                    <p className="canvas-text-body">{detail}</p>
                  </div>
                ))}
              </ReviewRailGrid>
            </TabsContent>
          ))}
        </Tabs>
      </ReviewPanel>
    </section>
  )
}
