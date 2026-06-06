import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  AspectRatio,
  Badge,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  Progress,
  Separator,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type ChartConfig,
} from "@example/ui"
import {
  Blocks,
  Bot,
  CodeXml,
  Component,
  ListChecks,
  Monitor,
  Route,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

const chartData = [
  { stage: "Hero", ahtml: 24, react: 58 },
  { stage: "Cards", ahtml: 38, react: 96 },
  { stage: "Flow", ahtml: 51, react: 138 },
  { stage: "Showcase", ahtml: 69, react: 188 },
] as const

const chartConfig = {
  ahtml: {
    color: "var(--chart-2)",
    label: "AHTML",
  },
  react: {
    color: "var(--chart-1)",
    label: "React",
  },
} satisfies ChartConfig

export function ComplexDashboardExample() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="secondary">DSL preview</Badge>
        <Badge variant="outline">Shadcn runtime</Badge>
        <Badge variant="outline">AST validated</Badge>
        <Badge variant="destructive">Experimental</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Agent-authored interface</CardTitle>
            <CardDescription>
              Describe UI with a small HTML-like DSL, then render through the
              agent-html runtime.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="author">
              <TabsList>
                <TabsTrigger value="author">Author</TabsTrigger>
                <TabsTrigger value="validate">Validate</TabsTrigger>
                <TabsTrigger value="render">Render</TabsTrigger>
              </TabsList>

              <TabsContent value="author">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary">XML-shaped</Badge>
                    <Badge variant="outline">Low classname load</Badge>
                  </div>
                  <Progress value={88} />
                  <Alert>
                    <Sparkles />
                    <AlertTitle>Designed for LLM generation</AlertTitle>
                    <AlertDescription>
                      Tags, slots, and narrow variants keep the prompt close to
                      patterns the model already knows.
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>

              <TabsContent value="validate">
                <div className="flex flex-col gap-2">
                  <Badge variant="outline">Schema checked before render</Badge>
                  <Progress value={76} />
                  <Alert>
                    <ShieldCheck />
                    <AlertTitle>AST first</AlertTitle>
                    <AlertDescription>
                      The parser turns source into a constrained tree so
                      invalid tags and missing props fail early.
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>

              <TabsContent value="render">
                <div className="flex flex-col gap-2">
                  <Badge variant="secondary">Runtime maps to shadcn</Badge>
                  <Progress value={92} />
                  <Alert>
                    <Component />
                    <AlertTitle>No handcrafted widgets</AlertTitle>
                    <AlertDescription>
                      agent-html composes the existing shadcn runtime primitives
                      instead of inventing a parallel UI kit.
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Prompt-friendly</Badge>
              <Badge variant="outline">Renderable</Badge>
              <Badge variant="outline">Inspectable</Badge>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Design principles</CardTitle>
            <CardDescription>
              Why agent-html stays small and deliberately constrained.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single">
              <AccordionItem value="html-shape">
                <AccordionTrigger>Why HTML-shaped?</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2">
                    <Alert>
                      <CodeXml />
                      <AlertTitle>Lower model friction</AlertTitle>
                      <AlertDescription>
                        LLMs already understand nested markup, attributes,
                        closing tags, and slot-like composition.
                      </AlertDescription>
                    </Alert>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">Familiar syntax</Badge>
                      <Badge variant="outline">Less prompt text</Badge>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="limited-props">
                <AccordionTrigger>Why narrow props?</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2">
                    <Alert>
                      <ListChecks />
                      <AlertTitle>
                        Reliable generation beats full flexibility
                      </AlertTitle>
                      <AlertDescription>
                        Small variant sets make generated UI easier to
                        validate, render, and compare across examples.
                      </AlertDescription>
                    </Alert>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">Variants</Badge>
                      <Badge variant="outline">Slots</Badge>
                      <Badge variant="outline">Layout tags</Badge>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="runtime">
                <AccordionTrigger>Why shadcn runtime?</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2">
                    <Alert>
                      <Blocks />
                      <AlertTitle>Use production primitives</AlertTitle>
                      <AlertDescription>
                        The DSL is an authoring layer. The rendered result still
                        uses real UI components.
                      </AlertDescription>
                    </Alert>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">Native primitives</Badge>
                      <Badge variant="outline">Theme tokens</Badge>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Source comparison</CardTitle>
            <CardDescription>
              AHTML keeps the page structure explicit without writing every
              React wrapper.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>
                Same interface, different authoring surfaces
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Format</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Tradeoff</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>AHTML</TableCell>
                  <TableCell>Compact structure</TableCell>
                  <TableCell>Requires runtime</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>HTML</TableCell>
                  <TableCell>Universal output</TableCell>
                  <TableCell>Loses component intent</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>React</TableCell>
                  <TableCell>Full control</TableCell>
                  <TableCell>Highest token cost</TableCell>
                </TableRow>
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Goal</TableCell>
                  <TableCell>LLM accuracy</TableCell>
                  <TableCell>Small API surface</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deployment surfaces</CardTitle>
            <CardDescription>
              The same DSL experiment can preview web, app, and generated UI
              states.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Carousel>
              <CarouselContent>
                <CarouselItem>
                  <AspectRatio ratio={16 / 9}>
                    <Card size="sm">
                      <CardContent>
                        <div className="flex flex-col gap-2">
                          <Badge variant="secondary">Web preview</Badge>
                          <Alert>
                            <Monitor />
                            <AlertTitle>Independent route</AlertTitle>
                            <AlertDescription>
                              Render agent-html without coupling the example
                              system to gallery internals.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </CardContent>
                    </Card>
                  </AspectRatio>
                </CarouselItem>

                <CarouselItem>
                  <AspectRatio ratio={1}>
                    <Card size="sm">
                      <CardContent>
                        <div className="flex flex-col gap-2">
                          <Badge variant="outline">App surface</Badge>
                          <Alert>
                            <Smartphone />
                            <AlertTitle>Portable runtime contract</AlertTitle>
                            <AlertDescription>
                              The AST and component map can be packaged
                              separately from the demo shell.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </CardContent>
                    </Card>
                  </AspectRatio>
                </CarouselItem>

                <CarouselItem>
                  <AspectRatio ratio={4 / 3}>
                    <Card size="sm">
                      <CardContent>
                        <div className="flex flex-col gap-2">
                          <Badge variant="secondary">Agent output</Badge>
                          <Alert>
                            <Bot />
                            <AlertTitle>Structured generation</AlertTitle>
                            <AlertDescription>
                              Agents emit declarative UI that can be validated
                              before it reaches users.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </CardContent>
                    </Card>
                  </AspectRatio>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What this proves</CardTitle>
            <CardDescription>
              The showcase is a runtime contract, not just a visual sample.
            </CardDescription>
            <CardAction>
              <Badge variant="outline">Boundary</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Alert>
                <Route />
                <AlertTitle>Example consumes the package</AlertTitle>
                <AlertDescription>
                  The demo stays outside agent-html internals and uses only the
                  public runtime entrypoints.
                </AlertDescription>
              </Alert>
              <Separator />
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Parser</Badge>
                <Badge variant="outline">Validator</Badge>
                <Badge variant="outline">Renderer</Badge>
                <Badge variant="outline">Source diff</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complexity trend</CardTitle>
          <CardDescription>
            As UI structure grows, the DSL keeps authoring cost closer to
            component intent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-60 w-full" config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 0, right: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis axisLine={false} dataKey="stage" tickLine={false} />
              <ChartTooltip
                content={
                  <ChartTooltipContent indicator="line" hideLabel={false} />
                }
              />
              <Area
                dataKey="react"
                fill="var(--color-react)"
                fillOpacity={0.2}
                stroke="var(--color-react)"
                strokeWidth={2}
                type="monotone"
              />
              <Area
                dataKey="ahtml"
                fill="var(--color-ahtml)"
                fillOpacity={0.2}
                stroke="var(--color-ahtml)"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
