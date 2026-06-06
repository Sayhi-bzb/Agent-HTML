import { Badge } from "../../components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"

const workflowSteps = [
  "Human asks for an artifact.",
  "Agent writes normal React source in .agent-html/artifacts.",
  "Artifact wraps semantic regions in stable Blocks.",
  "Guard checks structure, imports, primitives, and visual drift.",
  "Host renders the artifact and overlays inspectable Blocks.",
  "Human gives block-level feedback through the host overlay.",
]

export function AgentWorkflowBlock() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Artifact Workflow</CardTitle>
        <CardDescription>
          A request becomes durable source, then an inspectable canvas.
        </CardDescription>
      </CardHeader>
      <CardContent className="canvas-stack-md">
        {workflowSteps.map((step, index) => (
          <div
            className="canvas-cluster-md canvas-content-panel-sm min-w-0 items-start"
            key={step}
          >
            <Badge>{index + 1}</Badge>
            <p className="canvas-text-body text-muted-foreground">{step}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
