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
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../ui/chart"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Separator } from "../ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"

const usageRows = parseUsageDashboardCsv(usageCsv)
const usageChartRows = latestUsageRows(usageRows, 72)
const recentUsageRows = [...latestUsageRows(usageRows, 8)].reverse()

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
  const { filteredItems, query, setQuery } = useFilter(
    items,
    (item) => `${item.name} ${item.signal} ${item.status}`
  )

  return (
    <Artifact
      className="mx-auto flex w-full max-w-6xl flex-col gap-4 bg-background text-foreground"
      title="React Canvas Example"
    >
      <Block id="summary" title="Summary">
        <Card>
          <CardHeader>
            <CardTitle>React Canvas v1</CardTitle>
            <CardDescription>
              Stable blocks, local primitives, and token-backed composition.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p>
              This artifact is normal React wrapped in collaboration boundaries.
            </p>
            <Alert>
              <AlertDescription>
                Blocks are stable addresses for review, prompts, and targeted
                rewrites.
              </AlertDescription>
            </Alert>
            <Button asChild>
              <Action
                prompt="Improve the summary block with sharper product language."
                target="summary"
              >
                Improve summary
              </Action>
            </Button>
          </CardContent>
        </Card>
      </Block>

      <Block id="usage-dashboard" title="Usage Dashboard">
        <Card>
          <CardHeader>
            <CardTitle>Usage Dashboard</CardTitle>
            <CardDescription>
              Local CSV data rendered with chart and table primitives.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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
                <YAxis
                  dataKey="cost"
                  hide
                  orientation="right"
                  yAxisId="cost"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="requests"
                  fill="var(--color-requests)"
                  radius={4}
                  yAxisId="requests"
                />
                <Line
                  dataKey="cost"
                  dot={false}
                  stroke="var(--color-cost)"
                  strokeWidth={2}
                  type="monotone"
                  yAxisId="cost"
                />
              </ComposedChart>
            </ChartContainer>
            <Separator />
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
          </CardContent>
        </Card>
      </Block>

      <Block id="signal-list" title="Signal List">
        <Card>
          <CardHeader>
            <CardTitle>Implementation Signals</CardTitle>
            <CardDescription>
              Filtered local data with stable row and status treatment.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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
          </CardContent>
        </Card>
      </Block>
    </Artifact>
  )
}
