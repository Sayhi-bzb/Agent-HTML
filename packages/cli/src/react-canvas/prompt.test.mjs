import { describe, expect, it } from "vitest"

import { compactInteractionSnapshot, formatBlockPrompt } from "./prompt.mjs"

const payload = {
  blockPath: "summary",
  filePath: ".agent-html/artifacts/example.agent.tsx",
  request: "Tighten this summary.",
  selectedSource: '<Block id="summary">Summary</Block>',
  targetStatus: "selected_block",
}

describe("React Canvas prompt bridge", () => {
  it("formats selected block prompts as fenced tsx", () => {
    expect(formatBlockPrompt(payload)).toContain("```tsx")
    expect(formatBlockPrompt(payload)).toContain("blockPath: summary")
    expect(formatBlockPrompt(payload)).toContain("Request:\nTighten this summary.")
  })

  it("omits source fence for missing blocks", () => {
    const prompt = formatBlockPrompt({
      ...payload,
      selectedSource: null,
      targetStatus: "missing_block",
    })

    expect(prompt).toContain("targetStatus: missing_block")
    expect(prompt).not.toContain("```tsx")
  })

  it("uses one formatter for host display and clipboard output", () => {
    const formattedPrompt = formatBlockPrompt(payload)

    expect(formattedPrompt).toBe(formatBlockPrompt(payload))
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

    expect(prompt).toContain("Interaction Context:")
    expect(prompt).toContain("```toon")
    expect(prompt).toContain("interaction:")
    expect(prompt).toContain("finalState:")
    expect(prompt).toContain("status: doing")
    expect(prompt).toContain("diff[1]{controlId,from,semantic,to}:")
    expect(prompt).toContain("status,todo,set-status,doing")
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
      finalState: {
        enabled: false,
      },
      diff: [],
    })
  })
})
