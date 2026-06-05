import { describe, expect, it } from "vitest"

import { compactInteractionSnapshot, formatBlockPrompt } from "./prompt.mjs"

const payload = {
  blockPath: "summary",
  filePath: ".agent-html/artifacts/example.agent.tsx",
  request: "Tighten this summary.",
}

describe("React Canvas prompt bridge", () => {
  it("formats block prompts as minimal intent packets", () => {
    const prompt = formatBlockPrompt(payload)

    expect(prompt).toContain("filePath: .agent-html/artifacts/example.agent.tsx")
    expect(prompt).toContain("blockPath: summary")
    expect(prompt).not.toContain("implementationPath:")
    expect(prompt).not.toContain("```tsx")
    expect(prompt).not.toContain("targetStatus")
    expect(prompt).not.toContain("sourceMode")
    expect(prompt).toContain("Request:\nTighten this summary.")
  })

  it("uses one formatter for host display and clipboard output", () => {
    const formattedPrompt = formatBlockPrompt(payload)

    expect(formattedPrompt).toBe(formatBlockPrompt(payload))
  })

  it("includes split block implementation paths when available", () => {
    const prompt = formatBlockPrompt({
      ...payload,
      implementationPath: ".agent-html/artifacts/example/summary.block.tsx",
    })

    expect(prompt).toContain(
      "implementationPath: .agent-html/artifacts/example/summary.block.tsx"
    )
  })

  it("includes compact interaction context when block state changes are available", () => {
    const prompt = formatBlockPrompt({
      ...payload,
      interactionSnapshot: {
        blockId: "summary",
        currentState: {
          status: "doing",
        },
        recentChanges: [
          {
            after: "doing",
            before: "todo",
            blockId: "summary",
            component: "select",
            controlId: "status",
            kind: "select",
            semantic: "set-status",
            timestamp: 123,
          },
        ],
      },
    })

    expect(prompt).not.toContain("Interaction Context:")
    expect(prompt).toContain("```interaction")
    expect(prompt).not.toContain("interaction:")
    expect(prompt).toContain("finalState:")
    expect(prompt).toContain("status: doing")
    expect(prompt).toContain("diff[1]{controlId,from,semantic,to}:")
    expect(prompt).toContain("status,todo,set-status,doing")
    expect(prompt).toContain("actions: []")
    expect(prompt).not.toContain("```toon")
    expect(prompt).not.toContain("```json")
    expect(prompt).not.toContain("recentChanges")
    expect(prompt).not.toContain("timestamp")
    expect(prompt).toContain("Request:\nTighten this summary.")
  })

  it("compacts repeated control changes to first before and final after", () => {
    expect(
      compactInteractionSnapshot({
        blockId: "motion",
        currentState: {
          threshold: 60,
        },
        recentChanges: [
          {
            after: 45,
            before: 40,
            component: "slider",
            controlId: "threshold",
            kind: "set",
            semantic: "set-animation-threshold",
            timestamp: 1,
          },
          {
            after: 50,
            before: 45,
            component: "slider",
            controlId: "threshold",
            kind: "set",
            semantic: "set-animation-threshold",
            timestamp: 2,
          },
          {
            after: 60,
            before: 50,
            component: "slider",
            controlId: "threshold",
            kind: "set",
            semantic: "set-animation-threshold",
            timestamp: 3,
          },
        ],
      })
    ).toEqual({
      actions: [],
      finalState: {
        threshold: 60,
      },
      diff: [
        {
          controlId: "threshold",
          from: 40,
          semantic: "set-animation-threshold",
          to: 60,
        },
      ],
    })
  })

  it("uses persisted compact changes when recent changes were capped", () => {
    expect(
      compactInteractionSnapshot({
        blockId: "bench",
        compactedChanges: [
          {
            component: "checkbox",
            controlId: "checkbox",
            from: false,
            kind: "toggle",
            semantic: "toggle-checkbox",
            to: true,
          },
          {
            component: "select",
            controlId: "select",
            from: "draft",
            kind: "select",
            semantic: "set-select-status",
            to: "ready",
          },
        ],
        currentState: {
          checkbox: true,
          select: "ready",
        },
        recentChanges: [
          {
            after: "ready",
            before: "review",
            component: "select",
            controlId: "select",
            kind: "select",
            semantic: "set-select-status",
            timestamp: 25,
          },
        ],
      })
    ).toEqual({
      actions: [],
      finalState: {
        checkbox: true,
        select: "ready",
      },
      diff: [
        {
          controlId: "checkbox",
          from: false,
          semantic: "toggle-checkbox",
          to: true,
        },
        {
          controlId: "select",
          from: "draft",
          semantic: "set-select-status",
          to: "ready",
        },
      ],
    })
  })

  it("separates action intent from state diffs", () => {
    expect(
      compactInteractionSnapshot({
        blockId: "bench",
        compactedActions: [
          {
            controlId: "commandAction",
            semantic: "run-command-action",
            value: "rewrite",
          },
        ],
        compactedChanges: [
          {
            component: "select",
            controlId: "status",
            from: "draft",
            kind: "select",
            semantic: "set-status",
            to: "ready",
          },
        ],
        currentState: {
          commandAction: "rewrite",
          status: "ready",
        },
        recentChanges: [],
      })
    ).toEqual({
      actions: [
        {
          controlId: "commandAction",
          semantic: "run-command-action",
          value: "rewrite",
        },
      ],
      finalState: {
        commandAction: "rewrite",
        status: "ready",
      },
      diff: [
        {
          controlId: "status",
          from: "draft",
          semantic: "set-status",
          to: "ready",
        },
      ],
    })
  })

  it("omits view state changes from prompt diffs", () => {
    expect(
      compactInteractionSnapshot({
        blockId: "bench",
        compactedChanges: [
          {
            component: "tabs",
            controlId: "tabs",
            from: "forms",
            kind: "select",
            semantic: "select-interaction-section",
            to: "layout",
          },
          {
            component: "dialog",
            controlId: "dialogOpen",
            from: false,
            kind: "open",
            semantic: "set-dialog-open",
            to: true,
          },
          {
            component: "slider",
            controlId: "slider",
            from: 40,
            kind: "set",
            semantic: "set-slider-threshold",
            to: 60,
          },
        ],
        currentState: {
          dialogOpen: true,
          slider: 60,
          tabs: "layout",
        },
        recentChanges: [],
      })
    ).toEqual({
      actions: [],
      finalState: {
        dialogOpen: true,
        slider: 60,
        tabs: "layout",
      },
      diff: [
        {
          controlId: "slider",
          from: 40,
          semantic: "set-slider-threshold",
          to: 60,
        },
      ],
    })
  })

  it("keeps kanban move diffs while omitting board snapshot changes", () => {
    expect(
      compactInteractionSnapshot({
        blockId: "kanban-board",
        compactedChanges: [
          {
            component: "kanban",
            controlId: "sprint-board",
            from: { itemId: "task-auth", columnId: "todo", index: 0 },
            kind: "move",
            semantic: "move-kanban-item",
            to: { itemId: "task-auth", columnId: "doing", index: 0 },
          },
          {
            component: "kanban",
            controlId: "sprint-board",
            from: {
              todo: [{ id: "task-auth", title: "Auth flow" }],
              doing: [],
            },
            kind: "snapshot",
            semantic: "set-kanban-board-state",
            to: {
              todo: [],
              doing: [{ id: "task-auth", title: "Auth flow" }],
            },
          },
        ],
        currentState: {
          "sprint-board": {
            todo: [],
            doing: [{ id: "task-auth", title: "Auth flow" }],
          },
        },
        recentChanges: [],
      })
    ).toEqual({
      actions: [],
      finalState: {
        "sprint-board": {
          todo: [],
          doing: [{ id: "task-auth", title: "Auth flow" }],
        },
      },
      diff: [
        {
          controlId: "sprint-board",
          from: { itemId: "task-auth", columnId: "todo", index: 0 },
          semantic: "move-kanban-item",
          to: { itemId: "task-auth", columnId: "doing", index: 0 },
        },
      ],
    })
  })

  it("omits no-op compact interaction diffs", () => {
    expect(
      compactInteractionSnapshot({
        blockId: "settings",
        currentState: {
          enabled: false,
        },
        recentChanges: [
          {
            after: true,
            before: false,
            component: "checkbox",
            controlId: "enabled",
            kind: "toggle",
            semantic: "toggle-enabled",
            timestamp: 1,
          },
          {
            after: false,
            before: true,
            component: "checkbox",
            controlId: "enabled",
            kind: "toggle",
            semantic: "toggle-enabled",
            timestamp: 2,
          },
        ],
      })
    ).toEqual({
      actions: [],
      finalState: {
        enabled: false,
      },
      diff: [],
    })
  })
})
