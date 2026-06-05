import { Badge } from "../../ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card"
import { Separator } from "../../ui/separator"

const pipelineNodes = [
  {
    label: "styles/tokens/*",
    summary:
      "Semantic values for color, font, radius, chart, host, artifact, and content tokens.",
  },
  {
    label: "styles/index.css",
    summary:
      "Tailwind, shadcn CSS, font imports, token mappings, and base styles.",
  },
  {
    label: "ui/*",
    summary:
      "Local shadcn-derived visual primitives used by artifacts and host.",
  },
  {
    label: "artifacts / host",
    summary: "Composition surfaces that use primitives and semantic layout.",
  },
  {
    label: "@agent-html/react",
    summary: "Headless Artifact and Block collaboration protocol.",
  },
]

function FlowNode({ label, summary }: { label: string; summary: string }) {
  return (
    <div className="canvas-stack-sm canvas-content-panel-sm min-w-0">
      <div className="canvas-cluster-sm items-center">
        <Badge>{label}</Badge>
      </div>
      <p className="canvas-text-body text-muted-foreground">{summary}</p>
    </div>
  )
}

export function CanvasPipelineBlock() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Canvas Design Pipeline</CardTitle>
        <CardDescription>
          Visual consistency comes from token values, CSS mappings, local
          primitives, and explicit artifact composition.
        </CardDescription>
      </CardHeader>
      <CardContent className="canvas-stack-lg">
        <div className="canvas-grid-gap-md md:grid-cols-2 lg:grid-cols-3">
          {pipelineNodes.map((node) => (
            <FlowNode
              key={node.label}
              label={node.label}
              summary={node.summary}
            />
          ))}
        </div>
        <Separator />
        <p className="canvas-text-body text-muted-foreground">
          Color, font, and radius flow through explicit tokens. Spacing,
          density, and typography scale are kept stable through local
          primitives, agent instructions, and guard checks.
        </p>
      </CardContent>
    </Card>
  )
}
