export const selectedDiff = `--- agent-html/components/data-table.tsx
+++ agent-html/components/data-table.tsx
@@ function DataTable<TData, TValue>
- enablePagination = true
+ enablePagination = false
 searchColumn
 const table = useReactTable({
   getCoreRowModel,
   getFilteredRowModel,
   getPaginationRowModel,
   getSortedRowModel
 })`

export const diffEvidenceTabs = [
  {
    caption:
      "Selected candidate: the file is not the largest surface, but sorting, filtering, pagination, search, and row behavior converge here.",
    code: selectedDiff,
    language: "diff",
    title: "selected-candidate.diff",
    value: "diff",
  },
  {
    caption:
      "The review trigger is the shared table state path: pagination, search, and row models all meet at one reusable primitive.",
    code: `function DataTable<TData, TValue>({
  columns,
  data,
  enablePagination = true,
  searchColumn,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return <DataTableSurface table={table} searchColumn={searchColumn} />
}`,
    language: "tsx",
    title: "review-trigger.tsx",
    value: "trigger",
  },
  {
    caption:
      "The required gate stays package-level: validation, typecheck, generated index check, and diff integrity must agree.",
    code: `npm run canvas:typecheck
npm run canvas:validate
npm run canvas:index:check
git diff --check`,
    language: "bash",
    title: "required-gates.sh",
    value: "gates",
  },
] as const
