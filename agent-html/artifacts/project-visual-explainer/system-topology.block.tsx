import { Badge } from "../../components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"

const topologyNodes = [
  {
    label: "App",
    summary: "Human-facing workspace shell, gallery, pets, and app flows.",
  },
  {
    label: "Runtime",
    summary:
      "Legacy Agent-HTML DSL parsing, schema, rendering, and host integration.",
  },
  {
    label: "Canvas",
    summary:
      "Isolated React artifact workspace for agent-authored durable output.",
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

export function SystemTopologyBlock() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Topology</CardTitle>
        <CardDescription>
          App consumes Runtime. Canvas is a separate React-first topology.
        </CardDescription>
      </CardHeader>
      <CardContent className="canvas-grid-gap lg:grid-cols-3">
        {topologyNodes.map((node) => (
          <FlowNode
            key={node.label}
            label={node.label}
            summary={node.summary}
          />
        ))}
      </CardContent>
    </Card>
  )
}
