import * as React from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  Pie,
  PieChart,
  XAxis,
} from "recharts"

import { galleryWorkspacePreviewContent } from "@/gallery/preview-content"
import type { GalleryScene } from "@/gallery/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const performanceData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const performanceChartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

type SourceShareKey = "docs" | "registry" | "preview" | "review"

const sourceShareData = [
  { source: "docs", visitors: 275, fill: "var(--color-docs)" },
  { source: "registry", visitors: 200, fill: "var(--color-registry)" },
  { source: "preview", visitors: 187, fill: "var(--color-preview)" },
  { source: "review", visitors: 173, fill: "var(--color-review)" },
] satisfies Array<{
  fill: string
  source: SourceShareKey
  visitors: number
}>

const sourceShareConfig = {
  visitors: {
    label: "Sessions",
  },
  docs: {
    label: "Docs",
    color: "var(--chart-1)",
  },
  registry: {
    label: "Registry",
    color: "var(--chart-2)",
  },
  preview: {
    label: "Preview",
    color: "var(--chart-3)",
  },
  review: {
    label: "Review",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

const metricCards = [
  {
    change: "+12.5%",
    description: "Real preview modules now replace the old placeholder canvas.",
    title: "Preview fidelity",
    value: "04",
  },
  {
    change: "Official",
    description: "Cards, charts, tables, and scroll areas come from shadcn source.",
    title: "Registry sources",
    value: "06",
  },
  {
    change: "Stable",
    description: "Sidebar, header tabs, and gallery entry flow remain unchanged.",
    title: "Shell impact",
    value: "Low",
  },
  {
    change: "Scene-hosted",
    description: "The work area owns the preview while mode switching stays in the window header.",
    title: "Navigation split",
    value: "1x",
  },
]

const draftRows = [
  {
    assignee: "Sarah Chen",
    revision: "3",
    stage: "Ready",
    task: "Chart composition",
  },
  {
    assignee: "Marc Rodriguez",
    revision: "2",
    stage: "Review",
    task: "Table states",
  },
  {
    assignee: "Emily Watson",
    revision: "1",
    stage: "Draft",
    task: "Inset density",
  },
]

const budgetRows = [
  {
    amount: "$29.99",
    item: "Card spacing",
    quantity: "1",
  },
  {
    amount: "$129.99",
    item: "Chart clarity",
    quantity: "2",
  },
  {
    amount: "$49.99",
    item: "Table polish",
    quantity: "1",
  },
]

type BadgeVariant = "default" | "secondary" | "outline" | "destructive"

function getStageVariant(stage: string): BadgeVariant {
  if (stage === "Ready") {
    return "secondary"
  }

  if (stage === "Review") {
    return "outline"
  }

  if (stage === "Draft") {
    return "default"
  }

  return "destructive"
}

function MetricCard({
  change,
  description,
  title,
  value,
}: {
  change: string
  description: string
  title: string
  value: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">
          {value}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">{change}</Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="items-start">
        <p className="leading-6 text-muted-foreground">{description}</p>
      </CardFooter>
    </Card>
  )
}

function PerformanceChartCard({
  title,
}: {
  title: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Showing preview activity for the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={performanceChartConfig}>
          <AreaChart
            accessibilityLayer
            data={performanceData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickFormatter={(value) => value.slice(0, 3)}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" />}
              cursor={false}
            />
            <Area
              dataKey="desktop"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              type="natural"
            />
            <Area
              dataKey="mobile"
              fill="var(--color-mobile)"
              fillOpacity={0.18}
              stroke="var(--color-mobile)"
              type="natural"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        <p className="font-medium">Official chart primitives now anchor the preview stage.</p>
        <p className="text-muted-foreground">
          The chart section is adapted from shadcn examples and tuned only at the layout layer.
        </p>
      </CardFooter>
    </Card>
  )
}

function SourceShareCard() {
  const totalSessions = React.useMemo(() => {
    return sourceShareData.reduce((acc, entry) => acc + entry.visitors, 0)
  }, [])

  return (
    <Card>
      <CardHeader className="items-center pb-0">
        <CardTitle>Preview source mix</CardTitle>
        <CardDescription>Registry-backed component surface</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          className="mx-auto aspect-square max-h-[250px]"
          config={sourceShareConfig}
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
              cursor={false}
            />
            <Pie
              data={sourceShareData}
              dataKey="visitors"
              innerRadius={56}
              nameKey="source"
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        dominantBaseline="middle"
                        textAnchor="middle"
                        x={viewBox.cx}
                        y={viewBox.cy}
                      >
                        <tspan
                          className="fill-foreground text-3xl font-bold"
                          x={viewBox.cx}
                          y={viewBox.cy}
                        >
                          {totalSessions.toLocaleString()}
                        </tspan>
                        <tspan
                          className="fill-muted-foreground"
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                        >
                          Sessions
                        </tspan>
                      </text>
                    )
                  }

                  return null
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        <div className="flex flex-wrap gap-2">
          {sourceShareData.map((entry) => (
            <Badge key={entry.source} variant="secondary">
              {sourceShareConfig[entry.source].label}
            </Badge>
          ))}
        </div>
        <p className="text-muted-foreground">
          The preview mixes chart and table examples without importing a second shell into Gallery.
        </p>
      </CardFooter>
    </Card>
  )
}

function DraftStatusTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Draft stages</CardTitle>
        <CardDescription>Adapted from the official table example patterns.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead className="text-right">Revision</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {draftRows.map((row) => (
              <TableRow key={row.task}>
                <TableCell className="font-medium">{row.task}</TableCell>
                <TableCell>
                  <Select defaultValue={row.assignee}>
                    <SelectTrigger className="w-40" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Sarah Chen">Sarah Chen</SelectItem>
                        <SelectItem value="Marc Rodriguez">Marc Rodriguez</SelectItem>
                        <SelectItem value="Emily Watson">Emily Watson</SelectItem>
                        <SelectItem value="David Kim">David Kim</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge variant={getStageVariant(row.stage)}>{row.stage}</Badge>
                </TableCell>
                <TableCell className="text-right">{row.revision}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Visible rows</TableCell>
              <TableCell className="text-right">{draftRows.length}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}

function BudgetTableCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Component tuning budget</CardTitle>
        <CardDescription>Input fields stay inside the preview as real shadcn controls.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgetRows.map((row) => (
              <TableRow key={row.item}>
                <TableCell className="font-medium">{row.item}</TableCell>
                <TableCell>
                  <Input
                    className="w-20"
                    defaultValue={row.quantity}
                    min="0"
                    type="number"
                  />
                </TableCell>
                <TableCell>{row.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-muted-foreground">Preview state is isolated from the app.</span>
        <Button size="sm" type="button" variant="outline">
          Review
        </Button>
      </CardFooter>
    </Card>
  )
}

function SceneIntroCard({
  scene,
  tags,
}: {
  scene: GalleryScene
  tags: string[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Gallery work area</CardDescription>
        <CardTitle>{scene.title}</CardTitle>
        <CardAction>
          <Badge>{scene.label}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="leading-6 text-muted-foreground">{scene.summary}</p>
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </CardFooter>
    </Card>
  )
}

function PreviewNotesCard({
  mode,
}: {
  mode: string
}) {
  const summaries =
    mode === "detail"
      ? [
          "Detail mode prioritizes table interaction density.",
          "Inputs and selects stay inline so the preview remains inspectable.",
          "The shell does not move while the work area gets denser.",
        ]
      : mode === "shell"
        ? [
            "Preview chrome stays light so the app shell remains the dominant frame.",
            "Real examples are nested under the shell instead of introducing a second sidebar.",
            "Cards and charts carry the visual weight, not extra framing.",
          ]
        : mode === "workspace"
          ? [
              "The lighter work surface hosts a denser component mix than the shell.",
              "Charts and tables test how internal cards step down from the inset canvas.",
              "Spacing and contrast do more separation work than divider lines.",
            ]
          : [
              "Official examples now anchor the preview instead of prose blocks.",
              "The Gallery work area is becoming a reusable scene renderer.",
              "The sidebar remains stable and detached from preview implementation.",
            ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scene notes</CardTitle>
        <CardDescription>Minimal framing around the official preview content.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {summaries.map((summary) => (
          <div key={summary} className="rounded-lg border bg-muted/40 px-3 py-2.5">
            <p className="leading-6 text-muted-foreground">{summary}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function GalleryWorkspacePreview({
  scene,
}: {
  scene: GalleryScene
}) {
  const preview = galleryWorkspacePreviewContent[scene.id]
  const showTablesFirst = preview.mode === "detail"

  const chartSection = (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
      <PerformanceChartCard title={preview.stageLabel} />
      <SourceShareCard />
    </section>
  )

  const tableSection = (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
      <DraftStatusTable />
      <BudgetTableCard />
    </section>
  )

  return (
    <div className="rounded-[calc(var(--radius)*2.8)] border bg-card/70 p-3">
      <div className="overflow-hidden rounded-[calc(var(--radius)*2.2)] border border-border/80 bg-background">
        <div className="border-b px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">{preview.stageLabel}</p>
            <Badge variant="secondary">Official shadcn preview</Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {preview.stageSummary}
          </p>
        </div>

        <ScrollArea className="h-[54rem]">
          <div className="flex flex-col gap-4 p-4">
            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
              <SceneIntroCard scene={scene} tags={preview.tags} />
              <PreviewNotesCard mode={preview.mode} />
            </section>

            <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {metricCards.map((card) => (
                <MetricCard
                  key={card.title}
                  change={card.change}
                  description={card.description}
                  title={card.title}
                  value={card.value}
                />
              ))}
            </section>

            {showTablesFirst ? tableSection : chartSection}
            {showTablesFirst ? chartSection : tableSection}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
