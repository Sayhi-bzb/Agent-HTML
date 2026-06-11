import type { ColumnDef } from "@tanstack/react-table"

import { DataTable, DataTableColumnHeader } from "../../components/data-table"
import { StatusBadge } from "../../components/ui/status-badge"
import {
  codeMetricChartDomain,
  codeMetricRows,
  moduleStats,
} from "./data/generated-code-metrics"
import type { CodeMetricRow, ModuleStat } from "./data/types"

const chartWidth = 720
const chartHeight = 360
const plot = {
  bottom: 310,
  height: 260,
  left: 56,
  right: 690,
  top: 28,
  width: 634,
}

function logScale(value: number, min: number, max: number) {
  const safeValue = Math.max(value, 1)
  const safeMin = Math.max(min, 1)
  const safeMax = Math.max(max, safeMin + 1)
  const ratio =
    (Math.log(safeValue) - Math.log(safeMin)) /
    (Math.log(safeMax) - Math.log(safeMin))

  return Math.max(0, Math.min(1, ratio))
}

function metricPoint(row: CodeMetricRow) {
  const x =
    plot.left +
    logScale(row.loc, codeMetricChartDomain.locMin, codeMetricChartDomain.locMax) *
      plot.width
  const y =
    plot.bottom -
    logScale(row.cyclomatic, 1, codeMetricChartDomain.cyclomaticMax) *
      plot.height
  const radius = Math.max(5, Math.min(18, 4 + row.fanOut * 0.55))
  const tone =
    row.mi < 40
      ? "fill-destructive"
      : row.mi < 70
        ? "fill-chart-3"
        : "fill-chart-1"

  return { radius, tone, x, y }
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
          <svg
            aria-label="Code metrics scatter chart"
            className="min-h-[360px] w-full text-foreground"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            {[80, 160, 320, 640, 1280].map((tick) => {
              const x =
                plot.left +
                logScale(
                  tick,
                  codeMetricChartDomain.locMin,
                  codeMetricChartDomain.locMax
                ) *
                  plot.width

              return (
                <g key={tick}>
                  <line
                    className="stroke-border"
                    strokeDasharray="2 4"
                    x1={x}
                    x2={x}
                    y1={plot.top}
                    y2={plot.bottom}
                  />
                  <text
                    className="fill-muted-foreground text-[11px]"
                    textAnchor="middle"
                    x={x}
                    y={plot.bottom + 22}
                  >
                    {tick}
                  </text>
                </g>
              )
            })}
            {[10, 40, 100, 200].map((tick) => {
              const y =
                plot.bottom -
                logScale(tick, 1, codeMetricChartDomain.cyclomaticMax) *
                  plot.height

              return (
                <g key={tick}>
                  <line
                    className="stroke-border"
                    strokeDasharray="2 4"
                    x1={plot.left}
                    x2={plot.right}
                    y1={y}
                    y2={y}
                  />
                  <text
                    className="fill-muted-foreground text-[11px]"
                    textAnchor="end"
                    x={plot.left - 10}
                    y={y + 4}
                  >
                    {tick}
                  </text>
                </g>
              )
            })}
            <line
              className="stroke-destructive"
              strokeDasharray="4 4"
              x1={plot.left}
              x2={plot.right}
              y1={
                plot.bottom -
                logScale(10, 1, codeMetricChartDomain.cyclomaticMax) *
                  plot.height
              }
              y2={
                plot.bottom -
                logScale(10, 1, codeMetricChartDomain.cyclomaticMax) *
                  plot.height
              }
            />
            <line
              className="stroke-foreground"
              x1={plot.left}
              x2={plot.right}
              y1={plot.bottom}
              y2={plot.bottom}
            />
            <line
              className="stroke-foreground"
              x1={plot.left}
              x2={plot.left}
              y1={plot.top}
              y2={plot.bottom}
            />
            {codeMetricRows.map((row) => {
              const point = metricPoint(row)

              return (
                <circle
                  className={`${point.tone} stroke-foreground opacity-80`}
                  cx={point.x}
                  cy={point.y}
                  key={row.module}
                  r={point.radius}
                >
                  <title>
                    {`${row.name} @ ${row.module}
MI ${row.mi}  CC ${row.cyclomatic}  Cog ${row.cognitive}  Nest ${row.nesting}
LOC ${row.loc}  H.Vol ${row.vol}  H.Diff ${row.diff}
Fan-in ${row.fanIn}  Fan-out ${row.fanOut}`}
                  </title>
                </circle>
              )
            })}
            <text
              className="fill-muted-foreground text-[12px]"
              textAnchor="middle"
              x={(plot.left + plot.right) / 2}
              y={chartHeight - 10}
            >
              Lines of code
            </text>
            <text
              className="fill-muted-foreground text-[12px]"
              textAnchor="middle"
              transform="rotate(-90 16 170)"
              x="16"
              y="170"
            >
              Cyclomatic complexity
            </text>
          </svg>

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
