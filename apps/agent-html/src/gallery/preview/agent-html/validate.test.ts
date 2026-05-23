/// <reference types="node" />

import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

import { parseAgentHtml } from "@/gallery/preview/agent-html/parser"
import { validateAgentHtml } from "@/gallery/preview/agent-html/validate"

function fixture(...parts: string[]) {
  return readFileSync(
    new URL(`./fixtures/${parts.join("/")}`, import.meta.url),
    "utf8"
  )
}

describe("validateAgentHtml", () => {
  it("accepts the minimal valid page", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("valid", "minimal-page.xml"))
    )

    expect(result.ok).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it("accepts the canonical card/tabs/grid fixture", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("valid", "card-tabs-grid.xml"))
    )

    expect(result.ok).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it("rejects unknown tags", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("invalid", "unknown-tag.xml"))
    )

    expect(result.ok).toBe(false)
    expect(result.errors[0]?.code).toBe("UNKNOWN_TAG")
  })

  it("rejects bare text under layout nodes", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("invalid", "bare-text-under-grid.xml"))
    )

    expect(result.ok).toBe(false)
    expect(result.errors[0]?.code).toBe("TEXT_NOT_ALLOWED")
  })

  it("rejects missing required attrs", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("invalid", "missing-tabs-trigger-value.xml"))
    )

    expect(result.ok).toBe(false)
    expect(result.errors.some((error) => error.code === "MISSING_REQUIRED_ATTR")).toBe(
      true
    )
  })
})
