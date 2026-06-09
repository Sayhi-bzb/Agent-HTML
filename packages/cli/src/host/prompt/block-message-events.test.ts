import { afterEach, describe, expect, it, vi } from "vitest"

import {
  blockMessageKey,
  clearBlockMessageThreads,
  failBlockMessageThread,
  finishBlockMessageThread,
  getBlockMessageStoreSnapshot,
  setBlockMessageThreadOpen,
  startBlockMessageThread,
} from "./block-message-events"

const target = {
  blockId: "summary",
  filePath: "agent-html/artifacts/demo.artifact.tsx",
  title: "Summary",
}

describe("block message events", () => {
  afterEach(() => {
    vi.useRealTimers()
    clearBlockMessageThreads()
  })

  it("starts a running block message thread with a request item", () => {
    startBlockMessageThread({
      request: "Update this block",
      target,
    })

    const thread =
      getBlockMessageStoreSnapshot().threads[blockMessageKey(target)]

    expect(thread.phase).toBe("running")
    expect(thread.readAt).toBeNull()
    expect(thread.items[0]).toMatchObject({
      kind: "request",
      summary: "Update this block",
    })
  })

  it("does not run the mock timeline by default", () => {
    vi.useFakeTimers()

    startBlockMessageThread({
      request: "Update this block",
      target,
    })
    vi.advanceTimersByTime(2300)

    const thread =
      getBlockMessageStoreSnapshot().threads[blockMessageKey(target)]

    expect(thread.phase).toBe("running")
    expect(thread.items.map((item) => item.kind)).toEqual([
      "request",
      "status",
    ])
  })

  it("finishes a thread with real Codex ids", () => {
    startBlockMessageThread({
      request: "Update this block",
      target,
    })
    finishBlockMessageThread({
      target,
      threadId: "thread_123",
      turnId: "turn_456",
    })

    const thread =
      getBlockMessageStoreSnapshot().threads[blockMessageKey(target)]

    expect(thread).toMatchObject({
      phase: "done",
      readAt: null,
      threadId: "thread_123",
      turnId: "turn_456",
    })
    expect(thread.items.at(-1)).toMatchObject({
      kind: "status",
      status: "done",
    })
  })

  it("records failed submit status", () => {
    startBlockMessageThread({
      request: "Update this block",
      target,
    })
    failBlockMessageThread({
      error: "Codex failed",
      target,
    })

    const thread =
      getBlockMessageStoreSnapshot().threads[blockMessageKey(target)]

    expect(thread.phase).toBe("failed")
    expect(thread.readAt).toBeNull()
    expect(thread.items.at(-1)).toMatchObject({
      kind: "status",
      status: "failed",
      summary: "Codex failed",
    })
  })

  it("keys threads by artifact file and block id", () => {
    startBlockMessageThread({
      request: "Update this block",
      target,
    })
    startBlockMessageThread({
      request: "Update the other artifact",
      target: {
        ...target,
        filePath: "agent-html/artifacts/other.artifact.tsx",
      },
    })

    expect(Object.keys(getBlockMessageStoreSnapshot().threads)).toHaveLength(2)
  })

  it("opens and closes an existing thread", () => {
    startBlockMessageThread({
      request: "Update this block",
      target,
    })

    setBlockMessageThreadOpen({
      blockId: target.blockId,
      filePath: target.filePath,
      isOpen: true,
    })

    expect(
      getBlockMessageStoreSnapshot().threads[blockMessageKey(target)].isOpen
    ).toBe(true)
  })

  it("marks completed threads read when opened", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-06-09T12:00:00.000Z"))
    startBlockMessageThread({
      request: "Update this block",
      target,
    })
    finishBlockMessageThread({
      target,
      threadId: "thread_123",
      turnId: "turn_456",
    })

    setBlockMessageThreadOpen({
      blockId: target.blockId,
      filePath: target.filePath,
      isOpen: true,
    })

    expect(
      getBlockMessageStoreSnapshot().threads[blockMessageKey(target)].readAt
    ).toBe(new Date("2026-06-09T12:00:00.000Z").getTime())
  })

  it("does not mark running threads read when opened", () => {
    startBlockMessageThread({
      request: "Update this block",
      target,
    })

    setBlockMessageThreadOpen({
      blockId: target.blockId,
      filePath: target.filePath,
      isOpen: true,
    })

    expect(
      getBlockMessageStoreSnapshot().threads[blockMessageKey(target)].readAt
    ).toBeNull()
  })
})
