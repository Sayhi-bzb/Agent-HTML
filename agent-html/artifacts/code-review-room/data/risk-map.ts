import type { RiskFile } from "./types"

export const riskFiles = [
  {
    consequence: "large interactive surface with many branches",
    file: "agent-html/components/map.tsx",
    lines: "1,587 LOC",
    risk: "high",
    size: "h-32 w-52",
    status: "destructive",
    tone: "bg-destructive/35",
    type: "component",
  },
  {
    consequence: "dense drag-and-drop workflow state",
    file: "agent-html/components/kanban.tsx",
    lines: "958 LOC",
    risk: "high",
    size: "h-28 w-48",
    status: "destructive",
    tone: "bg-destructive/30",
    type: "component",
  },
  {
    consequence: "wide chart API and Sankey layout coupling",
    file: "agent-html/components/sankey-chart.tsx",
    lines: "881 LOC",
    risk: "high",
    size: "h-24 w-44",
    status: "destructive",
    tone: "bg-destructive/25",
    type: "component",
  },
  {
    consequence: "sorting, filtering, pagination, and row behavior meet",
    file: "agent-html/components/data-table.tsx",
    lines: "410 LOC",
    risk: "medium",
    size: "h-20 w-40",
    status: "warning",
    tone: "bg-chart-3/30",
    type: "primitive",
  },
  {
    consequence: "route planning state drives several visual regions",
    file: "agent-html/artifacts/tokyo-three-speeds/route-planner.block.tsx",
    lines: "336 LOC",
    risk: "medium",
    size: "h-20 w-44",
    status: "warning",
    tone: "bg-chart-3/25",
    type: "artifact",
  },
  {
    consequence: "syntax rendering and copy interactions are shared",
    file: "agent-html/components/code-block.tsx",
    lines: "188 LOC",
    risk: "medium",
    size: "h-16 w-36",
    status: "warning",
    tone: "bg-chart-3/20",
    type: "component",
  },
] satisfies RiskFile[]

export const fileTypes = ["component", "primitive", "artifact"]

export const selectedDiff = `--- agent-html/components/data-table.tsx
+++ agent-html/components/data-table.tsx
@@ function DataTable<TData, TValue>
 enablePagination = true
 searchColumn
 const table = useReactTable({
   getFilteredRowModel,
   getPaginationRowModel,
   getSortedRowModel
 })`
