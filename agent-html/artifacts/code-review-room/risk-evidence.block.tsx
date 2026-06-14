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

      <div className="canvas-stack-md">
        <ReviewPanel className="canvas-stack-xs">
          {evidenceMatrix.map((item) => (
            <div
              className="flex flex-col gap-2 rounded-md bg-muted/45 p-3 sm:flex-row sm:items-start sm:justify-between"
              key={`${item.impact}-${item.evidence}`}
            >
              <div className="flex shrink-0 items-center justify-between gap-2 sm:w-48">
                <span className="canvas-text-caption text-muted-foreground">
                  {item.impact}
                </span>
                <StatusBadge status={item.status}>{item.evidence}</StatusBadge>
              </div>
              <p className="canvas-text-caption text-muted-foreground">
                {item.note}
              </p>
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
