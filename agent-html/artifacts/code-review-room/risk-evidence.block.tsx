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
import { ReviewPanel, ReviewSectionHeader } from "./review-layout"

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
    <section className="canvas-stack-lg">
      <ReviewSectionHeader
        eyebrow="risk evidence"
        title="Passing tests are not the same as covered risks."
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)]">
        <ReviewPanel className="grid min-h-64 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
        </ReviewPanel>

        <ReviewPanel className="min-w-0">
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
        </ReviewPanel>
      </div>
    </section>
  )
}
