import type { ColumnDef } from "@tanstack/react-table"

import { ScatterChart } from "../../components/chart/scatter-chart"
import { SunburstChart } from "../../components/chart/sunburst-chart"
import { DataTable, DataTableColumnHeader } from "../../components/data-table"
import type { ChartTooltipField } from "../../components/chart/types"
import { StatusBadge } from "../../components/ui/status-badge"
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
        title="Maintainability is visible before the refactor starts."
      >
        Cell-by-cell code-health metrics for Agent-HTML authored modules: LOC,
        cyclomatic complexity, cognitive complexity, nesting, Halstead volume
        and difficulty, fan-in, fan-out, and maintainability index.
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

      <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.42fr)_minmax(0,0.58fr)]">
        <ReviewPanel className="canvas-stack-sm min-w-0">
          <div className="canvas-stack-xs">
            <p className="canvas-text-caption text-muted-foreground">
              bundle size surface
            </p>
            <p className="canvas-text-body">
              Sunburst groups estimated package weight by runtime, charts,
              artifact examples, and external dependencies.
            </p>
          </div>
          <SunburstChart
            centerLabel="estimated total"
            centerValue={({ total }) => formatKilobytes(total)}
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
        </ReviewPanel>

        <ReviewPanel className="min-w-0">
          <DataTable
            columns={moduleColumns}
            data={moduleStats}
            enablePagination={false}
            enableViewOptions={false}
            searchColumn="module"
            searchPlaceholder="Filter module..."
          />
        </ReviewPanel>
      </div>

      <ReviewStage>
        <DataTable
          columns={metricColumns}
          data={codeMetricRows}
          enablePagination={false}
          enableViewOptions={false}
          searchColumn="name"
          searchPlaceholder="Filter refactor candidate..."
        />
      </ReviewStage>
    </section>
  )
}
