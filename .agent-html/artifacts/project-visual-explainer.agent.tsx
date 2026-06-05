import { Artifact, Block } from "@agent-html/react"

import { Alert, AlertDescription } from "../ui/alert"
import { Badge } from "../ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { Separator } from "../ui/separator"

const topologyNodes = [
  {
    label: "App",
    summary: "Human-facing workspace shell, gallery, pets, and app flows.",
  },
  {
    label: "Runtime",
    summary: "Legacy Agent-HTML DSL parsing, schema, rendering, and host integration.",
  },
  {
    label: "Canvas",
    summary: "Isolated React artifact workspace for agent-authored durable output.",
  },
]

const pipelineNodes = [
  {
    label: "styles/tokens/*",
    summary: "Semantic values for color, font, radius, chart, host, artifact, and content tokens.",
  },
  {
    label: "styles/index.css",
    summary: "Tailwind, shadcn CSS, font imports, token mappings, and base styles.",
  },
  {
    label: "ui/*",
    summary: "Local shadcn-derived visual primitives used by artifacts and host.",
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

const workflowSteps = [
  "Human asks for an artifact.",
  "Agent writes normal React source in .agent-html/artifacts.",
  "Artifact wraps semantic regions in stable Blocks.",
  "Guard checks structure, imports, primitives, and visual drift.",
  "Host renders the artifact and overlays inspectable Blocks.",
  "Human gives block-level feedback through the host overlay.",
]

const allowedSignals = [
  "local ui primitives",
  "semantic tokens",
  "compact layout scale",
  "hooks / lib / schema / data",
  "stable kebab-case blocks",
]

const blockedSignals = [
  "raw palette classes",
  "arbitrary values",
  "oversized typography",
  "raw common controls",
  "old runtime imports",
]

function FlowNode({
  label,
  summary,
}: {
  label: string
  summary: string
}) {
  return (
    <div className="canvas-stack-sm canvas-content-panel-sm min-w-0">
      <div className="canvas-cluster-sm items-center">
        <Badge>{label}</Badge>
      </div>
      <p className="canvas-text-body text-muted-foreground">{summary}</p>
    </div>
  )
}

function SignalList({
  items,
  label,
}: {
  items: string[]
  label: string
}) {
  return (
    <div className="canvas-stack-md canvas-content-panel-sm min-w-0">
      <p className="canvas-text-body">{label}</p>
      <div className="canvas-wrap-sm">
        {items.map((item) => (
          <Badge key={item} variant="secondary">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export default function ProjectVisualExplainer() {
  return (
    <Artifact title="AgentHTML Project Visual Explainer">
      <Block id="project-purpose" title="Project Purpose">
        <Card>
          <CardHeader>
            <CardTitle>AgentHTML Project Visual Explainer</CardTitle>
            <CardDescription>
              A compact map of how this project turns agent output into durable,
              inspectable React artifacts.
            </CardDescription>
          </CardHeader>
          <CardContent className="canvas-stack-md canvas-text-body">
            <p>
              AgentHTML is an agent artifact workspace. It gives agents a local
              operating context, a React Canvas preview host, and guardrails for
              stable collaboration.
            </p>
            <Alert>
              <AlertDescription>
                The goal is not a Storybook clone. The goal is addressable,
                reviewable, reusable, and continuously editable agent output.
              </AlertDescription>
            </Alert>
            <p className="canvas-text-body text-muted-foreground">
              Use the host overlay icon on this block to ask for a focused
              rewrite.
            </p>
          </CardContent>
        </Card>
      </Block>

      <Block id="system-topology" title="System Topology">
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
      </Block>

      <Block id="canvas-pipeline" title="Canvas Pipeline">
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
      </Block>

      <Block id="agent-workflow" title="Agent Workflow">
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
                <p className="canvas-text-body text-muted-foreground">
                  {step}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </Block>

      <Block id="guardrails" title="Guardrails">
        <Card>
          <CardHeader>
            <CardTitle>Guardrails</CardTitle>
            <CardDescription>
              Agent freedom stays inside reusable Canvas boundaries.
            </CardDescription>
          </CardHeader>
          <CardContent className="canvas-grid-gap md:grid-cols-2">
            <SignalList items={allowedSignals} label="Use" />
            <SignalList items={blockedSignals} label="Avoid" />
          </CardContent>
        </Card>
      </Block>
    </Artifact>
  )
}
