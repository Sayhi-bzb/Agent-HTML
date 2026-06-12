import type { ColumnDef } from "@tanstack/react-table"

import { ScatterChart } from "../../components/chart"
import { DataTable, DataTableColumnHeader } from "../../components/data-table"
import type { ChartConfig, ChartTooltipField } from "../../components/ui/chart"
import { StatusBadge } from "../../components/ui/status-badge"
import {
  codeMetricChartDomain,
  codeMetricRows,
  moduleStats,
} from "./data/generated-code-metrics"
import type { CodeMetricRow, ModuleStat } from "./data/types"

const codeMetricScatterConfig = {
  metrics: {
    color: "var(--chart-1)",
    label: "Code metrics",
  },
} satisfies ChartConfig

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

function getMetricColor(row: CodeMetricRow) {
  if (row.mi < 40) {
    return "var(--destructive)"
  }

  if (row.mi < 70) {
    return "var(--chart-3)"
  }

  return "var(--chart-1)"
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

export function CodeMetricsBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-xs">
        <p className="canvas-text-caption text-muted-foreground">
          code metrics
        </p>
        <h2 className="canvas-text-heading">
          Maintainability is visible before the refactor starts.
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          Cell-by-cell code-health metrics for Agent-HTML authored modules:
          LOC, cyclomatic complexity, cognitive complexity, nesting, Halstead
          volume and difficulty, fan-in, fan-out, and maintainability index.
        </p>
      </div>

      <div className="grid gap-5 rounded-md bg-background p-4 xl:grid-cols-[minmax(0,0.64fr)_minmax(320px,0.36fr)]">
        <div className="canvas-stack-sm min-w-0">
          <ScatterChart
            aspectRatio="2 / 1"
            config={codeMetricScatterConfig}
            data={codeMetricRows}
            getPointColor={getMetricColor}
            minHeight={360}
            radiusKey="fanOut"
            referenceY={10}
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
        </div>

        <DataTable
          columns={moduleColumns}
          data={moduleStats}
          enablePagination={false}
          enableViewOptions={false}
          searchColumn="module"
          searchPlaceholder="Filter module..."
        />
      </div>

      <DataTable
        columns={metricColumns}
        data={codeMetricRows}
        enablePagination={false}
        enableViewOptions={false}
        searchColumn="name"
        searchPlaceholder="Filter refactor candidate..."
      />
    </section>
  )
}
