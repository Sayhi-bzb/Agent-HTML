import type { ColumnDef } from "@tanstack/react-table"

import { ScatterChart } from "../../components/chart/scatter-chart"
import { SunburstChart } from "../../components/chart/sunburst-chart"
import { DataTable, DataTableColumnHeader } from "../../components/data-table"
import type { ChartTooltipField } from "../../components/chart/types"
import { StatusBadge } from "../../components/ui/status-badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs"
import { bundleSizeTree } from "./data/bundle-size-tree"
import {
  codeMetricChartDomain,
  codeMetricRows,
  moduleStats,
} from "./data/generated-code-metrics"
import type { CodeMetricRow, ModuleStat } from "./data/types"
import {
  ReviewPanel,
  ReviewSectionHeader,
  ReviewStage,
} from "./review-layout"

const codeMetricTooltipFields = [
  { key: "mi", label: "MI", value: "mi" },
  { key: "cyclomatic", label: "CC", value: "cyclomatic" },
  { key: "cognitive", label: "Cog", value: "cognitive" },
  { key: "nesting", label: "Nest", value: "nesting" },
  { key: "loc", label: "LOC", value: "loc" },
  { key: "vol", label: "H.Vol", value: "vol" },
  { key: "diff", label: "H.Diff", value: "diff" },
  { key: "fan-in", label: "Fan-in", value: "fanIn" },
  { key: "fan-out", label: "Fan-out", value: "fanOut" },
] satisfies ChartTooltipField<CodeMetricRow>[]

function formatKilobytes(value: number) {
  return `${value} KB`
}

const moduleColumns: ColumnDef<ModuleStat>[] = [
  {
    accessorKey: "module",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Module" />
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
  },
  {
    accessorKey: "cells",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cells" />
    ),
  },
  {
    accessorKey: "dependsOn",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deps" />
    ),
  },
]

const metricColumns: ColumnDef<CodeMetricRow>[] = [
  {
    accessorKey: "mi",
    cell: ({ row }) => {
      const status = row.original.mi < 40 ? "destructive" : "warning"

      return <StatusBadge status={status}>{row.original.mi}</StatusBadge>
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="MI" />
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "module",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Module" />
    ),
  },
  {
    accessorKey: "loc",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="LOC" />
    ),
  },
  {
    accessorKey: "cyclomatic",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CC" />
    ),
  },
  {
    accessorKey: "cognitive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cog" />
    ),
  },
  {
    accessorKey: "nesting",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nest" />
    ),
  },
  {
    accessorKey: "vol",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="H.Vol" />
    ),
  },
  {
    accessorKey: "diff",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="H.Diff" />
    ),
  },
  {
    accessorKey: "fanIn",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="In" />
    ),
  },
  {
    accessorKey: "fanOut",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Out" />
    ),
  },
]

export default function CodeMetricsBlock() {
  return (
    <section className="canvas-stack-lg">
      <ReviewSectionHeader
        eyebrow="code metrics"
        title="Metrics separate the review trigger from the noisy surface area."
      >
        The scatter plot is the primary risk signal: size, complexity, and
        package fan-out converge before a reviewer opens every file.
      </ReviewSectionHeader>

      <ReviewStage className="canvas-stack-sm">
        <ScatterChart
          aspectRatio="2 / 1"
          data={codeMetricRows}
          minHeight={360}
          radiusKey="fanOut"
          referenceY={10}
          renderer="texture"
          texture={{
            density: "normal",
            kind: "lines",
            opacity: 1,
          }}
          tooltipFields={codeMetricTooltipFields}
          tooltipLabel={(row) => `${row.name} @ ${row.module}`}
          xAxisLabel="Lines of code"
          xDomain={[codeMetricChartDomain.locMin, codeMetricChartDomain.locMax]}
          xKey="loc"
          xScaleType="log"
          xTicks={[80, 160, 320, 640, 1280]}
          yAxisLabel="Cyclomatic complexity"
          yDomain={[1, codeMetricChartDomain.cyclomaticMax]}
          yKey="cyclomatic"
          yScaleType="log"
          yTicks={[10, 40, 100, 200]}
        />

        <div className="flex flex-wrap gap-2">
          <StatusBadge status="destructive">low MI</StatusBadge>
          <StatusBadge status="warning">complexity pressure</StatusBadge>
          <StatusBadge status="success">smaller candidate</StatusBadge>
        </div>
      </ReviewStage>

      <ReviewPanel className="min-w-0">
        <Tabs className="canvas-stack-sm" defaultValue="bundle">
          <TabsList className="flex-wrap">
            <TabsTrigger value="bundle">bundle surface</TabsTrigger>
            <TabsTrigger value="modules">module inventory</TabsTrigger>
            <TabsTrigger value="metrics">metric table</TabsTrigger>
          </TabsList>

          <TabsContent className="canvas-stack-sm" value="bundle">
            <div className="canvas-stack-xs">
              <p className="canvas-text-caption text-muted-foreground">
                secondary signal: bundle surface
              </p>
              <p className="canvas-text-body">
                Sunburst keeps package weight visible without competing with
                the complexity scatter plot.
              </p>
            </div>
            <SunburstChart
              aspectRatio="4 / 3"
              centerLabel="estimated total"
              centerValue={({ total }) => formatKilobytes(total)}
              className="mx-auto max-w-xl"
              data={bundleSizeTree}
              legend
              minHeight={320}
              renderer="texture"
              sort="none"
              texture={{
                density: "dense",
                kind: "lines",
                opacity: 0.7,
              }}
              valueFormatter={formatKilobytes}
            />
          </TabsContent>

          <TabsContent className="canvas-stack-sm" value="modules">
            <div className="canvas-stack-xs">
              <p className="canvas-text-caption text-muted-foreground">
                secondary signal: module inventory
              </p>
              <p className="canvas-text-body">
                Module rows explain which authored surfaces feed the risk
                signal.
              </p>
            </div>
            <DataTable
              columns={moduleColumns}
              data={moduleStats}
              enablePagination={false}
              enableViewOptions={false}
              searchColumn="module"
              searchPlaceholder="Filter module..."
            />
          </TabsContent>

          <TabsContent className="canvas-stack-sm" value="metrics">
            <div className="canvas-stack-xs">
              <p className="canvas-text-caption text-muted-foreground">
                detail evidence
              </p>
              <p className="canvas-text-body">
                The full metric table is a drill-down, not the headline.
              </p>
            </div>
            <DataTable
              columns={metricColumns}
              data={codeMetricRows}
              enableViewOptions={false}
              searchColumn="name"
              searchPlaceholder="Filter refactor candidate..."
            />
          </TabsContent>
        </Tabs>
      </ReviewPanel>
    </section>
  )
}
