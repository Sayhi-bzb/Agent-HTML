import { Badge } from "../../components/ui/badge"

const workflowSteps = [
  "Human asks for an artifact.",
  "Agent writes normal React source in agent-html/artifacts.",
  "Artifact wraps semantic regions in stable Blocks.",
  "Guard checks structure, imports, primitives, and visual drift.",
  "Host renders the artifact and overlays inspectable Blocks.",
  "Human gives block-level feedback through the host overlay.",
]

export function AgentWorkflowBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <h2 className="canvas-text-heading">
          Agent artifact workflow
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          A request becomes durable source, then an inspectable canvas.
        </p>
      </div>

      <div className="canvas-grid-gap-md md:grid-cols-2">
        {workflowSteps.map((step, index) => (
          <div
            className="canvas-cluster-md canvas-content-panel-sm min-w-0 items-start"
            key={step}
          >
            <Badge variant={index === 0 ? "default" : "secondary"}>
              {index + 1}
            </Badge>
            <p className="canvas-text-body text-muted-foreground">{step}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
