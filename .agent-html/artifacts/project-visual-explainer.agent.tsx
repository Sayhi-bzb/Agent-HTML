import { Action, Artifact, Block } from "@agent-html/react"

import { Alert, AlertDescription } from "../ui/alert"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
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
    label: "theme.css",
    summary: "Semantic values for color, font, radius, chart, and sidebar tokens.",
  },
  {
    label: "styles.css",
    summary: "Tailwind, shadcn CSS, font imports, token bridge, and base styles.",
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
    summary: "Headless Artifact, Block, and Action collaboration protocol.",
  },
]

const workflowSteps = [
  "Human asks for an artifact.",
  "Agent writes normal React source in .agent-html/artifacts.",
  "Artifact wraps semantic regions in stable Blocks.",
  "Guard checks structure, imports, primitives, and visual drift.",
  "Host renders the artifact and overlays inspectable Blocks.",
  "Human gives block-level feedback or triggers an Action.",
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
    <div className="flex min-w-0 flex-col gap-2 rounded-md border border-border p-3">
      <div className="flex items-center gap-2">
        <Badge>{label}</Badge>
      </div>
      <p className="text-sm leading-normal text-muted-foreground">{summary}</p>
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
    <div className="flex min-w-0 flex-col gap-3 rounded-md border border-border p-3">
      <p className="text-sm leading-normal">{label}</p>
      <div className="flex flex-wrap gap-2">
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
    <Artifact
      className="mx-auto flex w-full max-w-4xl flex-col gap-4 bg-background p-4 text-foreground"
      title="AgentHTML Project Visual Explainer"
    >
      <Block id="project-purpose" title="Project Purpose">
        <Card>
          <CardHeader>
            <CardTitle>AgentHTML Project Visual Explainer</CardTitle>
            <CardDescription>
              A compact map of how this project turns agent output into durable,
              inspectable React artifacts.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm leading-normal">
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
            <Button asChild>
              <Action
                prompt="Tighten the project-purpose block into a shorter executive explanation."
                target="project-purpose"
              >
                Improve purpose
              </Action>
            </Button>
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
          <CardContent className="grid gap-4 lg:grid-cols-3">
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
              Visual consistency comes from token values, a CSS bridge, local
              primitives, and explicit artifact composition.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {pipelineNodes.map((node) => (
                <FlowNode
                  key={node.label}
                  label={node.label}
                  summary={node.summary}
                />
              ))}
            </div>
            <Separator />
            <p className="text-sm leading-normal text-muted-foreground">
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
          <CardContent className="flex flex-col gap-3">
            {workflowSteps.map((step, index) => (
              <div
                className="flex min-w-0 items-start gap-3 rounded-md border border-border p-3"
                key={step}
              >
                <Badge>{index + 1}</Badge>
                <p className="text-sm leading-normal text-muted-foreground">
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
          <CardContent className="grid gap-4 md:grid-cols-2">
            <SignalList items={allowedSignals} label="Use" />
            <SignalList items={blockedSignals} label="Avoid" />
          </CardContent>
        </Card>
      </Block>
    </Artifact>
  )
}
