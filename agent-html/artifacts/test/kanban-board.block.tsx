import { useState } from "react"
import { useEmitArtifactStateChange } from "@agent-html/react"

import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanItem,
  KanbanOverlay,
} from "../../components/kanban"
import { Badge } from "../../components/ui/badge"

const blockId = "kanban-board"
const controlId = "sprint-board"

const kanbanColumnIds = ["backlog", "active", "review"] as const

type KanbanColumnId = (typeof kanbanColumnIds)[number]

type KanbanTask = {
  id: string
  signal: string
  summary: string
  title: string
}

type KanbanBoardState = Record<string, KanbanTask[]>

type KanbanTaskPosition = {
  columnId: KanbanColumnId
  index: number
  itemId: string
}

const columnLabels: Record<KanbanColumnId, string> = {
  active: "Active",
  backlog: "Backlog",
  review: "Review",
}

const initialBoard: KanbanBoardState = {
  backlog: [
    {
      id: "task-instrument-tabs",
      signal: "controls",
      summary: "Keep tab selection visible in prompt context.",
      title: "Instrument tab state",
    },
    {
      id: "task-polish-empty",
      signal: "surface",
      summary: "Tighten the empty prompt display treatment.",
      title: "Polish empty state",
    },
  ],
  active: [
    {
      id: "task-kanban-demo",
      signal: "workflow",
      summary: "Show rich local workflow state in Canvas.",
      title: "Add Kanban interaction",
    },
  ],
  review: [
    {
      id: "task-guard-check",
      signal: "guard",
      summary: "Confirm artifact source stays inside Canvas rules.",
      title: "Run guard checks",
    },
  ],
}

function findTaskPosition(
  board: KanbanBoardState,
  itemId: string
): KanbanTaskPosition | null {
  for (const columnId of Object.keys(board)) {
    const index = (board[columnId] ?? []).findIndex(
      (item) => item.id === itemId
    )

    if (index !== -1) {
      return {
        columnId: columnId as KanbanColumnId,
        index,
        itemId,
      }
    }
  }

  return null
}

function findMovedTask(
  before: KanbanBoardState,
  after: KanbanBoardState
): { after: KanbanTaskPosition; before: KanbanTaskPosition } | null {
  const taskIds = Object.values(before).flatMap((items) =>
    items.map((item) => item.id)
  )

  for (const taskId of taskIds) {
    const from = findTaskPosition(before, taskId)
    const to = findTaskPosition(after, taskId)

    if (
      from &&
      to &&
      (from.columnId !== to.columnId || from.index !== to.index)
    ) {
      return {
        after: to,
        before: from,
      }
    }
  }

  return null
}

function TaskCard({ task }: { task: KanbanTask }) {
  return (
    <div className="canvas-stack-sm rounded-md border bg-background p-3 text-foreground">
      <div className="canvas-wrap-sm items-center">
        <Badge variant="secondary">{task.signal}</Badge>
        <span className="canvas-text-body">{task.title}</span>
      </div>
      <p className="canvas-text-body text-muted-foreground">{task.summary}</p>
    </div>
  )
}

export function KanbanBoardBlock() {
  const emitChange = useEmitArtifactStateChange({ blockId })
  const [board, setBoard] = useState<KanbanBoardState>(initialBoard)

  function recordBoardChange(nextBoard: KanbanBoardState) {
    const move = findMovedTask(board, nextBoard)

    if (move) {
      emitChange({
        after: move.after,
        before: move.before,
        component: "kanban",
        controlId,
        kind: "move",
        semantic: "move-kanban-item",
      })
    }

    emitChange({
      after: nextBoard,
      before: board,
      component: "kanban",
      controlId,
      kind: "snapshot",
      semantic: "set-kanban-board-state",
    })
    setBoard(nextBoard)
  }

  function renderTask(task: KanbanTask) {
    return (
      <KanbanItem asHandle key={task.id} value={task.id}>
        <TaskCard task={task} />
      </KanbanItem>
    )
  }

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <h2 className="canvas-text-heading">Kanban board</h2>
        <p className="canvas-text-body text-muted-foreground">
          Drag cards between columns to add workflow state to the next block
          prompt.
        </p>
      </div>

      <Kanban
        flatCursor
        getItemValue={(item) => item.id}
        onValueChange={recordBoardChange}
        value={board}
      >
        <KanbanBoard className="min-h-0 overflow-x-auto">
          {kanbanColumnIds.map((columnId) => (
            <KanbanColumn
              className="min-w-0 bg-card text-card-foreground"
              key={columnId}
              value={columnId}
            >
              <div className="canvas-stack-md">
                <div className="canvas-cluster-md items-center justify-between">
                  <div className="canvas-stack-xs">
                    <span className="canvas-text-body">
                      {columnLabels[columnId]}
                    </span>
                    <span className="canvas-text-caption text-muted-foreground">
                      {(board[columnId] ?? []).length} item
                    </span>
                  </div>
                  <Badge variant="outline">{columnId}</Badge>
                </div>

                <div className="canvas-stack-sm">
                  {(board[columnId] ?? []).map((task) => renderTask(task))}
                </div>
              </div>
            </KanbanColumn>
          ))}
        </KanbanBoard>

        <KanbanOverlay>
          {({ value }) => {
            const task = Object.values(board)
              .flat()
              .find((item) => item.id === String(value))

            return task ? <TaskCard task={task} /> : null
          }}
        </KanbanOverlay>
      </Kanban>
    </section>
  )
}
