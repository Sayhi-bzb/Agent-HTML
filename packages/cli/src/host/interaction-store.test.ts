import { describe, expect, it, beforeEach } from "vitest"

import {
  clearCanvasInteractionSnapshots,
  getCanvasInteractionSnapshot,
  recordCanvasInteractionChange,
} from "./interaction-store"

describe("Canvas interaction store", () => {
  beforeEach(() => {
    clearCanvasInteractionSnapshots()
  })

  it("groups interaction changes by artifact file and block", () => {
    recordCanvasInteractionChange({
      change: {
        after: true,
        before: false,
        blockId: "settings",
        component: "checkbox",
        controlId: "enable-motion",
        kind: "toggle",
        timestamp: 1,
      },
      filePath: ".agent-html/artifacts/demo.agent.tsx",
    })

    expect(
      getCanvasInteractionSnapshot({
        blockId: "settings",
        filePath: ".agent-html/artifacts/demo.agent.tsx",
      })
    ).toEqual({
      blockId: "settings",
      compactedActions: [],
      compactedChanges: [
        {
          component: "checkbox",
          controlId: "enable-motion",
          from: false,
          kind: "toggle",
          semantic: undefined,
          to: true,
        },
      ],
      currentState: {
        "enable-motion": true,
      },
      recentChanges: [
        {
          after: true,
          before: false,
          blockId: "settings",
          component: "checkbox",
          controlId: "enable-motion",
          kind: "toggle",
          timestamp: 1,
        },
      ],
    })

    expect(
      getCanvasInteractionSnapshot({
        blockId: "settings",
        filePath: ".agent-html/artifacts/other.agent.tsx",
      })
    ).toBeNull()
  })

  it("keeps only recent changes while retaining latest control state", () => {
    for (let index = 0; index < 25; index += 1) {
      recordCanvasInteractionChange({
        change: {
          after: index,
          before: index - 1,
          blockId: "motion",
          component: "slider",
          controlId: "threshold",
          kind: "set",
          timestamp: index,
        },
        filePath: ".agent-html/artifacts/demo.agent.tsx",
      })
    }

    const snapshot = getCanvasInteractionSnapshot({
      blockId: "motion",
      filePath: ".agent-html/artifacts/demo.agent.tsx",
    })

    expect(snapshot?.currentState).toEqual({ threshold: 24 })
    expect(snapshot?.compactedActions).toEqual([])
    expect(snapshot?.compactedChanges).toEqual([
      {
        component: "slider",
        controlId: "threshold",
        from: -1,
        kind: "set",
        semantic: undefined,
        to: 24,
      },
    ])
    expect(snapshot?.recentChanges).toHaveLength(20)
    expect(snapshot?.recentChanges[0]?.timestamp).toBe(5)
  })

  it("retains compact changes for controls after raw recent changes are capped", () => {
    for (let index = 0; index < 25; index += 1) {
      recordCanvasInteractionChange({
        change: {
          after: `after-${index}`,
          before: `before-${index}`,
          blockId: "bench",
          component: "input",
          controlId: `control-${index}`,
          kind: "set",
          semantic: "set-control",
          timestamp: index,
        },
        filePath: ".agent-html/artifacts/demo.agent.tsx",
      })
    }

    const snapshot = getCanvasInteractionSnapshot({
      blockId: "bench",
      filePath: ".agent-html/artifacts/demo.agent.tsx",
    })

    expect(snapshot?.recentChanges).toHaveLength(20)
    expect(snapshot?.compactedChanges).toHaveLength(25)
    expect(snapshot?.compactedChanges[0]).toEqual({
      component: "input",
      controlId: "control-0",
      from: "before-0",
      kind: "set",
      semantic: "set-control",
      to: "after-0",
    })
  })

  it("stores action intent separately from state changes", () => {
    recordCanvasInteractionChange({
      change: {
        after: "rewrite",
        before: "none",
        blockId: "bench",
        component: "command",
        controlId: "commandAction",
        kind: "action",
        semantic: "run-command-action",
        timestamp: 1,
      },
      filePath: ".agent-html/artifacts/demo.agent.tsx",
    })

    const snapshot = getCanvasInteractionSnapshot({
      blockId: "bench",
      filePath: ".agent-html/artifacts/demo.agent.tsx",
    })

    expect(snapshot?.compactedChanges).toEqual([])
    expect(snapshot?.compactedActions).toEqual([
      {
        controlId: "commandAction",
        semantic: "run-command-action",
        value: "rewrite",
      },
    ])
    expect(snapshot?.currentState).toEqual({
      commandAction: "rewrite",
    })
  })

  it("keeps multiple semantic changes for one control", () => {
    recordCanvasInteractionChange({
      change: {
        after: { itemId: "task-auth", columnId: "doing", index: 0 },
        before: { itemId: "task-auth", columnId: "todo", index: 0 },
        blockId: "kanban",
        component: "kanban",
        controlId: "sprint-board",
        kind: "move",
        semantic: "move-kanban-item",
        timestamp: 1,
      },
      filePath: ".agent-html/artifacts/demo.agent.tsx",
    })
    recordCanvasInteractionChange({
      change: {
        after: { todo: [], doing: [{ id: "task-auth" }] },
        before: { todo: [{ id: "task-auth" }], doing: [] },
        blockId: "kanban",
        component: "kanban",
        controlId: "sprint-board",
        kind: "snapshot",
        semantic: "set-kanban-board-state",
        timestamp: 2,
      },
      filePath: ".agent-html/artifacts/demo.agent.tsx",
    })

    const snapshot = getCanvasInteractionSnapshot({
      blockId: "kanban",
      filePath: ".agent-html/artifacts/demo.agent.tsx",
    })

    expect(snapshot?.compactedChanges).toHaveLength(2)
    expect(snapshot?.currentState).toEqual({
      "sprint-board": { todo: [], doing: [{ id: "task-auth" }] },
    })
  })

  it("ignores changes without block ownership", () => {
    recordCanvasInteractionChange({
      change: {
        after: true,
        before: false,
        component: "checkbox",
        controlId: "enable-motion",
        kind: "toggle",
        timestamp: 1,
      },
      filePath: ".agent-html/artifacts/demo.agent.tsx",
    })

    expect(
      getCanvasInteractionSnapshot({
        blockId: "settings",
        filePath: ".agent-html/artifacts/demo.agent.tsx",
      })
    ).toBeNull()
  })
})
