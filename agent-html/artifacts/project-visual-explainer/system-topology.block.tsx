import { ArrowRightIcon } from "lucide-react"

import { Badge } from "../../components/ui/badge"

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

function TopologyNode({ label, summary }: { label: string; summary: string }) {
  return (
    <div className="canvas-content-panel canvas-stack-sm min-w-0">
      <div className="canvas-wrap-sm items-center">
        <Badge variant={label === "Canvas" ? "default" : "secondary"}>
          {label}
        </Badge>
        {label === "Canvas" ? (
          <span className="canvas-text-caption text-muted-foreground">
            current route
          </span>
        ) : null}
      </div>
      <p className="canvas-text-body text-muted-foreground">{summary}</p>
    </div>
  )
}

export function SystemTopologyBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <h2 className="canvas-text-heading">System topology</h2>
        <p className="canvas-text-body text-muted-foreground">
          App consumes Runtime. Canvas is a separate React-first topology.
        </p>
      </div>

      <div className="canvas-grid-gap lg:grid-cols-3">
        {topologyNodes.map((node, index) => (
          <div className="canvas-stack-sm min-w-0" key={node.label}>
            <TopologyNode label={node.label} summary={node.summary} />
            {index < topologyNodes.length - 1 ? (
              <div className="canvas-cluster-sm items-center text-muted-foreground lg:hidden">
                <ArrowRightIcon data-icon="inline-start" />
                <span className="canvas-text-caption">separate boundary</span>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <p className="canvas-text-body text-muted-foreground">
        The archive can explain history, but current artifact work should route
        through Canvas source, host, and guard contracts.
      </p>
    </section>
  )
}
