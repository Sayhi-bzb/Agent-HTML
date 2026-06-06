import type { ColumnDef } from "@tanstack/react-table"
import { ArrowRightIcon } from "lucide-react"

import {
  DataTable,
  DataTableColumnHeader,
} from "../../components/data-table"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import type { UsageDashboardRow } from "../../lib/usage-dashboard"

import { formatCurrency, formatDuration, formatNumber } from "./data"

type DashboardRecord = UsageDashboardRow & {
  selected: boolean
}

type RecordsBlockProps = {
  rows: UsageDashboardRow[]
  selectedRow: UsageDashboardRow | null
  setSelectedRowKey: (key: string) => void
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

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">records</Badge>
          <Badge variant="outline">data table</Badge>
        </div>
        <h2 className="canvas-text-heading">Usage records</h2>
        <p className="canvas-text-body text-muted-foreground">
          Sort, filter, paginate, hide columns, or click a row to inspect the
          underlying usage record.
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
