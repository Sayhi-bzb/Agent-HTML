import type { RiskFile } from "./types"

export const riskFiles = [
  {
    consequence: "shared Map primitive touches marker, route, popup, and control APIs",
    file: "agent-html/components/map.tsx",
    lines: "1,587 LOC",
    risk: "high",
    size: "h-32 w-52",
    status: "destructive",
    tone: "bg-destructive/35",
    type: "rich component",
  },
  {
    consequence: "rich workflow component wraps dnd-kit state for Canvas artifacts",
    file: "agent-html/components/kanban.tsx",
    lines: "958 LOC",
    risk: "high",
    size: "h-28 w-48",
    status: "destructive",
    tone: "bg-destructive/30",
    type: "rich component",
  },
  {
    consequence: "shared Sankey primitive mixes visx layout, rough overlays, and token styling",
    file: "agent-html/components/chart/sankey-chart.tsx",
    lines: "881 LOC",
    risk: "high",
    size: "h-24 w-44",
    status: "destructive",
    tone: "bg-destructive/25",
    type: "rich component",
  },
  {
    consequence: "local primitive used for artifact inspection tables and evidence review",
    file: "agent-html/components/data-table.tsx",
    lines: "410 LOC",
    risk: "medium",
    size: "h-20 w-40",
    status: "warning",
    tone: "bg-chart-3/30",
    type: "components/ui",
  },
  {
    consequence: "artifact block stresses local data, route controls, and Canvas composition taste",
    file: "agent-html/artifacts/tokyo-three-speeds/route-planner.block.tsx",
    lines: "336 LOC",
    risk: "medium",
    size: "h-20 w-44",
    status: "warning",
    tone: "bg-chart-3/25",
    type: "artifact block",
  },
  {
    consequence: "shared code primitive binds Shiki output, language normalization, and copy UX",
    file: "agent-html/components/code-block.tsx",
    lines: "188 LOC",
    risk: "medium",
    size: "h-16 w-36",
    status: "warning",
    tone: "bg-chart-3/20",
    type: "rich component",
  },
] satisfies RiskFile[]

export const fileTypes = ["rich component", "components/ui", "artifact block"]

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
