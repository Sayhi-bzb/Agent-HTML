import { useMemo, useState } from "react"
import { Artifact, Block, Action } from "@agent-html/react"
import {
  ArrowRightIcon,
  BotIcon,
  BracesIcon,
  ChevronDownIcon,
  ClipboardCheckIcon,
  EyeIcon,
  FileCode2Icon,
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  RouteIcon,
  SparklesIcon,
} from "lucide-react"

import { Alert, AlertDescription } from "../ui/alert"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card"
import { Progress } from "../ui/progress"
import { Separator } from "../ui/separator"
import { Slider } from "../ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Textarea } from "../ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"

type Perspective = "human" | "agent" | "runtime" | "host"

const perspectives: Record<
  Perspective,
  {
    title: string
    summary: string
    primary: string
    secondary: string
    icon: React.ReactNode
  }
> = {
  human: {
    title: "Human view",
    summary: "Start with the claim, then inspect only the parts that need judgment.",
    primary: "Scan the path and switch viewpoints only when confused.",
    secondary: "Use block actions when one section needs a rewrite.",
    icon: <EyeIcon />,
  },
  agent: {
    title: "Agent view",
    summary: "Work through stable blocks instead of rewriting the whole page.",
    primary: "Read workspace rules, then change one target block.",
    secondary: "Use primitives and semantic classes; never style Artifact or Block.",
    icon: <BotIcon />,
  },
  runtime: {
    title: "Runtime view",
    summary: "Keep durable source, validation, and rendering separate from app chrome.",
    primary: "Artifact source stays portable and inspectable.",
    secondary: "Runtime owns the contract, not the shell around the artifact.",
    icon: <BracesIcon />,
  },
  host: {
    title: "Host view",
    summary: "Own the frame around the artifact: sidebars, prompt handoff, and inspection.",
    primary: "Keep navigation and AI chat outside artifact source.",
    secondary: "Render the artifact in a readable surface with stable overlays.",
    icon: <LayoutDashboardIcon />,
  },
}

const pathSteps = [
  {
    id: "request",
    from: "request",
    to: "agent",
    icon: <MessageSquareTextIcon />,
    text: "The human asks for a visual explanation or a focused change.",
    detail:
      "The request should name the outcome, not the layout. The agent chooses the artifact structure from local primitives.",
  },
  {
    id: "artifact",
    from: "agent",
    to: "artifact",
    icon: <FileCode2Icon />,
    text: "The agent edits durable artifact source with stable blocks.",
    detail:
      "Artifact and Block stay protocol-only. Layout, copy, and interaction live inside block content.",
  },
  {
    id: "runtime",
    from: "runtime",
    to: "host",
    icon: <BracesIcon />,
    text: "The runtime keeps the source contract inspectable.",
    detail:
      "The runtime provides rendering semantics and validation boundaries without owning workspace chrome.",
  },
  {
    id: "host",
    from: "host",
    to: "human",
    icon: <RouteIcon />,
    text: "The host renders sidebars, overlays, scroll protection, and prompt handoff.",
    detail:
      "The host is where review, chat, artifact selection, and block targeting become usable workspace behavior.",
  },
]

const concepts = [
  {
    label: "Artifact",
    short: "Durable source surface.",
    medium:
      "A React artifact that the host can render and the agent can revise without depending on chat state.",
    deep: "Artifact owns no ad hoc styling in source. The readable root container is fixed by @agent-html/react and Canvas tokens.",
  },
  {
    label: "Block",
    short: "Stable address.",
    medium:
      "A block gives humans and agents a shared target for review, overlays, and focused rewrites.",
    deep: "Block is protocol-only. It should carry id and title, while visual structure sits inside the block content.",
  },
  {
    label: "Action",
    short: "Prompt handoff.",
    medium:
      "An action turns a visible part of the artifact into a concrete next instruction for the agent.",
    deep: "Good actions point at one target block and preserve the local primitive and token pipeline constraints.",
  },
]

export default function ExampleArtifact() {
  const [perspective, setPerspective] = useState<Perspective>("human")
  const [detail, setDetail] = useState(2)
  const current = perspectives[perspective]
  const detailLabel = useMemo(() => {
    if (detail <= 1) {
      return "skim"
    }

    if (detail === 2) {
      return "explain"
    }

    return "inspect"
  }, [detail])

  return (
    <Artifact title="AgentHTML Workspace Explainer">
      <Block id="brief" title="Brief">
        <article className="canvas-stack-xl">
          <div className="canvas-stack-md">
            <Badge className="w-fit" variant="secondary">
              interactive explainer
            </Badge>
            <h1 className="canvas-text-title">
              AgentHTML is a workspace for steering artifact work.
            </h1>
            <p className="canvas-text-body text-muted-foreground">
              This example borrows the useful HTML artifact tricks: path first,
              details on demand, reader perspective, and a prompt handoff that
              targets one block.
            </p>
          </div>

          <Alert>
            <SparklesIcon />
            <AlertDescription>
              The artifact should make the next judgment obvious. It is not a
              component gallery and not a long report.
            </AlertDescription>
          </Alert>
        </article>
      </Block>

      <Block id="perspective-map" title="Perspective Map">
        <Card>
          <CardHeader>
            <CardTitle>Choose the reader's question</CardTitle>
            <CardDescription>
              The same system becomes clearer when the artifact changes
              viewpoint instead of adding paragraphs.
            </CardDescription>
          </CardHeader>
          <CardContent className="canvas-stack-xl">
            <ToggleGroup
              onValueChange={(value) => {
                if (value) {
                  setPerspective(value as Perspective)
                }
              }}
              type="single"
              value={perspective}
              variant="outline"
            >
              <ToggleGroupItem value="human">Human</ToggleGroupItem>
              <ToggleGroupItem value="agent">Agent</ToggleGroupItem>
              <ToggleGroupItem value="runtime">Runtime</ToggleGroupItem>
              <ToggleGroupItem value="host">Host</ToggleGroupItem>
            </ToggleGroup>

            <div className="canvas-cluster-lg canvas-content-panel">
              <div className="canvas-icon-box-md">{current.icon}</div>
              <div className="canvas-stack-md min-w-0">
                <div className="canvas-stack-xs">
                  <h2 className="canvas-text-heading">{current.title}</h2>
                  <p className="canvas-text-body text-muted-foreground">
                    {current.summary}
                  </p>
                </div>
                <div className="canvas-stack-sm canvas-text-body">
                  <div className="canvas-cluster-sm">
                    <Badge variant="secondary">first</Badge>
                    <span>{current.primary}</span>
                  </div>
                  <div className="canvas-cluster-sm">
                    <Badge variant="outline">then</Badge>
                    <span className="text-muted-foreground">
                      {current.secondary}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Block>

      <Block id="request-path" title="Request Path">
        <Card>
          <CardHeader>
            <CardTitle>Follow one request through the workspace</CardTitle>
            <CardDescription>
              This borrows the feature-explainer pattern: a path first, local
              details only when the reader asks for them.
            </CardDescription>
          </CardHeader>
          <CardContent className="canvas-stack-md">
            {pathSteps.map((step) => (
              <PathStep
                detail={step.detail}
                from={step.from}
                icon={step.icon}
                key={step.id}
                text={step.text}
                to={step.to}
              />
            ))}
          </CardContent>
        </Card>
      </Block>

      <Block id="concept-sandbox" title="Concept Sandbox">
        <Card>
          <CardHeader>
            <CardTitle>Adjust the explanation depth</CardTitle>
            <CardDescription>
              A small control can reduce cognitive load by matching the reader's
              current need.
            </CardDescription>
          </CardHeader>
          <CardContent className="canvas-stack-xl">
            <div className="canvas-stack-sm">
              <div className="canvas-cluster-md canvas-text-body items-center justify-between">
                <span>detail level</span>
                <Badge variant="outline">{detailLabel}</Badge>
              </div>
              <Slider
                max={3}
                min={1}
                onValueChange={(value) => setDetail(value[0] ?? 2)}
                step={1}
                value={[detail]}
              />
            </div>

            <Tabs defaultValue="artifact">
              <TabsList>
                <TabsTrigger value="artifact">Artifact</TabsTrigger>
                <TabsTrigger value="block">Block</TabsTrigger>
                <TabsTrigger value="action">Action</TabsTrigger>
              </TabsList>
              {concepts.map((concept) => (
                <TabsContent
                  key={concept.label}
                  value={concept.label.toLowerCase()}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <Button variant="outline">{concept.label}</Button>
                          </HoverCardTrigger>
                          <HoverCardContent align="start">
                            <p className="canvas-text-body text-muted-foreground">
                              {concept.medium}
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </CardTitle>
                      <CardDescription>{concept.short}</CardDescription>
                    </CardHeader>
                    <CardContent className="canvas-stack-md">
                      <p className="canvas-text-body text-muted-foreground">
                        {detail === 1 ? concept.short : concept.medium}
                      </p>
                      {detail >= 3 ? (
                        <div className="canvas-content-panel">
                          <p className="canvas-text-body text-muted-foreground">
                            {concept.deep}
                          </p>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </Block>

      <Block id="agent-handoff" title="Agent Handoff">
        <Card>
          <CardHeader>
            <CardTitle>Tune the next prompt</CardTitle>
            <CardDescription>
              The prompt tuner pattern turns understanding into a focused
              artifact change.
            </CardDescription>
          </CardHeader>
          <CardContent className="canvas-stack-lg">
            <ProgressNote label="current explainer clarity" value={86} />
            <Textarea placeholder="Ask the agent to rewrite one block, add one example, or clarify one concept." />
            <div className="canvas-wrap-sm">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <ClipboardCheckIcon data-icon="inline-start" />
                    Prepare rewrite
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rewrite the request path</DialogTitle>
                    <DialogDescription>
                      Keep Artifact and Block unstyled. Preserve the path-first
                      structure and make the expanded notes more concrete.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter showCloseButton>
                    <Button asChild>
                      <Action
                        prompt="Rewrite the request-path block so each step is easier to scan and each expanded note is more concrete. Keep Artifact and Block unstyled, use local primitives, and preserve stable block ids."
                        target="request-path"
                      >
                        Send to agent
                      </Action>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button asChild variant="outline">
                <Action
                  prompt="Add one short annotated example to concept-sandbox showing how the detail slider changes the explanation for a new reader versus an implementer."
                  target="concept-sandbox"
                >
                  Add example
                </Action>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="canvas-stack-md items-start">
            <Separator />
            <p className="canvas-text-body text-muted-foreground">
              The artifact preserves enough structure for a human to point at
              the problem and for the agent to change only that part.
            </p>
          </CardFooter>
        </Card>
      </Block>
    </Artifact>
  )
}

function PathStep({
  detail,
  from,
  icon,
  text,
  to,
}: {
  detail: string
  from: string
  icon: React.ReactNode
  text: string
  to: string
}) {
  return (
    <Collapsible>
      <div className="canvas-content-panel">
        <div className="canvas-cluster-md">
          <div className="canvas-icon-box-sm">{icon}</div>
          <div className="canvas-stack-sm min-w-0">
            <div className="canvas-wrap-sm canvas-text-body items-center">
              <Badge variant="secondary">{from}</Badge>
              <ArrowRightIcon data-icon="inline-start" />
              <Badge variant="outline">{to}</Badge>
            </div>
            <p className="canvas-text-body text-muted-foreground">{text}</p>
          </div>
          <CollapsibleTrigger asChild>
            <Button size="icon-sm" variant="ghost">
              <ChevronDownIcon />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="canvas-content-panel">
            <p className="canvas-text-body text-muted-foreground">{detail}</p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

function ProgressNote({ label, value }: { label: string; value: number }) {
  return (
    <div className="canvas-stack-sm">
      <div className="canvas-cluster-md canvas-text-body items-center justify-between">
        <span>{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  )
}
