import type { KanbanColumnData } from "@/agent-html/runtime/ui/kanban-types"

export function columnDndId(value: string) {
  return `column:${value}`
}

export function itemDndId(value: string) {
  return `item:${value}`
}

export function valueFromDndId(id: string) {
  return id.slice(id.indexOf(":") + 1)
}

export function isColumnDndId(id: string) {
  return id.startsWith("column:")
}

function findColumnIndex(columns: KanbanColumnData[], itemValue: string) {
  return columns.findIndex((column) =>
    column.items.some((item) => item.value === itemValue)
  )
}

export function findItemIndex(column: KanbanColumnData, itemValue: string) {
  return column.items.findIndex((item) => item.value === itemValue)
}

export function findItemPosition(columns: KanbanColumnData[], itemValue: string) {
  const columnIndex = findColumnIndex(columns, itemValue)
  if (columnIndex === -1) {
    return null
  }

  const column = columns[columnIndex]
  const itemIndex = findItemIndex(column, itemValue)
  if (itemIndex === -1) {
    return null
  }

  return {
    columnValue: column.value,
    index: itemIndex,
  }
}

function cloneColumns(columns: KanbanColumnData[]) {
  return columns.map((column) => ({
    ...column,
    items: [...column.items],
  }))
}

export function moveKanbanItem(
  columns: KanbanColumnData[],
  activeId: string,
  overId: string,
  arrayMoveItems: <T>(array: T[], from: number, to: number) => T[]
) {
  if (activeId === overId) {
    return columns
  }

  const activeValue = valueFromDndId(activeId)
  const overValue = valueFromDndId(overId)
  const activeColumnIndex = findColumnIndex(columns, activeValue)
  if (activeColumnIndex === -1) {
    return columns
  }

  const overColumnIndex = isColumnDndId(overId)
    ? columns.findIndex((column) => column.value === overValue)
    : findColumnIndex(columns, overValue)

  if (overColumnIndex === -1) {
    return columns
  }

  const nextColumns = cloneColumns(columns)
  const activeColumn = nextColumns[activeColumnIndex]
  const overColumn = nextColumns[overColumnIndex]
  const activeIndex = findItemIndex(activeColumn, activeValue)
  if (activeIndex === -1) {
    return columns
  }

  if (activeColumnIndex === overColumnIndex) {
    const overIndex = isColumnDndId(overId)
      ? overColumn.items.length - 1
      : findItemIndex(overColumn, overValue)

    if (overIndex === -1 || activeIndex === overIndex) {
      return columns
    }

    activeColumn.items = arrayMoveItems(
      activeColumn.items,
      activeIndex,
      overIndex
    )
    return nextColumns
  }

  const [movedItem] = activeColumn.items.splice(activeIndex, 1)
  const overIndex = isColumnDndId(overId)
    ? overColumn.items.length
    : findItemIndex(overColumn, overValue)
  overColumn.items.splice(
    overIndex === -1 ? overColumn.items.length : overIndex,
    0,
    movedItem
  )
  return nextColumns
}
