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

import { Badge } from "@/gallery/ui/badge"
import { Button } from "@/gallery/ui/button"
import {
  Card,
  CardContent,
} from "@/gallery/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/gallery/ui/chart"
import { Input } from "@/gallery/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/gallery/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/gallery/ui/table"

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

function PerformanceChartCard() {
  return (
    <Card>
      <CardContent>
        <ChartContainer
          className="aspect-auto h-[200px] w-full"
          config={performanceChartConfig}
        >
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
    </Card>
  )
}

function SourceShareCard() {
  const totalSessions = React.useMemo(() => {
    return sourceShareData.reduce((acc, entry) => acc + entry.visitors, 0)
  }, [])

  return (
    <Card>
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
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          {sourceShareData.map((entry) => (
            <Badge key={entry.source} variant="secondary">
              {sourceShareConfig[entry.source].label}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function DraftStatusTable() {
  return (
    <Card>
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
      <CardContent className="flex justify-end pt-0">
        <Button size="sm" type="button" variant="outline">
          Review
        </Button>
      </CardContent>
    </Card>
  )
}

function GalleryViewport() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <PerformanceChartCard />
        <SourceShareCard />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <DraftStatusTable />
        <BudgetTableCard />
      </section>
    </div>
  )
}

export function GalleryWorkspacePreview({
  radius = "0.625rem",
}: {
  radius?: string
}) {
  return (
    <div
      className="overflow-hidden rounded-[calc(var(--radius)*2.4)] bg-background"
      style={{ "--radius": radius } as React.CSSProperties}
    >
      <GalleryViewport />
    </div>
  )
}
