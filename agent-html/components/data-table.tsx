"use client"

import * as React from "react"
import {
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  type Table as ReactTable,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  SlidersHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/cn"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type DataTableProps<TData, TValue> = {
  className?: string
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  emptyLabel?: string
  enablePagination?: boolean
  enableRowSelection?: boolean
  enableViewOptions?: boolean
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string
  onRowClick?: (row: TData) => void
  rowClassName?: string | ((row: Row<TData>, index: number) => string)
  rowSeparator?: (row: Row<TData>, index: number) => React.ReactNode
  searchColumn?: string
  searchPlaceholder?: string
  tableContainerClassName?: string
}

type DataTableColumnHeaderProps<TData, TValue> = {
  className?: string
  column: Column<TData, TValue>
  title: string
}

type DataTablePaginationProps<TData> = {
  className?: string
  table: ReactTable<TData>
}

type DataTableViewOptionsProps<TData> = {
  className?: string
  table: ReactTable<TData>
}

function formatColumnLabel(columnId: string) {
  return columnId
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
}

function isInteractiveElement(target: EventTarget | null) {
  return target instanceof Element
    ? Boolean(
        target.closest(
          "a,button,input,select,textarea,[role='button'],[role='menuitem']"
        )
      )
    : false
}

function DataTableColumnHeader<TData, TValue>({
  className,
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span className={cn("canvas-text-body", className)}>{title}</span>
  }

  const sorted = column.getIsSorted()
  const SortIcon =
    sorted === "asc"
      ? ArrowUpIcon
      : sorted === "desc"
        ? ArrowDownIcon
        : ArrowUpDownIcon

  return (
    <Button
      className={cn("-ml-2", className)}
      onClick={() => column.toggleSorting(sorted === "asc")}
      size="sm"
      variant="ghost"
    >
      {title}
      <SortIcon data-icon="inline-end" />
    </Button>
  )
}

function DataTableViewOptions<TData>({
  className,
  table,
}: DataTableViewOptionsProps<TData>) {
  const hideableColumns = table
    .getAllColumns()
    .filter((column) => column.getCanHide())

  if (hideableColumns.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={className} size="sm" variant="outline">
          <SlidersHorizontalIcon data-icon="inline-start" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
        <DropdownMenuGroup>
          {hideableColumns.map((column) => (
            <DropdownMenuCheckboxItem
              checked={column.getIsVisible()}
              key={column.id}
              onCheckedChange={(value) => column.toggleVisibility(Boolean(value))}
            >
              {formatColumnLabel(column.id)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DataTablePagination<TData>({
  className,
  table,
}: DataTablePaginationProps<TData>) {
  const filteredRowCount = table.getFilteredRowModel().rows.length
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length
  const canSelectRows = table.getRowModel().rows.some((row) =>
    row.getCanSelect()
  )

  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="canvas-text-caption text-muted-foreground">
        {canSelectRows
          ? `${selectedRowCount} of ${filteredRowCount} row(s) selected.`
          : `${filteredRowCount} row(s).`}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="canvas-text-caption text-muted-foreground">
            Rows
          </span>
          <Select
            onValueChange={(value) => table.setPageSize(Number(value))}
            value={`${table.getState().pagination.pageSize}`}
          >
            <SelectTrigger aria-label="Rows per page" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <span className="canvas-text-caption min-w-20 text-center text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {Math.max(table.getPageCount(), 1)}
        </span>

        <div className="flex items-center gap-1">
          <Button
            aria-label="First page"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.setPageIndex(0)}
            size="icon-sm"
            variant="outline"
          >
            <ChevronsLeftIcon data-icon="icon" />
          </Button>
          <Button
            aria-label="Previous page"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            size="icon-sm"
            variant="outline"
          >
            <ChevronLeftIcon data-icon="icon" />
          </Button>
          <Button
            aria-label="Next page"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            size="icon-sm"
            variant="outline"
          >
            <ChevronRightIcon data-icon="icon" />
          </Button>
          <Button
            aria-label="Last page"
            disabled={!table.getCanNextPage()}
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            size="icon-sm"
            variant="outline"
          >
            <ChevronsRightIcon data-icon="icon" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function DataTable<TData, TValue>({
  className,
  columns,
  data,
  emptyLabel = "No results.",
  enablePagination = true,
  enableRowSelection = false,
  enableViewOptions = true,
  getRowId,
  onRowClick,
  rowClassName,
  rowSeparator,
  searchColumn,
  searchPlaceholder,
  tableContainerClassName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    columns,
    data,
    enableRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    getRowId,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      sorting,
    },
  })

  const searchTarget = searchColumn ? table.getColumn(searchColumn) : undefined
  const visibleColumnCount = Math.max(table.getVisibleLeafColumns().length, 1)

  function handleRowClick(
    event: React.MouseEvent<HTMLTableRowElement>,
    row: Row<TData>
  ) {
    if (!onRowClick || isInteractiveElement(event.target)) {
      return
    }

    onRowClick(row.original)
  }

  return (
    <div className={cn("canvas-stack-md", className)}>
      {(searchTarget || enableViewOptions) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {searchTarget ? (
            <Input
              className="sm:max-w-72"
              onChange={(event) => searchTarget.setFilterValue(event.target.value)}
              placeholder={
                searchPlaceholder ??
                `Filter ${formatColumnLabel(searchColumn ?? "")}...`
              }
              value={(searchTarget.getFilterValue() as string) ?? ""}
            />
          ) : (
            <div />
          )}

          {enableViewOptions ? <DataTableViewOptions table={table} /> : null}
        </div>
      )}

      <div
        className={cn("overflow-hidden rounded-md border", tableContainerClassName)}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, index) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    className={cn(
                      onRowClick && "cursor-pointer",
                      typeof rowClassName === "function"
                        ? rowClassName(row, index)
                        : rowClassName
                    )}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    onClick={(event) => handleRowClick(event, row)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {rowSeparator ? (
                    <TableRow
                      aria-hidden="true"
                      className="border-0 hover:bg-transparent"
                    >
                      <TableCell
                        className="h-3 p-0"
                        colSpan={visibleColumnCount}
                      >
                        <div className="px-2">{rowSeparator(row, index)}</div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center text-muted-foreground"
                  colSpan={visibleColumnCount}
                >
                  {emptyLabel}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination ? <DataTablePagination table={table} /> : null}
    </div>
  )
}

export {
  DataTable,
  DataTableColumnHeader,
  DataTablePagination,
  DataTableViewOptions,
  type DataTableColumnHeaderProps,
  type DataTablePaginationProps,
  type DataTableProps,
  type DataTableViewOptionsProps,
}
