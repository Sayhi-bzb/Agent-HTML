import { describe, expect, it } from "vitest"

import {
  codexThreadLabel,
  resolveActiveCodexThreadLabel,
  shortCodexThreadId,
} from "./thread-label"

const threads = [
  {
    id: "thread_1234567890_abcdefghijklmnop",
    name: "Navigation polish",
    preview: "Fallback preview",
    status: "idle",
  },
]

describe("Codex thread labels", () => {
  it("uses name, preview, then a shortened id", () => {
    expect(codexThreadLabel(threads[0])).toBe("Navigation polish")
    expect(codexThreadLabel({ ...threads[0], name: null })).toBe(
      "Fallback preview"
    )
    expect(
      codexThreadLabel({ ...threads[0], name: null, preview: undefined })
    ).toBe(shortCodexThreadId(threads[0].id))
  })

  it("resolves new and missing active thread state without a generic label", () => {
    expect(
      resolveActiveCodexThreadLabel({ activeThreadId: null, threads })
    ).toBeNull()
    expect(
      resolveActiveCodexThreadLabel({
        activeThreadId: "thread_missing_1234567890",
        threads,
      })
    ).toBe(shortCodexThreadId("thread_missing_1234567890"))
  })
})
