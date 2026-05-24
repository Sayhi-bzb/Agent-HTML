import { describe, expect, it } from "vitest"

import { hasIconName } from "@/agent-html/icons/icon-registry"
import { searchIconNames } from "@/agent-html/icons/search-icons"

describe("agent-html icon registry", () => {
  it("recognizes a known lucide icon name", () => {
    expect(hasIconName("alert-circle")).toBe(true)
  })

  it("returns false for an unknown icon name", () => {
    expect(hasIconName("not-a-real-lucide-icon")).toBe(false)
  })

  it("supports basic icon search", () => {
    const matches = searchIconNames("alert")
    expect(matches.length).toBeGreaterThan(0)
    expect(matches.some((name) => name.includes("alert"))).toBe(true)
  })
})

