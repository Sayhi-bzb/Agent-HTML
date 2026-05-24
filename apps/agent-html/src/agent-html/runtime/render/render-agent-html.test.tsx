/// <reference types="node" />

import { readFileSync } from "node:fs"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { parseAgentHtml } from "@/agent-html/parse/parse-agent-html"
import { renderAgentHtml } from "@/agent-html/runtime/render/render-agent-html"
import { validateAgentHtml } from "@/agent-html/validate/validate-agent-html"

function fixture(...parts: string[]) {
  return readFileSync(
    new URL(`../../fixtures/${parts.join("/")}`, import.meta.url),
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

  it("renders the icon basic fixture", () => {
    const document = parseAgentHtml(fixture("valid", "icon-basic.xml"))
    const validation = validateAgentHtml(document)

    expect(validation.ok).toBe(true)

    const html = renderToStaticMarkup(renderAgentHtml(document))
    expect(html).toContain("Runtime icon")
    expect(
      html.includes("data-slot=\"icon-fallback\"") ||
        html.includes("<svg")
    ).toBe(true)
  })

  it("renders the text basic fixture", () => {
    const document = parseAgentHtml(fixture("valid", "text-basic.xml"))
    const validation = validateAgentHtml(document)

    expect(validation.ok).toBe(true)

    const html = renderToStaticMarkup(renderAgentHtml(document))
    expect(html).toContain("Typography block")
    expect(html).toContain("data-slot=\"text\"")
    expect(html).toContain("data-variant=\"h2\"")
    expect(html).toContain("<code")
  })

  it("renders the image basic fixture", () => {
    const document = parseAgentHtml(fixture("valid", "image-basic.xml"))
    const validation = validateAgentHtml(document)

    expect(validation.ok).toBe(true)

    const html = renderToStaticMarkup(renderAgentHtml(document))
    expect(html).toContain("<img")
    expect(html).toContain("data-slot=\"image\"")
    expect(html).toContain("src=\"https://example.com/runtime-preview.jpg\"")
    expect(html).toContain("alt=\"Runtime preview\"")
    expect(html).toContain("object-cover")
    expect(html).toContain("object-contain")
  })

  it("renders the section width fixture", () => {
    const document = parseAgentHtml(fixture("valid", "section-width.xml"))
    const validation = validateAgentHtml(document)

    expect(validation.ok).toBe(true)

    const html = renderToStaticMarkup(renderAgentHtml(document))
    expect(html).toContain("<section")
    expect(html).toContain("max-w-4xl")
    expect(html).toContain("max-w-2xl")
    expect(html).toContain("Full width can hold broader modules.")
  })

  it("renders the codeblock basic fixture", () => {
    const document = parseAgentHtml(fixture("valid", "codeblock-basic.xml"))
    const validation = validateAgentHtml(document)

    expect(validation.ok).toBe(true)

    const html = renderToStaticMarkup(renderAgentHtml(document))
    expect(html).toContain("data-slot=\"code-block\"")
    expect(html).toContain("data-slot=\"code-block-copy\"")
    expect(html).toContain("Example.tsx")
    expect(html).toContain("return")
    expect(html).toContain("Hello")
  })

  it("renders the timeline basic fixture", () => {
    const document = parseAgentHtml(fixture("valid", "timeline-basic.xml"))
    const validation = validateAgentHtml(document)

    expect(validation.ok).toBe(true)

    const html = renderToStaticMarkup(renderAgentHtml(document))
    expect(html).toContain("data-slot=\"timeline\"")
    expect(html).toContain("data-slot=\"timeline-item\"")
    expect(html).toContain("data-status=\"complete\"")
    expect(html).toContain("Senior Full Stack Developer")
    expect(html).toContain("TechCorp Solutions")
    expect(html).toContain("React")
    expect(html).toContain("TypeScript")
  })

  it("renders the button basic fixture", () => {
    const document = parseAgentHtml(fixture("valid", "button-basic.xml"))
    const validation = validateAgentHtml(document)

    expect(validation.ok).toBe(true)

    const html = renderToStaticMarkup(renderAgentHtml(document))
    expect(html).toContain("data-slot=\"button\"")
    expect(html).toContain("data-variant=\"outline\"")
    expect(html).toContain("data-size=\"default\"")
    expect(html).toContain("<a href=\"/docs\"")
    expect(html).toContain("aria-label=\"Open settings\"")
  })

  it("renders the kanban basic fixture", () => {
    const document = parseAgentHtml(fixture("valid", "kanban-basic.xml"))
    const validation = validateAgentHtml(document)

    expect(validation.ok).toBe(true)

    const html = renderToStaticMarkup(renderAgentHtml(document))
    expect(html).toContain("data-slot=\"kanban\"")
    expect(html).toContain("data-slot=\"kanban-column\"")
    expect(html).toContain("data-slot=\"kanban-item\"")
    expect(html).toContain("Todo")
    expect(html).toContain("Audit prompt copy")
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
    expect(html).toContain("data-slot=\"aspect-ratio\"")
    expect(html).toContain("data-slot=\"carousel\"")
    expect(html).toContain("data-slot=\"chart\"")
    expect(html).toContain("data-slot=\"tabs\"")
    expect(html).toContain("data-slot=\"accordion\"")
    expect(html).toContain("data-slot=\"table\"")
    expect(html.split("data-slot=\"card\"").length - 1).toBeGreaterThan(3)
  })

  it("throws for unsupported render tags", () => {
    const document = parseAgentHtml(
      "<Page title=\"Unsupported\"><ChartTooltip hideLabel=\"false\" /></Page>"
    )

    expect(() => renderAgentHtml(document)).toThrow("Unsupported render tag: ChartTooltip")
  })
})


