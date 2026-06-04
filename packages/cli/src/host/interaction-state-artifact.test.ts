import { describe, expect, it } from "vitest"

import {
  createKanbanMoveChange,
  createTextEditChange,
} from "#agent-html-playground/artifacts/interaction-state.agent"

describe("interaction-state artifact interaction helpers", () => {
  it("creates input text diffs from focus start to blur value", () => {
    expect(
      createTextEditChange({
        component: "input",
        controlId: "input",
        from: "Canvas",
        semantic: "set-input-text",
        to: "Canvas revised",
      })
    ).toEqual({
      after: "Canvas revised",
      before: "Canvas",
      component: "input",
      controlId: "input",
      kind: "set",
      semantic: "set-input-text",
    })
  })

  it("creates textarea text diffs from focus start to blur value", () => {
    expect(
      createTextEditChange({
        component: "textarea",
        controlId: "textarea",
        from: "Try a short instruction.",
        semantic: "set-textarea-text",
        to: "Review this interaction prompt.",
      })
    ).toEqual({
      after: "Review this interaction prompt.",
      before: "Try a short instruction.",
      component: "textarea",
      controlId: "textarea",
      kind: "set",
      semantic: "set-textarea-text",
    })
  })

  it("omits unchanged text edits", () => {
    expect(
      createTextEditChange({
        component: "input",
        controlId: "input",
        from: "Canvas",
        semantic: "set-input-text",
        to: "Canvas",
      })
    ).toBeNull()
  })

  it("creates semantic kanban item move diffs across columns", () => {
    expect(
      createKanbanMoveChange({
        beforeColumns: {
          todo: [
            { id: "task-auth", title: "Auth flow" },
            { id: "task-api", title: "API contract" },
          ],
          doing: [],
        },
        afterColumns: {
          todo: [{ id: "task-api", title: "API contract" }],
          doing: [{ id: "task-auth", title: "Auth flow" }],
        },
        controlId: "sprint-board",
      })
    ).toEqual({
      after: {
        columnId: "doing",
        index: 0,
        itemId: "task-auth",
      },
      before: {
        columnId: "todo",
        index: 0,
        itemId: "task-auth",
      },
      component: "kanban",
      controlId: "sprint-board",
      kind: "move",
      semantic: "move-kanban-item",
    })
  })

  it("creates semantic kanban item reorder diffs within a column", () => {
    expect(
      createKanbanMoveChange({
        beforeColumns: {
          todo: [
            { id: "task-auth", title: "Auth flow" },
            { id: "task-api", title: "API contract" },
          ],
        },
        afterColumns: {
          todo: [
            { id: "task-api", title: "API contract" },
            { id: "task-auth", title: "Auth flow" },
          ],
        },
        controlId: "sprint-board",
      })
    ).toEqual({
      after: {
        columnId: "todo",
        index: 1,
        itemId: "task-auth",
      },
      before: {
        columnId: "todo",
        index: 0,
        itemId: "task-auth",
      },
      component: "kanban",
      controlId: "sprint-board",
      kind: "move",
      semantic: "move-kanban-item",
    })
  })

  it("creates semantic kanban column reorder diffs", () => {
    expect(
      createKanbanMoveChange({
        beforeColumns: {
          todo: [],
          doing: [],
        },
        afterColumns: {
          doing: [],
          todo: [],
        },
        controlId: "sprint-board",
      })
    ).toEqual({
      after: {
        columnId: "todo",
        index: 1,
      },
      before: {
        columnId: "todo",
        index: 0,
      },
      component: "kanban",
      controlId: "sprint-board",
      kind: "move",
      semantic: "move-kanban-column",
    })
  })

  it("omits unchanged kanban boards", () => {
    expect(
      createKanbanMoveChange({
        beforeColumns: {
          todo: [{ id: "task-auth", title: "Auth flow" }],
        },
        afterColumns: {
          todo: [{ id: "task-auth", title: "Auth flow" }],
        },
        controlId: "sprint-board",
      })
    ).toBeNull()
  })
})
