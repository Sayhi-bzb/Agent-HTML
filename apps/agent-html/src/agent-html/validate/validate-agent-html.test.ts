/// <reference types="node" />

import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

import { parseAgentHtml } from "@/agent-html/parse/parse-agent-html"
import { validateAgentHtml } from "@/agent-html/validate/validate-agent-html"

function fixture(...parts: string[]) {
  return readFileSync(
    new URL(`../fixtures/${parts.join("/")}`, import.meta.url),
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

  it("accepts the complex dashboard fixture", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("valid", "complex-dashboard.xml"))
    )

    expect(result.ok).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it("accepts the icon basic fixture", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("valid", "icon-basic.xml"))
    )

    expect(result.ok).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it("accepts the text basic fixture", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("valid", "text-basic.xml"))
    )

    expect(result.ok).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it("accepts the image basic fixture", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("valid", "image-basic.xml"))
    )

    expect(result.ok).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it("accepts the section width fixture", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("valid", "section-width.xml"))
    )

    expect(result.ok).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it("accepts the codeblock basic fixture", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("valid", "codeblock-basic.xml"))
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

  it("rejects bare text under section", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("invalid", "bare-text-under-section.xml"))
    )

    expect(result.ok).toBe(false)
    expect(result.errors[0]?.code).toBe("TEXT_NOT_ALLOWED")
  })

  it("rejects missing required attrs", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("invalid", "missing-tabs-trigger-value.xml"))
    )

    expect(result.ok).toBe(false)
    expect(
      result.errors.some((error) => error.code === "MISSING_REQUIRED_ATTR")
    ).toBe(true)
  })

  it("rejects layout gap attrs", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("invalid", "layout-gap-not-allowed.xml"))
    )

    expect(result.ok).toBe(false)
    expect(
      result.errors.some(
        (error) => error.code === "UNKNOWN_ATTR" && error.attr === "gap"
      )
    ).toBe(true)
  })

  it("rejects element children inside text", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("invalid", "text-with-child.xml"))
    )

    expect(result.ok).toBe(false)
    expect(
      result.errors.some((error) => error.code === "INVALID_CHILD")
    ).toBe(true)
  })

  it("rejects a carousel without content", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("invalid", "carousel-missing-content.xml"))
    )

    expect(result.ok).toBe(false)
    expect(
      result.errors.some((error) => error.code === "MISSING_REQUIRED_CHILD")
    ).toBe(true)
  })

  it("rejects a chart without series", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("invalid", "chart-missing-series.xml"))
    )

    expect(result.ok).toBe(false)
    expect(
      result.errors.some((error) => error.code === "MISSING_REQUIRED_CHILD")
    ).toBe(true)
  })

  it("rejects an unknown icon name", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("invalid", "unknown-icon-name.xml"))
    )

    expect(result.ok).toBe(false)
    expect(
      result.errors.some((error) => error.code === "UNKNOWN_ICON_NAME")
    ).toBe(true)
  })

  it("rejects invalid image src values", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("invalid", "image-invalid-src.xml"))
    )

    expect(result.ok).toBe(false)
    expect(
      result.errors.some(
        (error) => error.code === "INVALID_ATTR_VALUE" && error.attr === "src"
      )
    ).toBe(true)
  })

  it("rejects invalid image fit values", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("invalid", "image-invalid-fit.xml"))
    )

    expect(result.ok).toBe(false)
    expect(
      result.errors.some(
        (error) => error.code === "INVALID_ATTR_VALUE" && error.attr === "fit"
      )
    ).toBe(true)
  })

  it("rejects invalid section width values", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("invalid", "section-invalid-width.xml"))
    )

    expect(result.ok).toBe(false)
    expect(
      result.errors.some(
        (error) =>
          error.code === "INVALID_ATTR_VALUE" && error.attr === "width"
      )
    ).toBe(true)
  })

  it("rejects codeblocks missing language", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("invalid", "codeblock-missing-language.xml"))
    )

    expect(result.ok).toBe(false)
    expect(
      result.errors.some((error) => error.code === "MISSING_REQUIRED_ATTR")
    ).toBe(true)
  })

  it("rejects unsupported codeblock languages", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("invalid", "codeblock-invalid-language.xml"))
    )

    expect(result.ok).toBe(false)
    expect(
      result.errors.some(
        (error) =>
          error.code === "INVALID_ATTR_VALUE" && error.attr === "language"
      )
    ).toBe(true)
  })

  it("rejects empty codeblocks", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("invalid", "codeblock-empty.xml"))
    )

    expect(result.ok).toBe(false)
    expect(
      result.errors.some((error) => error.code === "MISSING_REQUIRED_CHILD")
    ).toBe(true)
  })

  it("rejects children inside image", () => {
    const result = validateAgentHtml(
      parseAgentHtml(fixture("invalid", "image-with-child.xml"))
    )

    expect(result.ok).toBe(false)
    expect(
      result.errors.some((error) => error.code === "INVALID_CHILD")
    ).toBe(true)
  })
})

