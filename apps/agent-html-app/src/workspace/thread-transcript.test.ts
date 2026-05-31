import { describe, expect, it } from "vitest"

import {
  emptyThreadTranscriptState,
  getThreadTranscriptLoadKey,
  normalizeThreadTranscriptTurns,
  reduceThreadTranscriptNotification,
} from "@/app/workspace/thread-transcript"

describe("thread transcript", () => {
  it("normalizes full thread turns into transcript turns", () => {
    expect(
      normalizeThreadTranscriptTurns({
        data: [
          {
            id: "turn_1",
            items: [
              {
                content: [{ text: "Hello", type: "text" }],
                id: "user_1",
                type: "userMessage",
              },
              {
                id: "agent_1",
                text: "Hi",
                type: "agentMessage",
              },
            ],
            status: "completed",
          },
        ],
      })
    ).toEqual([
      {
        id: "turn_1",
        items: [
          {
            aggregatedOutput: undefined,
            argumentsText: undefined,
            command: undefined,
            contentText: "Hello",
            cwd: undefined,
            id: "user_1",
            phase: undefined,
            query: undefined,
            resultText: undefined,
            server: undefined,
            status: undefined,
            summaryText: "Hello",
            tool: undefined,
            type: "userMessage",
          },
          expect.objectContaining({
            contentText: "Hi",
            id: "agent_1",
            type: "agentMessage",
          }),
        ],
        status: "completed",
      },
    ])
  })

  it("streams agent deltas and replaces them with completed items", () => {
    const started = reduceThreadTranscriptNotification(
      { ...emptyThreadTranscriptState, threadId: "thr_1" },
      {
        method: "turn/started",
        params: { threadId: "thr_1", turn: { id: "turn_1" } },
      }
    )
    const streamed = reduceThreadTranscriptNotification(started, {
      method: "item/agentMessage/delta",
      params: {
        delta: "Hel",
        itemId: "agent_1",
        threadId: "thr_1",
        turnId: "turn_1",
      },
    })
    const completed = reduceThreadTranscriptNotification(streamed, {
      method: "item/completed",
      params: {
        item: {
          id: "agent_1",
          text: "Hello.",
          type: "agentMessage",
        },
        threadId: "thr_1",
        turnId: "turn_1",
      },
    })

    expect(streamed.turns[0]?.items[0]).toEqual(
      expect.objectContaining({ contentText: "Hel", type: "agentMessage" })
    )
    expect(completed.turns[0]?.items[0]).toEqual(
      expect.objectContaining({ contentText: "Hello.", type: "agentMessage" })
    )
  })

  it("appends command output deltas in order", () => {
    const initial = { ...emptyThreadTranscriptState, threadId: "thr_1" }
    const first = reduceThreadTranscriptNotification(initial, {
      method: "item/commandExecution/outputDelta",
      params: {
        delta: "one\n",
        itemId: "cmd_1",
        threadId: "thr_1",
        turnId: "turn_1",
      },
    })
    const second = reduceThreadTranscriptNotification(first, {
      method: "item/commandExecution/outputDelta",
      params: {
        delta: "two\n",
        itemId: "cmd_1",
        threadId: "thr_1",
        turnId: "turn_1",
      },
    })

    expect(second.turns[0]?.items[0]).toEqual(
      expect.objectContaining({
        aggregatedOutput: "one\ntwo\n",
        type: "commandExecution",
      })
    )
  })

  it("ignores events from other threads", () => {
    const state = reduceThreadTranscriptNotification(
      { ...emptyThreadTranscriptState, threadId: "thr_1" },
      {
        method: "turn/started",
        params: { threadId: "thr_2", turn: { id: "turn_2" } },
      }
    )

    expect(state.turns).toEqual([])
  })

  it("uses only thread id and connection status for automatic load identity", () => {
    expect(
      getThreadTranscriptLoadKey({
        connectionStatus: "connected",
        threadId: "thr_1",
      })
    ).toBe(
      getThreadTranscriptLoadKey({
        connectionStatus: "connected",
        threadId: "thr_1",
      })
    )
    expect(
      getThreadTranscriptLoadKey({
        connectionStatus: "connected",
        threadId: "thr_1",
      })
    ).not.toBe(
      getThreadTranscriptLoadKey({
        connectionStatus: "connected",
        threadId: "thr_2",
      })
    )
    expect(
      getThreadTranscriptLoadKey({
        connectionStatus: "connecting",
        threadId: "thr_1",
      })
    ).not.toBe(
      getThreadTranscriptLoadKey({
        connectionStatus: "connected",
        threadId: "thr_1",
      })
    )
  })
})
