import { useState } from "react"

import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanItem,
  KanbanOverlay,
} from "../../components/kanban"
import { Checkbox } from "../../components/ui/checkbox"
import { StatusBadge } from "../../components/ui/status-badge"
import {
  reviewChecks,
  reviewGateColumns,
  reviewLanes,
} from "./data/review-decision"
import type { ReviewGateCard } from "./data/types"

function initialGateColumns(): Record<string, ReviewGateCard[]> {
  return Object.fromEntries(
    reviewGateColumns.map((column) => [
      column.id,
      column.cards satisfies ReviewGateCard[],
    ])
  )
}

function findGateCard(
  columns: Record<string, ReviewGateCard[]>,
  id: string
) {
  return Object.values(columns)
    .flat()
    .find((card) => card.id === id)
}

export function ReviewGateBlock() {
  const [columns, setColumns] =
    useState<Record<string, ReviewGateCard[]>>(initialGateColumns)

  return (
    <section className="canvas-stack-md">
      <div className="canvas-stack-xs">
        <p className="canvas-text-caption text-muted-foreground">
          review gate
        </p>
        <h2 className="canvas-text-heading">
          Review comments become Canvas package gates.
        </h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.58fr)_minmax(260px,0.42fr)]">
        <Kanban
          getItemValue={(item) => item.id}
          onValueChange={(nextColumns) => {
            setColumns(Object.fromEntries(Object.entries(nextColumns)))
          }}
          value={columns}
        >
          <KanbanBoard className="min-h-72 overflow-x-auto rounded-md bg-background p-4">
            {reviewGateColumns.map((column) => (
              <KanbanColumn
                className="min-w-48 bg-muted/40"
                key={column.id}
                value={column.id}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="canvas-text-caption text-muted-foreground">
                    {column.label}
                  </span>
                  <StatusBadge status={column.status}>
                    {columns[column.id]?.length ?? 0}
                  </StatusBadge>
                </div>
                {(columns[column.id] ?? []).map((card) => (
                  <KanbanItem
                    asHandle
                    className="canvas-stack-xs rounded-md bg-background p-3"
                    key={card.id}
                    value={card.id}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="canvas-text-caption text-muted-foreground">
                        {card.label}
                      </p>
                      <StatusBadge status={card.status}>gate</StatusBadge>
                    </div>
                    <p className="canvas-text-body">{card.detail}</p>
                  </KanbanItem>
                ))}
              </KanbanColumn>
            ))}
          </KanbanBoard>
          <KanbanOverlay>
            {({ value }) => {
              const card = findGateCard(columns, String(value))

              if (!card) {
                return null
              }

              return (
                <div className="canvas-stack-xs w-56 rounded-md bg-background p-3 shadow-lg">
                  <StatusBadge status={card.status}>{card.label}</StatusBadge>
                  <p className="canvas-text-body">{card.detail}</p>
                </div>
              )
            }}
          </KanbanOverlay>
        </Kanban>

        <div className="canvas-stack-sm rounded-md bg-background p-4">
          <StatusBadge status="warning">ready after Canvas gates pass</StatusBadge>
          {reviewLanes.map((lane) => (
            <div className="canvas-text-caption text-muted-foreground" key={lane.label}>
              {lane.label}: {lane.detail}
            </div>
          ))}
          {reviewChecks.map((check) => (
            <label className="flex items-center gap-3" key={check}>
              <Checkbox />
              <span className="canvas-text-body">{check}</span>
            </label>
          ))}
        </div>
      </div>
    </section>
  )
}
