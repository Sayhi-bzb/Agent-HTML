import { describe, expect, it } from "vitest"

import {
  formatThreadRelativeTime,
  getThreadLinkStatus,
  readFirstThreadRequestText,
} from "@/app/workspace/surface"

describe("workspace thread card helpers", () => {
  it("formats thread timestamps as fixed English relative time", () => {
    const now = Date.UTC(2026, 4, 28, 12, 0, 0)

    expect(formatThreadRelativeTime(new Date(now - 20_000).toISOString(), now)).toBe(
      "just now"
    )
    expect(formatThreadRelativeTime(new Date(now - 3 * 60_000).toISOString(), now)).toBe(
      "3m ago"
    )
    expect(formatThreadRelativeTime(new Date(now - 2 * 60 * 60_000).toISOString(), now)).toBe(
      "2h ago"
    )
    expect(formatThreadRelativeTime(new Date(now - 5 * 24 * 60 * 60_000).toISOString(), now)).toBe(
      "5d ago"
    )
  })

  it("uses linked and check for project-thread correlation state", () => {
    expect(getThreadLinkStatus({ id: "thr_1", name: null })).toBe("linked")
    expect(getThreadLinkStatus(null)).toBe("check")
  })

  it("reads the first user request from summarized thread turns", () => {
    expect(
      readFirstThreadRequestText({
        data: [
          {
            items: [
              {
                content: [
                  { text: "  Build a pricing card  " },
                  { text: "with actions" },
                ],
                type: "userMessage",
              },
            ],
          },
        ],
      })
    ).toBe("Build a pricing card with actions")
  })
})
