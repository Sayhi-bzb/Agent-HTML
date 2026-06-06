import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"

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
    label: "components/ui/*",
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

function PipelineStep({
  index,
  label,
  summary,
}: {
  index: number
  label: string
  summary: string
}) {
  return (
    <div className="canvas-cluster-md canvas-content-panel-sm min-w-0 items-start">
      <Badge variant="secondary">{index}</Badge>
      <div className="canvas-stack-sm min-w-0">
        <code className="canvas-text-body">{label}</code>
        <p className="canvas-text-body text-muted-foreground">{summary}</p>
      </div>
    </div>
  )
}

export function CanvasPipelineBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <h2 className="canvas-text-heading">
          Canvas design pipeline
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          Visual consistency comes from token values, CSS mappings, local
          primitives, and explicit artifact composition.
        </p>
      </div>

      <div className="canvas-grid-gap-md md:grid-cols-2">
        {pipelineNodes.map((node, index) => (
          <PipelineStep
            index={index + 1}
            key={node.label}
            label={node.label}
            summary={node.summary}
          />
        ))}
      </div>

      <Separator />

      <div className="canvas-cluster-md canvas-content-panel items-start">
        <Badge>rule</Badge>
        <p className="canvas-text-body text-muted-foreground">
          Color, font, radius, spacing, density, and typography should flow
          through reusable Canvas layers before a block invents local treatment.
        </p>
      </div>
    </section>
  )
}
