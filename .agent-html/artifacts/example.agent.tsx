import { Artifact, Block, Action } from "@agent-html/react"
import {
  ArrowRightIcon,
  BlocksIcon,
  BotIcon,
  ClipboardCheckIcon,
  FileCode2Icon,
  LayoutDashboardIcon,
  PaintbrushIcon,
  SparklesIcon,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Progress } from "../ui/progress"
import { Separator } from "../ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Textarea } from "../ui/textarea"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

const coverageChartConfig = {
  value: {
    color: "var(--chart-1)",
    label: "Readiness",
  },
} satisfies ChartConfig

const coverageRows = [
  { label: "source", value: 92 },
  { label: "runtime", value: 86 },
  { label: "host", value: 78 },
  { label: "tokens", value: 88 },
]

const ownershipRows = [
  {
    icon: <FileCode2Icon />,
    name: "Artifact source",
    text: "The agent writes a durable artifact that can be reopened, reviewed, and changed by block.",
  },
  {
    icon: <PaintbrushIcon />,
    name: "Design pipeline",
    text: "The artifact uses local primitives and semantic tokens instead of inventing color or layout rules.",
  },
  {
    icon: <LayoutDashboardIcon />,
    name: "Host shell",
    text: "The host owns sidebars, scroll protection, floating controls, and inspection chrome.",
  },
]

export default function ExampleArtifact() {
  return (
    <Artifact title="AgentHTML Workspace Brief">
      <Block id="brief" title="Brief">
        <article className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <Badge className="w-fit" variant="secondary">
              HTML artifact practice
            </Badge>
            <h1 className="text-2xl leading-snug">
              AgentHTML turns agent output into a readable workspace.
            </h1>
            <p className="text-base leading-normal text-muted-foreground">
              This example follows the HTML artifact idea without becoming a
              dashboard. It uses a few structured surfaces so a human can read
              the answer, inspect the boundaries, and ask the agent to change a
              specific block.
            </p>
          </div>

          <Alert>
            <SparklesIcon />
            <AlertDescription>
              The goal is not to show every component. The goal is to make the
              agent result easier to understand than a long Markdown reply.
            </AlertDescription>
          </Alert>
        </article>
      </Block>

      <Block id="workspace-map" title="Workspace Map">
        <Tabs defaultValue="story">
          <TabsList>
            <TabsTrigger value="story">Story</TabsTrigger>
            <TabsTrigger value="boundary">Boundary</TabsTrigger>
            <TabsTrigger value="readiness">Readiness</TabsTrigger>
          </TabsList>

          <TabsContent value="story">
            <Card>
              <CardHeader>
                <CardTitle>How the workspace is meant to feel</CardTitle>
                <CardDescription>
                  A small surface for reading, steering, and preserving context.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <p className="text-sm leading-normal text-muted-foreground">
                  The agent should not hand back a wall of text. It should hand
                  back a compact artifact with named regions, visible state, and
                  clear actions. The human can scan the result first, then open
                  the parts that need judgment.
                </p>
                <div className="flex flex-col gap-3">
                  <FlowStep
                    from="request"
                    icon={<BotIcon />}
                    text="Help me explain this project visually."
                    to="agent"
                  />
                  <FlowStep
                    from="agent"
                    icon={<BlocksIcon />}
                    text="Builds a reviewable artifact, not a generic page."
                    to="artifact"
                  />
                  <FlowStep
                    from="host"
                    icon={<LayoutDashboardIcon />}
                    text="Keeps navigation, chat, and inspection outside the artifact."
                    to="workspace"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="boundary">
            <Card>
              <CardHeader>
                <CardTitle>Ownership boundary</CardTitle>
                <CardDescription>
                  One layer should answer one kind of question.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {ownershipRows.map((row) => (
                  <OwnershipRow
                    icon={row.icon}
                    key={row.name}
                    name={row.name}
                    text={row.text}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="readiness">
            <Card>
              <CardHeader>
                <CardTitle>What is already becoming explicit</CardTitle>
                <CardDescription>
                  A single chart is enough here. The detail belongs in docs and
                  code, not in this reading surface.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <ChartContainer config={coverageChartConfig}>
                  <BarChart accessibilityLayer data={coverageRows}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="value"
                      fill="var(--color-value)"
                      radius={4}
                    />
                  </BarChart>
                </ChartContainer>
                <ProgressNote label="token pipeline" value={88} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Block>

      <Block id="decisions" title="Decisions">
        <Card>
          <CardHeader>
            <CardTitle>Decisions to keep visible</CardTitle>
            <CardDescription>
              These are the rules that prevent the artifact from drifting into a
              dense component demo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="content-first">
                <AccordionTrigger>Content first, components second</AccordionTrigger>
                <AccordionContent>
                  Use UI primitives only when they clarify the explanation. A
                  table, chart, or progress bar should earn its place.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="headless-contract">
                <AccordionTrigger>Keep the protocol headless</AccordionTrigger>
                <AccordionContent>
                  Artifact, Block, and Action stay as collaboration markers.
                  Visual structure belongs inside the block through local
                  primitives and semantic token utilities.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="host-shell">
                <AccordionTrigger>Let the host own the workspace chrome</AccordionTrigger>
                <AccordionContent>
                  Sidebars, scroll boundaries, block overlays, and prompt handoff
                  belong to the host. Artifact content should remain portable.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </Block>

      <Block id="agent-handoff" title="Agent Handoff">
        <Card>
          <CardHeader>
            <CardTitle>Ask for a focused rewrite</CardTitle>
            <CardDescription>
              A readable artifact should still be easy to steer by block.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Textarea placeholder="Ask the agent to make one block clearer, shorter, or more concrete." />
            <div className="flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <ClipboardCheckIcon data-icon="inline-start" />
                    Prepare rewrite
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rewrite the workspace map</DialogTitle>
                    <DialogDescription>
                      Keep the reading layout, remove unnecessary density, and
                      make the ownership boundary easier to understand.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter showCloseButton>
                    <Button asChild>
                      <Action
                        prompt="Rewrite the workspace-map block into a clearer, less dense reading layout. Preserve local primitives, semantic token utilities, and stable block ids."
                        target="workspace-map"
                      >
                        Send to agent
                      </Action>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button asChild variant="outline">
                <Action
                  prompt="Shorten the brief block and make the product direction more concrete."
                  target="brief"
                >
                  Tighten brief
                </Action>
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-3">
            <Separator />
            <p className="text-sm leading-normal text-muted-foreground">
              The host owns the prompt handoff. The artifact only exposes clear
              block targets.
            </p>
          </CardFooter>
        </Card>
      </Block>
    </Artifact>
  )
}

function FlowStep({
  from,
  icon,
  text,
  to,
}: {
  from: string
  icon: React.ReactNode
  text: string
  to: string
}) {
  return (
    <div className="flex gap-3 rounded-md border border-border p-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="secondary">{from}</Badge>
          <ArrowRightIcon data-icon="inline-start" />
          <Badge variant="outline">{to}</Badge>
        </div>
        <p className="text-sm leading-normal text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

function OwnershipRow({
  icon,
  name,
  text,
}: {
  icon: React.ReactNode
  name: string
  text: string
}) {
  return (
    <div className="flex gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="text-base leading-snug">{name}</h3>
        <p className="text-sm leading-normal text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}

function ProgressNote({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  )
}
