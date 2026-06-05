import { useState } from "react"
import { useEmitArtifactStateChange } from "@agent-html/react"

import { Badge } from "../../ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card"
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanItem,
  KanbanOverlay,
} from "../../ui/kanban"

import {
  createKanbanMoveChange,
  initialKanbanColumns,
  type KanbanColumns,
} from "./kanban-data"

const kanbanBlockId = "kanban-board"

export function KanbanBoardBlock() {
  const emitKanbanChange = useEmitArtifactStateChange({
    blockId: kanbanBlockId,
  })
  const [kanbanColumns, setKanbanColumns] =
    useState<KanbanColumns>(initialKanbanColumns)

  return (
    <KanbanExample
      columns={kanbanColumns}
      onColumnsChange={(nextColumns) => {
        const change = createKanbanMoveChange({
          afterColumns: nextColumns,
          beforeColumns: kanbanColumns,
          controlId: "sprint-board",
        })

        if (change) {
          emitKanbanChange({
            ...change,
            after: change.after,
            before: change.before,
          })
        }

        emitKanbanChange({
          after: nextColumns,
          before: kanbanColumns,
          component: "kanban",
          controlId: "sprint-board",
          kind: "snapshot",
          semantic: "set-kanban-board-state",
        })
        setKanbanColumns(nextColumns)
      }}
    />
  )
}

function KanbanExample({
  columns,
  onColumnsChange,
}: {
  columns: KanbanColumns
  onColumnsChange: (columns: KanbanColumns) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Semantic Kanban</CardTitle>
        <CardDescription>
          Move a card to emit semantic before/after locations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Kanban
          getItemValue={(item) => item.id}
          onValueChange={onColumnsChange}
          value={columns}
        >
          <KanbanBoard className="min-h-72 items-start overflow-x-auto">
            {Object.entries(columns).map(([columnId, items]) => (
              <KanbanColumn
                className="min-w-56 bg-muted/40"
                key={columnId}
                value={columnId}
              >
                <div className="canvas-stack-sm">
                  <div className="canvas-cluster-md items-center justify-between">
                    <span className="canvas-text-body">{columnId}</span>
                    <Badge variant="secondary">{items.length}</Badge>
                  </div>
                  {items.map((item) => (
                    <KanbanItem
                      asHandle
                      className="canvas-content-panel"
                      key={item.id}
                      value={item.id}
                    >
                      <p className="canvas-text-body">{item.title}</p>
                      <p className="canvas-text-small text-muted-foreground">
                        {item.id}
                      </p>
                    </KanbanItem>
                  ))}
                </div>
              </KanbanColumn>
            ))}
          </KanbanBoard>
          <KanbanOverlay>
            {({ value }) => {
              const item = findKanbanItemById(columns, String(value))

              return item ? (
                <div className="canvas-content-panel">
                  <p className="canvas-text-body">{item.title}</p>
                </div>
              ) : null
            }}
          </KanbanOverlay>
        </Kanban>
      </CardContent>
    </Card>
  )
}

function findKanbanItemById(columns: KanbanColumns, itemId: string) {
  for (const items of Object.values(columns)) {
    const item = items.find((candidate) => candidate.id === itemId)

    if (item) {
      return item
    }
  }

  return null
}
