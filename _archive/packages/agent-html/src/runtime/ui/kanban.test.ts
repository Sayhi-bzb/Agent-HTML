import { describe, expect, it } from "vitest"

import {
  columnDndId,
  itemDndId,
  moveKanbanItem,
} from "@/agent-html/runtime/ui/kanban-dnd"

const columns = [
  {
    value: "todo",
    title: "Todo",
    items: [
      { value: "a", content: "A" },
      { value: "b", content: "B" },
    ],
  },
  {
    value: "doing",
    title: "Doing",
    items: [{ value: "c", content: "C" }],
  },
  {
    value: "done",
    title: "Done",
    items: [],
  },
]

function arrayMoveItems<T>(array: T[], from: number, to: number) {
  const next = [...array]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

describe("moveKanbanItem", () => {
  it("reorders items within a column", () => {
    const result = moveKanbanItem(
      columns,
      itemDndId("a"),
      itemDndId("b"),
      arrayMoveItems
    )

    expect(result[0].items.map((item) => item.value)).toEqual(["b", "a"])
  })

  it("moves items across columns before another item", () => {
    const result = moveKanbanItem(
      columns,
      itemDndId("a"),
      itemDndId("c"),
      arrayMoveItems
    )

    expect(result[0].items.map((item) => item.value)).toEqual(["b"])
    expect(result[1].items.map((item) => item.value)).toEqual(["a", "c"])
  })

  it("appends items when hovering over a column", () => {
    const result = moveKanbanItem(
      columns,
      itemDndId("a"),
      columnDndId("done"),
      arrayMoveItems
    )

    expect(result[0].items.map((item) => item.value)).toEqual(["b"])
    expect(result[2].items.map((item) => item.value)).toEqual(["a"])
  })

  it("keeps columns unchanged when over target is invalid", () => {
    const result = moveKanbanItem(
      columns,
      itemDndId("a"),
      itemDndId("missing"),
      arrayMoveItems
    )

    expect(result).toBe(columns)
  })
})
