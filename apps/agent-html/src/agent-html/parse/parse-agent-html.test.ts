/// <reference types="node" />

import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

import { parseAgentHtml } from "@/agent-html/parse/parse-agent-html"

function fixture(...parts: string[]) {
  return readFileSync(
    new URL(`../fixtures/${parts.join("/")}`, import.meta.url),
    "utf8"
  )
}

describe("parseAgentHtml", () => {
  it("parses a minimal valid page", () => {
    const document = parseAgentHtml(fixture("valid", "minimal-page.xml"))

    expect(document.root.tag).toBe("Page")
    expect(document.root.attrs.title).toBe("Minimal")
    expect(document.root.children).toHaveLength(1)
  })

  it("parses the canonical card/tabs/grid fixture", () => {
    const document = parseAgentHtml(fixture("valid", "card-tabs-grid.xml"))

    expect(document.root.tag).toBe("Page")
    expect(document.root.children[0]).toMatchObject({
      type: "element",
      tag: "Stack",
    })
  })

  it("parses the complex dashboard fixture", () => {
    const document = parseAgentHtml(fixture("valid", "complex-dashboard.xml"))

    expect(document.root.tag).toBe("Page")
    expect(document.root.attrs.title).toBe("Operations Console")
    expect(document.root.children[0]).toMatchObject({
      type: "element",
      tag: "Stack",
    })
  })

  it("parses the text fixture", () => {
    const document = parseAgentHtml(fixture("valid", "text-basic.xml"))
    const stack = document.root.children[0]

    expect(stack).toMatchObject({
      type: "element",
      tag: "Stack",
    })
    expect(stack.type === "element" ? stack.children[0] : undefined).toMatchObject({
      type: "element",
      tag: "Text",
      attrs: { variant: "h2" },
    })
  })

  it("parses the section fixture", () => {
    const document = parseAgentHtml(fixture("valid", "section-width.xml"))

    expect(document.root.children[0]).toMatchObject({
      type: "element",
      tag: "Section",
    })
  })

  it("parses raw text inside code blocks", () => {
    const document = parseAgentHtml(fixture("valid", "codeblock-basic.xml"))
    const section = document.root.children[0]
    const codeBlock =
      section.type === "element" ? section.children[0] : undefined
    const code =
      codeBlock?.type === "element" ? codeBlock.children[0] : undefined

    expect(codeBlock).toMatchObject({
      type: "element",
      tag: "CodeBlock",
      attrs: { language: "tsx", title: "Example.tsx" },
    })
    expect(code).toMatchObject({
      type: "text",
    })
    expect(code?.type === "text" ? code.value : "").toContain(
      "return <div>Hello</div>"
    )
  })

  it("throws on multiple roots", () => {
    expect(() =>
      parseAgentHtml("<Page title=\"A\" /><Page title=\"B\" />")
    ).toThrow("Document must contain exactly one root element")
  })

  it("throws on mismatched closing tags", () => {
    expect(() => parseAgentHtml("<Page title=\"A\"><Stack></Page>")).toThrow(
      "Mismatched closing tag"
    )
  })
})

