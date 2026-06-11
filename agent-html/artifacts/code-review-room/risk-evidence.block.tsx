import type { ColumnDef } from "@tanstack/react-table"

import { DataTable, DataTableColumnHeader } from "../../components/data-table"
import { StatusBadge } from "../../components/ui/status-badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs"

const categories = ["payment", "cache", "webhook"]
const evidenceMatrix = [
  {
    evidence: "covered",
    impact: "high impact",
    note: "card replay blocks duplicate intent writes",
    status: "success" as const,
  },
  {
    evidence: "happy path",
    impact: "high impact",
    note: "checkout smoke misses second-click session reuse",
    status: "warning" as const,
  },
  {
    evidence: "missing",
    impact: "high impact",
    note: "duplicate charge regression is not represented",
    status: "destructive" as const,
  },
  {
    evidence: "covered",
    impact: "medium impact",
    note: "cache flush is asserted after successful payment",
    status: "success" as const,
  },
  {
    evidence: "happy path",
    impact: "medium impact",
    note: "button state only covers loading behavior",
    status: "warning" as const,
  },
  {
    evidence: "missing",
    impact: "medium impact",
    note: "stale intent replay lacks a focused test",
    status: "destructive" as const,
  },
  {
    evidence: "covered",
    impact: "low impact",
    note: "owner note exists for support handoff",
    status: "success" as const,
  },
  {
    evidence: "happy path",
    impact: "low impact",
    note: "retry path has a single successful replay",
    status: "warning" as const,
  },
  {
    evidence: "missing",
    impact: "low impact",
    note: "dashboard alert threshold is undecided",
    status: "destructive" as const,
  },
]
type EvidenceRow = {
  evidence: "covered" | "missing" | "partial"
  impact: string
  missingCheck: string
  risk: string
}
const evidenceRows: EvidenceRow[] = [
  {
    evidence: "missing",
    impact: "high",
    missingCheck: "duplicate charge regression",
    risk: "same cart creates two active sessions",
  },
  {
    evidence: "partial",
    impact: "medium",
    missingCheck: "webhook retry with stale cache",
    risk: "subscription state updates after retry",
  },
  {
    evidence: "covered",
    impact: "low",
    missingCheck: "none",
    risk: "checkout button disabled while loading",
  },
]
const evidenceColumns: ColumnDef<EvidenceRow>[] = [
  {
    accessorKey: "risk",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="risk item" />
    ),
  },
  {
    accessorKey: "impact",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="impact" />
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

export function RiskEvidenceBlock() {
  return (
    <section className="canvas-stack-md">
      <div className="canvas-stack-xs">
        <p className="canvas-text-caption text-muted-foreground">
          risk evidence
        </p>
        <h2 className="canvas-text-subheading">
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

        <Tabs defaultValue={categories[0]}>
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <DataTable
                columns={evidenceColumns}
                data={evidenceRows}
                enablePagination={false}
                enableViewOptions={false}
                searchColumn="risk"
                searchPlaceholder={`Filter ${category} risk...`}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
