import type { ColumnDef } from "@tanstack/react-table"

import { DataTable, DataTableColumnHeader } from "../../components/data-table"
import { StatusBadge } from "../../components/ui/status-badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs"
import {
  evidenceCategories,
  evidenceMatrix,
  evidenceRows,
} from "./data/review-decision"
import type { EvidenceRow } from "./data/types"

const evidenceColumns: ColumnDef<EvidenceRow>[] = [
  {
    accessorKey: "risk",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="risk item" />
    ),
  },
  {
    accessorKey: "evidence",
    cell: ({ row }) => {
      const status =
        row.original.evidence === "covered"
          ? "success"
          : row.original.evidence === "partial"
            ? "warning"
            : "destructive"

      return <StatusBadge status={status}>{row.original.evidence}</StatusBadge>
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="evidence" />
    ),
  },
  {
    accessorKey: "missingCheck",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="missing check" />
    ),
  },
]

export default function RiskEvidenceBlock() {
  return (
    <section className="canvas-stack-md">
      <div className="canvas-stack-xs">
        <p className="canvas-text-caption text-muted-foreground">
          risk evidence
        </p>
        <h2 className="canvas-text-heading">
          Passing tests are not the same as covered risks.
        </h2>
      </div>

      <div className="grid gap-5 rounded-md bg-background p-4 lg:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)]">
        <div className="grid min-h-64 grid-cols-3 gap-3">
          {evidenceMatrix.map((item) => (
            <div
              className="canvas-stack-xs rounded-md bg-muted/45 p-3"
              key={`${item.impact}-${item.evidence}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="canvas-text-caption text-muted-foreground">
                  {item.impact}
                </span>
                <StatusBadge status={item.status}>{item.evidence}</StatusBadge>
              </div>
              <p className="canvas-text-caption">{item.note}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue={evidenceCategories[0]}>
          <TabsList>
            {evidenceCategories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="dependency">
            <DataTable
              columns={evidenceColumns}
              data={evidenceRows}
              enablePagination={false}
              enableViewOptions={false}
              searchColumn="risk"
              searchPlaceholder="Filter dependency evidence..."
            />
          </TabsContent>
          <TabsContent value="runtime">
            <DataTable
              columns={evidenceColumns}
              data={evidenceRows}
              enablePagination={false}
              enableViewOptions={false}
              searchColumn="risk"
              searchPlaceholder="Filter runtime evidence..."
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
