import { afterEach, describe, expect, it, vi } from "vitest"

import {
  readThreadId,
  readThreads,
  scheduleCodexAutoConnect,
} from "@/app/codex/connection"

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("Codex thread response parsing", () => {
  it("reads official paginated thread/list data", () => {
    expect(
      readThreads({
        data: [
          {
            createdAt: 1730910000,
            id: "thr_1",
            preview: "First",
            status: "idle",
            updated_at: 1730910100,
          },
        ],
        nextCursor: null,
      })
    ).toEqual([
      {
        createdAt: "1730910000",
        id: "thr_1",
        name: null,
        status: "idle",
        updatedAt: "1730910100",
      },
    ])
  })

  it("keeps compatibility with previous thread array shapes", () => {
    expect(readThreads({ threads: [{ id: "thr_1", name: "One" }] })).toEqual([
      {
        createdAt: undefined,
        id: "thr_1",
        name: "One",
        status: null,
        updatedAt: undefined,
      },
    ])
    expect(readThreads({ items: [{ id: "thr_2", title: "Two" }] })).toEqual([
      {
        createdAt: undefined,
        id: "thr_2",
        name: "Two",
        status: null,
        updatedAt: undefined,
      },
    ])
  })

  it("reads thread ids from official and compact responses", () => {
    expect(readThreadId({ thread: { id: "thr_official" } })).toBe(
      "thr_official"
    )
    expect(readThreadId({ threadId: "thr_compact" })).toBe("thr_compact")
    expect(readThreadId({ id: "thr_root" })).toBe("thr_root")
  })
})

describe("Codex auto-connect scheduling", () => {
  it("delays host connection until the scheduled startup task", async () => {
    vi.useFakeTimers()
    const connect = vi.fn().mockResolvedValue(undefined)

    scheduleCodexAutoConnect({
      connect,
      delayMs: 250,
      getAttemptId: () => 0,
      settings: { codexCommand: "codex" },
    })

    expect(connect).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(249)
    expect(connect).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)

    expect(connect).toHaveBeenCalledWith({ codexCommand: "codex" })
  })

  it("skips delayed auto-connect after a manual connection attempt starts", async () => {
    vi.useFakeTimers()
    let attemptId = 0
    const connect = vi.fn().mockResolvedValue(undefined)
    const onSkip = vi.fn()

    scheduleCodexAutoConnect({
      connect,
      delayMs: 250,
      getAttemptId: () => attemptId,
      onSkip,
      settings: { codexCommand: "codex" },
    })
    attemptId = 1
    await vi.advanceTimersByTimeAsync(250)

    expect(connect).not.toHaveBeenCalled()
    expect(onSkip).toHaveBeenCalledTimes(1)
  })
})
