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
        blockPath: "/Page/Section[0]/Stack[0]",
        threadId: "thr_1",
        turnId: "turn_1",
      },
      "2026-05-28T00:00:00.000Z"
    )

    expect(state.presence).toBeUndefined()
    expect(state.events[0].scope).toEqual({
      blockPath: "/Page/Section[0]/Stack[0]",
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

  it("maps command item started to a running action", () => {
    const state = reduceCodexNotification(
      createInitialAgentActivityState(),
      {
        method: "item/started",
        params: {
          item: {
            command: ["npm", "test"],
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
      label: "npm test",
    })
    expect(state.speechBubbles).toEqual([])
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
    const done = reduceCodexNotification(
      createInitialAgentActivityState(),
      {
        method: "turn/completed",
        params: {
          status: "completed",
          threadId: "thr_1",
          turnId: "turn_1",
        },
      },
      { threadId: "thr_1", turnId: "turn_1" },
      "2026-05-28T00:00:00.000Z"
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
      "2026-05-28T00:00:01.000Z"
    )

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
