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
    expect(snapshot?.recentChanges).toHaveLength(20)
    expect(snapshot?.recentChanges[0]?.timestamp).toBe(5)
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
