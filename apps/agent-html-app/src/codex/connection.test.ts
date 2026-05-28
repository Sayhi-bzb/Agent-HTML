import { describe, expect, it } from "vitest"

import { readThreadId, readThreads } from "@/app/codex/connection"

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
