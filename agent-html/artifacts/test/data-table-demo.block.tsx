import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontalIcon } from "lucide-react"

import {
  DataTable,
  DataTableColumnHeader,
} from "../../components/data-table"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Checkbox } from "../../components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"

type ReviewItem = {
  budget: number
  due: string
  id: string
  owner: string
  priority: "High" | "Low" | "Medium"
  status: "Blocked" | "Queued" | "Review" | "Shipping"
  workflow: string
}

const reviewItems: ReviewItem[] = [
  {
    budget: 12800,
    due: "Jun 12",
    id: "rvw-1042",
    owner: "Mira Chen",
    priority: "High",
    status: "Review",
    workflow: "Canvas block schema",
  },
  {
    budget: 8600,
    due: "Jun 14",
    id: "rvw-1043",
    owner: "Owen Lee",
    priority: "Medium",
    status: "Shipping",
    workflow: "Prompt context overlay",
  },
  {
    budget: 5200,
    due: "Jun 16",
    id: "rvw-1044",
    owner: "Ari Patel",
    priority: "Low",
    status: "Queued",
    workflow: "Artifact index refresh",
  },
  {
    budget: 14100,
    due: "Jun 18",
    id: "rvw-1045",
    owner: "Nora Smith",
    priority: "High",
    status: "Blocked",
    workflow: "Host inspection state",
  },
  {
    budget: 9800,
    due: "Jun 20",
    id: "rvw-1046",
    owner: "Iris Wang",
    priority: "Medium",
    status: "Review",
    workflow: "Rich component examples",
  },
]

function statusVariant(status: ReviewItem["status"]) {
  if (status === "Blocked") {
    return "destructive"
  }

  if (status === "Queued") {
    return "outline"
  }

  return status === "Shipping" ? "default" : "secondary"
}

const columns: ColumnDef<ReviewItem>[] = [
  {
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
      />
    ),
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(Boolean(value))
        }
      />
    ),
    id: "select",
  },
  {
    accessorKey: "workflow",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Workflow" />
    ),
  },
  {
    accessorKey: "owner",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Owner" />
    ),
  },
  {
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.getValue<ReviewItem["status"]>("status")

      return <Badge variant={statusVariant(status)}>{status}</Badge>
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
  },
  {
    accessorKey: "priority",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("priority")}</Badge>
    ),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
  },
  {
    accessorKey: "budget",
    cell: ({ row }) => {
      const value = row.getValue<number>("budget")
      const formatted = new Intl.NumberFormat("en-US", {
        currency: "USD",
        maximumFractionDigits: 0,
        style: "currency",
      }).format(value)

      return <span>{formatted}</span>
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Budget" />
    ),
  },
  {
    accessorKey: "due",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due" />
    ),
  },
  {
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-label="Open row actions" size="icon-sm" variant="ghost">
            <MoreHorizontalIcon data-icon="icon" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem>Open block prompt</DropdownMenuItem>
            <DropdownMenuItem>Assign reviewer</DropdownMenuItem>
            <DropdownMenuItem>Copy workflow id</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableHiding: false,
    id: "actions",
  },
]

export function DataTableDemoBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <h2 className="canvas-text-heading">Data table</h2>
        <p className="canvas-text-body text-muted-foreground">
          Use this component for sortable, filterable, selectable records where
          row actions stay defined by the artifact column model.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={reviewItems}
        enableRowSelection
        getRowId={(row) => row.id}
        searchColumn="owner"
        searchPlaceholder="Filter owners..."
      />
    </section>
  )
}
