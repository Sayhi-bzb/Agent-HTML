import {
  Boxes,
  ClipboardCheck,
  FileCode2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { SankeyChart } from "../../components/chart/sankey-chart"
import type { ChartConfig } from "../../components/chart/types"
import { packageSankeyData } from "./data/blast-radius"
import { ReviewPanel, ReviewSectionHeader, ReviewStage } from "./review-layout"

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

const blastRadiusSummary = [
  ["source", "artifact source and shared primitives"],
  ["surface", "components/ui, styles, and theme presets"],
  ["gates", "typecheck, guard, index, and dependency checks"],
] as const
const blastRadiusSummaryIcons: Record<
  (typeof blastRadiusSummary)[number][0],
  LucideIcon
> = {
  gates: ClipboardCheck,
  source: FileCode2,
  surface: Boxes,
}

export default function BlastRadiusBlock() {
  return (
    <section className="canvas-stack-lg">
      <ReviewSectionHeader
        eyebrow="blast radius"
        title="The edit is only the center point."
      >
        Impact is mapped from authored artifact code into shared Canvas
        surfaces and required package gates.
      </ReviewSectionHeader>

      <div className="canvas-grid-main-aside-xl">
        <ReviewStage>
          <SankeyChart
            config={blastRadiusSankeyConfig}
            data={packageSankeyData}
            getLinkColorKey={() => "link"}
            getNodeColorKey={(node) => nodeColorKey(node.category)}
            layout={{
              aspectRatio: "5 / 2.8",
              margin: { top: 24, right: 96, bottom: 24, left: 96 },
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

        <ReviewPanel className="canvas-stack-sm">
          <div className="canvas-stack-xs">
            <p className="canvas-text-caption text-muted-foreground">
              review surface
            </p>
            <p className="canvas-text-body">
              Package impact moves from authored artifact code into shared
              Canvas surfaces and required gates.
            </p>
          </div>
          <div className="canvas-stack-xs">
            {blastRadiusSummary.map(([label, detail]) => {
              const Icon = blastRadiusSummaryIcons[label]

              return (
                <div className="rounded-md bg-muted/40 p-3" key={label}>
                  <p className="canvas-wrap-sm items-center canvas-text-caption text-muted-foreground">
                    <Icon data-icon="inline-start" />
                    <span>{label}</span>
                  </p>
                  <p className="canvas-text-body">{detail}</p>
                </div>
              )
            })}
          </div>
        </ReviewPanel>
      </div>
    </section>
  )
}
