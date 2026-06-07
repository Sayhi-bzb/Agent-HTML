import type { ColumnDef } from "@tanstack/react-table"
import { ArrowRightIcon } from "lucide-react"

import {
  DataTable,
  DataTableColumnHeader,
} from "../../components/data-table"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"

import {
  formatCurrency,
  formatDuration,
  formatNumber,
  getSeverityLabel,
  type DashboardSeverity,
  type DashboardSignalRow,
} from "./data"

type DashboardRecord = DashboardSignalRow & {
  selected: boolean
}

type RecordsBlockProps = {
  rows: DashboardSignalRow[]
  selectedRow: DashboardSignalRow | null
  setSelectedRowKey: (key: string) => void
}

function severityVariant(severity: DashboardSeverity) {
  return severity === "critical"
    ? "destructive"
    : severity === "watch"
      ? "secondary"
      : "outline"
}

function buildColumns(
  setSelectedRowKey: (key: string) => void
): ColumnDef<DashboardRecord>[] {
  return [
    {
      accessorKey: "hour",
      cell: ({ row }) => (
        <span className="canvas-wrap-sm items-center">
          {row.original.hour}
          {row.original.selected ? <Badge variant="secondary">selected</Badge> : null}
        </span>
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Hour" />
      ),
    },
    {
      accessorKey: "severity",
      cell: ({ row }) => (
        <Badge variant={severityVariant(row.original.severity)}>
          {getSeverityLabel(row.original.severity)}
        </Badge>
      ),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="State" />
      ),
    },
    {
      accessorKey: "metricScore",
      cell: ({ row }) => `${row.original.metricScore}%`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Pressure" />
      ),
    },
    {
      accessorKey: "requests",
      cell: ({ row }) => formatNumber(row.original.requests),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Requests" />
      ),
    },
    {
      accessorKey: "tokens",
      cell: ({ row }) => formatNumber(row.original.tokens),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tokens" />
      ),
    },
    {
      accessorKey: "durationSeconds",
      cell: ({ row }) => formatDuration(row.original.durationSeconds),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Duration" />
      ),
    },
    {
      accessorKey: "cost",
      cell: ({ row }) => formatCurrency(row.original.cost),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cost" />
      ),
    },
    {
      accessorKey: "users",
      cell: ({ row }) => formatNumber(row.original.users),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Users" />
      ),
    },
    {
      accessorKey: "anomalyReasons",
      cell: ({ row }) =>
        row.original.anomalyReasons.length > 0
          ? row.original.anomalyReasons.join("; ")
          : "None",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Exception" />
      ),
    },
    {
      cell: ({ row }) => (
        <Button
          aria-label={`Inspect ${row.original.hour}`}
          onClick={() => setSelectedRowKey(row.original.bucketStart)}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <ArrowRightIcon data-icon="icon" />
        </Button>
      ),
      enableHiding: false,
      enableSorting: false,
      id: "inspect",
    },
  ]
}

export function RecordsBlock({
  rows,
  selectedRow,
  setSelectedRowKey,
}: RecordsBlockProps) {
  const records = rows.map((row) => ({
    ...row,
    selected: selectedRow?.bucketStart === row.bucketStart,
  }))
  const columns = buildColumns(setSelectedRowKey)
  const exceptionCount = rows.filter((row) => row.anomalyReasons.length > 0).length

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="outline">{rows.length} rows</Badge>
          <Badge variant={exceptionCount > 0 ? "secondary" : "outline"}>
            {exceptionCount} exceptions
          </Badge>
        </div>
        <h2 className="canvas-text-heading">Operating records</h2>
        <p className="canvas-text-body text-muted-foreground">
          The record queue carries the same metric pressure and exception model
          used by the trend and selected-hour inspector.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={records}
        emptyLabel="No usage records in this window."
        getRowId={(row) => row.bucketStart}
        onRowClick={(row) => setSelectedRowKey(row.bucketStart)}
        searchColumn="hour"
        searchPlaceholder="Filter hours..."
      />
    </section>
  )
}
