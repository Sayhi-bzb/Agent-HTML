import { describe, expect, it } from "vitest"

import {
  createInitialAgentActivityState,
  markSpeechBubbleExiting,
  reduceCodexNotification,
  removeSpeechBubble,
} from "@/app/workspace/agent-activity"

describe("reduceCodexNotification", () => {
  it("records turn started without changing visible presence", () => {
    const state = reduceCodexNotification(
      createInitialAgentActivityState(),
      {
        method: "turn/started",
        params: {
          threadId: "thr_1",
          turn: {
            id: "turn_1",
          },
        },
      },
      {
        blockPath: "/Cell/Block[0]",
        threadId: "thr_1",
        turnId: "turn_1",
      },
      "2026-05-28T00:00:00.000Z"
    )

    expect(state.presence).toBeUndefined()
    expect(state.events[0].scope).toEqual({
      blockPath: "/Cell/Block[0]",
      type: "block",
    })
  })

  it("keeps agent message deltas out of PetPresence fallback messages", () => {
    const started = reduceCodexNotification(
      createInitialAgentActivityState(),
      {
        method: "item/started",
        params: {
          item: {
            id: "item_1",
            type: "agentMessage",
          },
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:00.000Z"
    )
    const first = reduceCodexNotification(
      started,
      {
        method: "item/agentMessage/delta",
        params: {
          delta: "Hello",
          itemId: "item_1",
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:00.000Z"
    )
    const second = reduceCodexNotification(
      first,
      {
        method: "item/agentMessage/delta",
        params: {
          delta: " world",
          itemId: "item_1",
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:01.000Z"
    )

    expect(second.speechBubbles[0]?.text).toBe("Hello world")
    expect(second.presence?.message).toBeUndefined()
    expect(second.presence?.action?.kind).toBe("speaking")
  })

  it("streams one agent message item into one speech bubble", () => {
    const started = reduceCodexNotification(
      createInitialAgentActivityState(),
      {
        method: "item/started",
        params: {
          item: {
            id: "item_1",
            type: "agentMessage",
          },
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:00.000Z"
    )
    const firstDelta = reduceCodexNotification(
      started,
      {
        method: "item/agentMessage/delta",
        params: {
          delta: "Hello",
          itemId: "item_1",
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:01.000Z"
    )
    const completed = reduceCodexNotification(
      firstDelta,
      {
        method: "item/completed",
        params: {
          item: {
            id: "item_1",
            type: "agentMessage",
          },
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:02.000Z"
    )

    expect(firstDelta.speechBubbles).toEqual([
      {
        createdAt: "2026-05-28T00:00:00.000Z",
        id: "item_1",
        mode: "streaming",
        text: "Hello",
      },
    ])
    expect(completed.speechBubbles[0]?.mode).toBe("final")
  })

  it("does not carry prior status messages into agent message presence", () => {
    const waiting = reduceCodexNotification(
      createInitialAgentActivityState(),
      {
        method: "item/commandExecution/requestApproval",
        params: {
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:00.000Z"
    )
    const speaking = reduceCodexNotification(
      waiting,
      {
        method: "item/started",
        params: {
          item: {
            id: "item_1",
            type: "agentMessage",
          },
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:01.000Z"
    )
    const completed = reduceCodexNotification(
      speaking,
      {
        method: "item/completed",
        params: {
          item: {
            id: "item_1",
            type: "agentMessage",
          },
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:02.000Z"
    )

    expect(waiting.presence?.message?.text).toBe("Codex needs input.")
    expect(speaking.presence?.message).toBeUndefined()
    expect(completed.presence?.message).toBeUndefined()
  })

  it("clears the speaking action when an agent message item completes", () => {
    const speaking = reduceCodexNotification(
      createInitialAgentActivityState(),
      {
        method: "item/agentMessage/delta",
        params: {
          delta: "Hello",
          itemId: "item_1",
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:00.000Z"
    )
    const completed = reduceCodexNotification(
      speaking,
      {
        method: "item/completed",
        params: {
          item: {
            id: "item_1",
            type: "agentMessage",
          },
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:01.000Z"
    )

    expect(speaking.presence?.action).toEqual({
      kind: "speaking",
      label: "writing response",
    })
    expect(completed.presence).toBeUndefined()
  })

  it("keeps approval and error messages in PetPresence", () => {
    const waiting = reduceCodexNotification(
      createInitialAgentActivityState(),
      {
        method: "item/commandExecution/requestApproval",
        params: {
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:00.000Z"
    )
    const failed = reduceCodexNotification(
      waiting,
      {
        method: "item/completed",
        params: {
          error: "Command failed.",
          item: {
            id: "item_1",
            type: "commandExecution",
          },
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:01.000Z"
    )

    expect(waiting.presence?.message?.text).toBe("Codex needs input.")
    expect(failed.presence?.message?.text).toBe("Command failed.")
  })

  it("marks final speech bubbles as exiting before removal", () => {
    const state = {
      ...createInitialAgentActivityState(),
      speechBubbles: [
        {
          createdAt: "2026-05-28T00:00:00.000Z",
          id: "item_1",
          mode: "final" as const,
          text: "Done",
        },
      ],
    }

    const exiting = markSpeechBubbleExiting(state, "item_1")
    const removed = removeSpeechBubble(exiting, "item_1")

    expect(exiting.speechBubbles[0]?.mode).toBe("exiting")
    expect(removed.speechBubbles).toEqual([])
  })

  it("keeps the latest two speech bubbles", () => {
    let state = createInitialAgentActivityState()

    for (let index = 1; index <= 3; index += 1) {
      state = reduceCodexNotification(
        state,
        {
          method: "item/started",
          params: {
            item: {
              id: `item_${index}`,
              type: "agentMessage",
            },
            threadId: "thr_1",
            turnId: "turn_1",
          },
        },
        { threadId: "thr_1", turnId: "turn_1" },
        `2026-05-28T00:00:0${index}.000Z`
      )
    }

    expect(state.speechBubbles.map((bubble) => bubble.id)).toEqual([
      "item_2",
      "item_3",
    ])
  })

  it("maps command item started to a stable running action label", () => {
    const state = reduceCodexNotification(
      createInitialAgentActivityState(),
      {
        method: "item/started",
        params: {
          item: {
            command: [
              "powershell",
              "-NoProfile",
              "-Command",
              "Get-Content very-long-path-that-should-not-render.agent-html",
            ],
            id: "item_1",
            type: "commandExecution",
          },
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:00.000Z"
    )

    expect(state.presence?.mood).toBe("working")
    expect(state.presence?.action).toEqual({
      kind: "running",
      label: "running command",
    })
    expect(state.speechBubbles).toEqual([])
  })

  it("maps tool, search, and unknown items to stable action labels", () => {
    const tool = reduceCodexNotification(
      createInitialAgentActivityState(),
      {
        method: "item/started",
        params: {
          item: {
            id: "item_1",
            tool: "very_long_tool_name_that_should_not_render",
            type: "mcpToolCall",
          },
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:00.000Z"
    )
    const search = reduceCodexNotification(
      createInitialAgentActivityState(),
      {
        method: "item/started",
        params: {
          item: {
            id: "item_2",
            type: "webSearch",
          },
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:01.000Z"
    )
    const unknown = reduceCodexNotification(
      createInitialAgentActivityState(),
      {
        method: "item/started",
        params: {
          item: {
            id: "item_3",
            type: "longRawItemTypeThatShouldNotRender",
          },
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:02.000Z"
    )

    expect(tool.presence?.action).toEqual({
      kind: "running",
      label: "using tool",
    })
    expect(search.presence?.action).toEqual({
      kind: "searching",
      label: "searching web",
    })
    expect(unknown.presence?.action).toEqual({
      kind: "thinking",
      label: "working",
    })
  })

  it("maps approval requests to waiting presence", () => {
    const state = reduceCodexNotification(
      createInitialAgentActivityState(),
      {
        method: "item/commandExecution/requestApproval",
        params: {
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:00.000Z"
    )

    expect(state.presence?.mood).toBe("waiting")
    expect(state.presence?.action?.kind).toBe("waiting")
  })

  it("hides successful turn completion but shows failures", () => {
    const speaking = reduceCodexNotification(
      createInitialAgentActivityState(),
      {
        method: "item/agentMessage/delta",
        params: {
          delta: "Hello",
          itemId: "item_1",
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:00.000Z"
    )
    const done = reduceCodexNotification(
      speaking,
      {
        method: "turn/completed",
        params: {
          status: "completed",
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:01.000Z"
    )
    const failed = reduceCodexNotification(
      done,
      {
        method: "turn/completed",
        params: {
          error: "nope",
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:02.000Z"
    )

    expect(speaking.presence?.action?.label).toBe("writing response")
    expect(done.presence).toBeUndefined()
    expect(failed.presence?.mood).toBe("failed")
    expect(failed.presence?.message?.text).toBe("nope")
  })

  it("retains unknown events without changing presence", () => {
    const state = reduceCodexNotification(
      createInitialAgentActivityState(),
      {
        method: "unknown/event",
        params: {
          value: true,
        },
      },
      {},
      "2026-05-28T00:00:00.000Z"
    )

    expect(state.events).toHaveLength(1)
    expect(state.events[0].scope).toEqual({ type: "system" })
    expect(state.presence).toBeUndefined()
  })

  it("stores event summaries without raw notification payloads", () => {
    const state = reduceCodexNotification(
      createInitialAgentActivityState(),
      {
        method: "item/completed",
        params: {
          item: {
            id: "item_1",
            output: "x".repeat(10_000),
            status: "completed",
          },
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:00.000Z"
    )

    expect(state.events[0]).toEqual({
      id: "2026-05-28T00:00:00.000Z:0:item/completed",
      itemId: "item_1",
      method: "item/completed",
      receivedAt: "2026-05-28T00:00:00.000Z",
      scope: { type: "workspace" },
      status: "completed",
      threadId: "thr_1",
      turnId: "turn_1",
    })
  })
})
