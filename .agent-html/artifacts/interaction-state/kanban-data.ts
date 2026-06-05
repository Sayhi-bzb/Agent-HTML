import type { ArtifactStateChangeInput } from "@agent-html/react"

export type KanbanItemRecord = {
  id: string
  title: string
}

export type KanbanColumns = Record<string, KanbanItemRecord[]>

type KanbanMoveChangeInput = Pick<
  ArtifactStateChangeInput,
  "after" | "before" | "component" | "controlId" | "kind" | "semantic"
>

export const initialKanbanColumns: KanbanColumns = {
  todo: [
    { id: "task-auth", title: "Auth flow" },
    { id: "task-api", title: "API contract" },
  ],
  doing: [{ id: "task-copy", title: "Polish copy" }],
  done: [{ id: "task-shell", title: "Shell layout" }],
}

export function createKanbanMoveChange({
  afterColumns,
  beforeColumns,
  controlId,
}: {
  afterColumns: KanbanColumns
  beforeColumns: KanbanColumns
  controlId: string
}): KanbanMoveChangeInput | null {
  const beforeOrder = Object.keys(beforeColumns)
  const afterOrder = Object.keys(afterColumns)
  const columnMove = findColumnMove({ afterOrder, beforeOrder })

  if (columnMove) {
    return {
      after: columnMove.after,
      before: columnMove.before,
      component: "kanban",
      controlId,
      kind: "move",
      semantic: "move-kanban-column",
    }
  }

  const itemMove = findKanbanItemMove({ afterColumns, beforeColumns })

  if (!itemMove) {
    return null
  }

  return {
    after: itemMove.after,
    before: itemMove.before,
    component: "kanban",
    controlId,
    kind: "move",
    semantic: "move-kanban-item",
  }
}

function findColumnMove({
  afterOrder,
  beforeOrder,
}: {
  afterOrder: string[]
  beforeOrder: string[]
}) {
  if (
    beforeOrder.length !== afterOrder.length ||
    beforeOrder.every((columnId, index) => columnId === afterOrder[index])
  ) {
    return null
  }

  const movedColumnId = beforeOrder.find(
    (columnId, index) => columnId !== afterOrder[index]
  )

  if (!movedColumnId) {
    return null
  }

  return {
    after: {
      columnId: movedColumnId,
      index: afterOrder.indexOf(movedColumnId),
    },
    before: {
      columnId: movedColumnId,
      index: beforeOrder.indexOf(movedColumnId),
    },
  }
}

function findKanbanItemMove({
  afterColumns,
  beforeColumns,
}: {
  afterColumns: KanbanColumns
  beforeColumns: KanbanColumns
}) {
  for (const [beforeColumnId, beforeItems] of Object.entries(beforeColumns)) {
    for (const [beforeIndex, item] of beforeItems.entries()) {
      const afterLocation = findKanbanItemLocation(afterColumns, item.id)

      if (
        afterLocation &&
        (afterLocation.columnId !== beforeColumnId ||
          afterLocation.index !== beforeIndex)
      ) {
        return {
          after: {
            itemId: item.id,
            columnId: afterLocation.columnId,
            index: afterLocation.index,
          },
          before: {
            itemId: item.id,
            columnId: beforeColumnId,
            index: beforeIndex,
          },
        }
      }
    }
  }

  return null
}

function findKanbanItemLocation(columns: KanbanColumns, itemId: string) {
  for (const [columnId, items] of Object.entries(columns)) {
    const index = items.findIndex((item) => item.id === itemId)

    if (index !== -1) {
      return { columnId, index }
    }
  }

  return null
}
