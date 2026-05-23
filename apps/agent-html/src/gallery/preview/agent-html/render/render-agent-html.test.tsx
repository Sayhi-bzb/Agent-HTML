/// <reference types="node" />

import { readFileSync } from "node:fs"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { parseAgentHtml } from "@/gallery/preview/agent-html/parse/parse-agent-html"
import { renderAgentHtml } from "@/gallery/preview/agent-html/render/render-agent-html"
import { validateAgentHtml } from "@/gallery/preview/agent-html/validate/validate-agent-html"

function fixture(...parts: string[]) {
  return readFileSync(
    new URL(`../fixtures/${parts.join("/")}`, import.meta.url),
    "utf8"
  )
}

describe("renderAgentHtml", () => {
  it("renders the minimal valid page", () => {
    const document = parseAgentHtml(fixture("valid", "minimal-page.xml"))
    const validation = validateAgentHtml(document)

    expect(validation.ok).toBe(true)

    const html = renderToStaticMarkup(renderAgentHtml(document))
    expect(html).toContain("Ready")
    expect(html).toContain("data-slot=\"card\"")
  })

  it("renders the canonical card/tabs/grid fixture", () => {
    const document = parseAgentHtml(fixture("valid", "card-tabs-grid.xml"))
    const validation = validateAgentHtml(document)

    expect(validation.ok).toBe(true)

    const html = renderToStaticMarkup(renderAgentHtml(document))
    expect(html).toContain("Controls")
    expect(html).toContain("data-slot=\"tabs\"")
    expect(html).toContain("data-slot=\"accordion\"")
    expect(html).toContain("data-slot=\"table\"")
  })

  it("renders the complex dashboard fixture", () => {
    const document = parseAgentHtml(fixture("valid", "complex-dashboard.xml"))
    const validation = validateAgentHtml(document)

    expect(validation.ok).toBe(true)

    const html = renderToStaticMarkup(renderAgentHtml(document))
    expect(html).toContain("Release status")
    expect(html).toContain("data-slot=\"tabs\"")
    expect(html).toContain("data-slot=\"accordion\"")
    expect(html).toContain("data-slot=\"table\"")
    expect(html.split("data-slot=\"card\"").length - 1).toBeGreaterThan(3)
  })

  it("throws for unsupported render tags", () => {
    const document = parseAgentHtml(
      "<Page title=\"Unsupported\"><Chart type=\"bar\"><ChartSeries key=\"a\" /></Chart></Page>"
    )

    expect(() => renderAgentHtml(document)).toThrow("Unsupported render tag: Chart")
  })
})
