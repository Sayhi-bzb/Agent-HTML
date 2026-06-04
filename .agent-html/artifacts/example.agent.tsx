import { useState } from "react"
import { Artifact, Block, Action } from "@agent-html/react"
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts"

import items from "../data/example-items.json"
import usageCsv from "../data/public.usage_dashboard_hourly.csv"
import { useFilter } from "../hooks/use-filter"
import { formatDate } from "../lib/format-date"
import {
  latestUsageRows,
  parseUsageDashboardCsv,
} from "../lib/usage-dashboard"
import { Alert, AlertDescription } from "../ui/alert"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart"
import { Checkbox } from "../ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../ui/popover"
import { ScrollArea } from "../ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Separator } from "../ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Textarea } from "../ui/textarea"

const usageRows = parseUsageDashboardCsv(usageCsv)
const recentUsageRows = [...latestUsageRows(usageRows, 8)].reverse()

type UsageRange = "24h" | "72h" | "7d"

const usageRangeHours: Record<UsageRange, number> = {
  "24h": 24,
  "72h": 72,
  "7d": 168,
}

const usageChartConfig = {
  cost: {
    color: "var(--chart-1)",
    label: "Cost",
  },
  requests: {
    color: "var(--chart-2)",
    label: "Requests",
  },
} satisfies ChartConfig

export default function ExampleArtifact() {
  const [showCost, setShowCost] = useState(true)
  const [usageRange, setUsageRange] = useState<UsageRange>("72h")
  const { filteredItems, query, setQuery } = useFilter(
    items,
    (item) => `${item.name} ${item.signal} ${item.status}`
  )
  const usageChartRows = latestUsageRows(
    usageRows,
    usageRangeHours[usageRange]
  )

  return (
    <Artifact
      className="mx-auto flex w-full max-w-4xl flex-col gap-4 bg-background text-foreground"
      title="React Canvas Example"
    >
      <Block id="summary" title="Summary">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg">React Canvas v1</h2>
            <p className="text-sm text-muted-foreground">
              Stable blocks, local primitives, and token-backed composition.
            </p>
          </div>
          <p>This artifact is normal React wrapped in collaboration boundaries.</p>
          <Alert>
            <AlertDescription>
              Blocks are stable addresses for review, prompts, and targeted
              rewrites.
            </AlertDescription>
          </Alert>
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open workflow</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Artifact workflow</DialogTitle>
                  <DialogDescription>
                    Review stable blocks, choose a rewrite target, and hand the
                    next action back to the agent.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="rewrite-note">Rewrite brief</Label>
                  <Textarea
                    id="rewrite-note"
                    placeholder="Ask for a sharper summary, clearer data framing, or a denser review layout."
                  />
                </div>
                <DialogFooter showCloseButton>
                  <Button asChild>
                    <Action
                      prompt="Improve the summary block with sharper product language."
                      target="summary"
                    >
                      Improve summary
                    </Action>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Pipeline</Button>
              </PopoverTrigger>
              <PopoverContent align="start">
                <PopoverHeader>
                  <PopoverTitle>Design pipeline</PopoverTitle>
                  <PopoverDescription>
                    Artifacts compose local primitives. Colors, radius, and
                    typography resolve through shared CSS tokens.
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </Block>

      <Block id="usage-dashboard" title="Usage Dashboard">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg">Usage Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Local CSV data rendered with chart and table primitives.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-2">
              <Label>Range</Label>
              <Select
                onValueChange={(value) => setUsageRange(value as UsageRange)}
                value={usageRange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Window</SelectLabel>
                    <SelectItem value="24h">Last 24 hours</SelectItem>
                    <SelectItem value="72h">Last 72 hours</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Checkbox
                checked={showCost}
                id="show-cost"
                onCheckedChange={(checked) => setShowCost(checked === true)}
              />
              <Label htmlFor="show-cost">Show cost line</Label>
              <Badge variant={showCost ? "secondary" : "outline"}>
                {showCost ? "Cost line on" : "Cost line off"}
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="chart">
            <TabsList>
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="chart">
              <ChartContainer config={usageChartConfig}>
                <ComposedChart accessibilityLayer data={usageChartRows}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="hour"
                    interval="preserveStartEnd"
                    tickLine={false}
                  />
                  <YAxis dataKey="requests" hide yAxisId="requests" />
                  {showCost ? (
                    <YAxis
                      dataKey="cost"
                      hide
                      orientation="right"
                      yAxisId="cost"
                    />
                  ) : null}
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="requests"
                    fill="var(--color-requests)"
                    radius={4}
                    yAxisId="requests"
                  />
                  {showCost ? (
                    <Line
                      dataKey="cost"
                      dot={false}
                      stroke="var(--color-cost)"
                      strokeWidth={2}
                      type="monotone"
                      yAxisId="cost"
                    />
                  ) : null}
                </ComposedChart>
              </ChartContainer>
            </TabsContent>
            <TabsContent value="table">
              <ScrollArea className="h-72">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hour</TableHead>
                      <TableHead>Requests</TableHead>
                      <TableHead>Tokens</TableHead>
                      <TableHead>Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsageRows.map((row) => (
                      <TableRow key={row.bucketStart}>
                        <TableCell>{row.hour}</TableCell>
                        <TableCell>{row.requests.toLocaleString()}</TableCell>
                        <TableCell>{row.tokens.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge>${row.cost.toFixed(2)}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="notes">
              <Accordion type="single" collapsible defaultValue="scope">
                <AccordionItem value="scope">
                  <AccordionTrigger>What this block owns</AccordionTrigger>
                  <AccordionContent>
                    Usage data presentation, scan-friendly controls, and review
                    actions for the dashboard block.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="agent">
                  <AccordionTrigger>What the agent can rewrite</AccordionTrigger>
                  <AccordionContent>
                    The block can be regenerated without changing the runtime
                    contract or the host layout.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
          </Tabs>
        </div>
      </Block>

      <Block id="signal-list" title="Signal List">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg">Implementation Signals</h2>
            <p className="text-sm text-muted-foreground">
              Filtered local data with stable row and status treatment.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="signal-filter">Filter</Label>
            <Input
              id="signal-filter"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search signals"
              value={query}
            />
          </div>
          <Separator />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Signal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.name}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.signal}</TableCell>
                  <TableCell>
                    <Badge>{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <time>{formatDate(item.date)}</time>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Block>
    </Artifact>
  )
}
