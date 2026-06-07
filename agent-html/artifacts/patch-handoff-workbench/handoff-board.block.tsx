import { useState } from "react"
import { useEmitArtifactStateChange } from "@agent-html/react"

import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanItem,
  KanbanOverlay,
} from "../../components/kanban"
import type { HandoffBoardState, HandoffCard, ReviewLane } from "./data"
import { initialHandoffBoard, laneLabels, reviewLanes } from "./data"
import { CountBadge, StatusBadge, WorkbenchHeader } from "./shared"

const blockId = "handoff-board"
const controlId = "patch-handoff-board"

type CardPosition = {
  columnId: ReviewLane
  index: number
  itemId: string
}

function findCardPosition(
  board: HandoffBoardState,
  itemId: string
): CardPosition | null {
  for (const columnId of reviewLanes) {
    const index = board[columnId].findIndex((item) => item.id === itemId)

    if (index !== -1) {
      return {
        columnId,
        index,
        itemId,
      }
    }
  }

  return null
}

function findMove(before: HandoffBoardState, after: HandoffBoardState) {
  const ids = reviewLanes.flatMap((columnId) =>
    before[columnId].map((item) => item.id)
  )

  for (const id of ids) {
    const from = findCardPosition(before, id)
    const to = findCardPosition(after, id)

    if (from && to && (from.columnId !== to.columnId || from.index !== to.index)) {
      return { after: to, before: from }
    }
  }

  return null
}

function HandoffCardView({ card }: { card: HandoffCard }) {
  return (
    <div className="canvas-stack-sm rounded-md border bg-background p-3 text-foreground">
      <div className="canvas-wrap-sm items-center justify-between">
        <span className="canvas-text-body">{card.title}</span>
        <StatusBadge status={card.signal} />
      </div>
      <p className="canvas-text-body text-muted-foreground">{card.summary}</p>
      <p className="canvas-text-caption text-muted-foreground">
        Assignee: {card.assignee}
      </p>
    </div>
  )
}

export function HandoffBoardBlock() {
  const emitChange = useEmitArtifactStateChange({ blockId })
  const [board, setBoard] = useState<HandoffBoardState>(initialHandoffBoard)

  function recordBoard(nextBoard: HandoffBoardState) {
    const move = findMove(board, nextBoard)

    if (move) {
      emitChange({
        after: move.after,
        before: move.before,
        component: "kanban",
        controlId,
        kind: "move",
        semantic: "move-patch-handoff-card",
      })
    }

    emitChange({
      after: nextBoard,
      before: board,
      component: "kanban",
      controlId,
      kind: "snapshot",
      semantic: "set-patch-handoff-board",
    })
    setBoard(nextBoard)
  }

  function renderCard(card: HandoffCard) {
    return (
      <KanbanItem asHandle key={card.id} value={card.id}>
        <HandoffCardView card={card} />
      </KanbanItem>
    )
  }

  return (
    <section className="canvas-stack-lg">
      <WorkbenchHeader title="Handoff board">
        Move patch work between intake, diff review, owner follow-up, and ready
        states. Every move records a handoff state change.
      </WorkbenchHeader>

      <Kanban
        flatCursor
        getItemValue={(item) => item.id}
        onValueChange={(value) => recordBoard(value as HandoffBoardState)}
        value={board}
      >
        <KanbanBoard className="min-h-0 overflow-x-auto">
          {reviewLanes.map((columnId) => (
            <KanbanColumn
              className="min-w-0 bg-card text-card-foreground"
              key={columnId}
              value={columnId}
            >
              <div className="canvas-stack-md">
                <div className="canvas-wrap-sm items-center justify-between">
                  <span className="canvas-text-body">{laneLabels[columnId]}</span>
                  <CountBadge count={board[columnId].length} label="cards" />
                </div>
                <div className="canvas-stack-sm">
                  {board[columnId].map((card) => renderCard(card))}
                </div>
              </div>
            </KanbanColumn>
          ))}
        </KanbanBoard>

        <KanbanOverlay>
          {({ value }) => {
            const card = reviewLanes
              .flatMap((columnId) => board[columnId])
              .find((item) => item.id === String(value))

            return card ? <HandoffCardView card={card} /> : null
          }}
        </KanbanOverlay>
      </Kanban>
    </section>
  )
}
