import { describe, expect, it } from "vitest"

import { shouldRefreshDocumentForCodexNotification } from "@/app/workspace/agent-document-refresh"

describe("shouldRefreshDocumentForCodexNotification", () => {
  it("refreshes after current turn file changes complete", () => {
    expect(
      shouldRefreshDocumentForCodexNotification({
        context: { threadId: "thr_1", turnId: "turn_1" },
        notification: {
          method: "item/completed",
          params: {
            item: {
              type: "fileChange",
            },
            threadId: "thr_1",
            turnId: "turn_1",
          },
        },
      })
    ).toBe(true)
  })

  it("refreshes after current turn completes", () => {
    expect(
      shouldRefreshDocumentForCodexNotification({
        context: { threadId: "thr_1", turnId: "turn_1" },
        notification: {
          method: "turn/completed",
          params: {
            threadId: "thr_1",
            turnId: "turn_1",
          },
        },
      })
    ).toBe(true)
  })

  it("ignores events from another turn", () => {
    expect(
      shouldRefreshDocumentForCodexNotification({
        context: { threadId: "thr_1", turnId: "turn_1" },
        notification: {
          method: "item/completed",
          params: {
            item: {
              type: "fileChange",
            },
            threadId: "thr_1",
            turnId: "turn_2",
          },
        },
      })
    ).toBe(false)
  })

  it("ignores non-file item completions", () => {
    expect(
      shouldRefreshDocumentForCodexNotification({
        context: { threadId: "thr_1", turnId: "turn_1" },
        notification: {
          method: "item/completed",
          params: {
            item: {
              type: "commandExecution",
            },
            threadId: "thr_1",
            turnId: "turn_1",
          },
        },
      })
    ).toBe(false)
  })
})
