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
