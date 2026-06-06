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
  it("parses a minimal valid cell", () => {
    const document = parseAgentHtml(fixture("valid", "minimal-cell.xml"))

    expect(document.root.tag).toBe("Cell")
    expect(document.root.attrs.title).toBe("Minimal")
    expect(document.root.children).toHaveLength(1)
  })

  it("parses the canonical card/tabs/grid fixture", () => {
    const document = parseAgentHtml(fixture("valid", "card-tabs-grid.xml"))

    expect(document.root.tag).toBe("Cell")
    expect(document.root.children[0]).toMatchObject({
      type: "element",
      tag: "Stack",
    })
  })

  it("parses a Cell root with explicit blocks", () => {
    const document = parseAgentHtml(fixture("valid", "cell-blocks.xml"))

    expect(document.root.tag).toBe("Cell")
    expect(document.root.attrs.title).toBe("Cell Blocks")
    expect(document.root.children[0]).toMatchObject({
      type: "element",
      tag: "Stack",
    })
  })

  it("parses the complex dashboard fixture", () => {
    const document = parseAgentHtml(fixture("valid", "complex-dashboard.xml"))

    expect(document.root.tag).toBe("Cell")
    expect(document.root.attrs.title).toBe("Operations Console")
    expect(document.root.children[0]).toMatchObject({
      type: "element",
      tag: "Stack",
    })
  })

  it("parses the text fixture", () => {
    const document = parseAgentHtml(fixture("valid", "text-basic.xml"))
    const rootStack = document.root.children[0]
    const block =
      rootStack.type === "element" ? rootStack.children[0] : undefined
    const stack =
      block.type === "element" ? block.children[0] : undefined

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
    const rootStack = document.root.children[0]
    const block =
      rootStack.type === "element" ? rootStack.children[0] : undefined

    expect(block.type === "element" ? block.children[0] : undefined).toMatchObject({
      type: "element",
      tag: "Section",
    })
  })

  it("parses raw text inside code blocks", () => {
    const document = parseAgentHtml(fixture("valid", "codeblock-basic.xml"))
    const rootStack = document.root.children[0]
    const block =
      rootStack.type === "element" ? rootStack.children[0] : undefined
    const section = block.type === "element" ? block.children[0] : undefined
    const codeBlock =
      section?.type === "element" ? section.children[0] : undefined
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

  it("parses buttons", () => {
    const document = parseAgentHtml(fixture("valid", "button-basic.xml"))
    const rootStack = document.root.children[0]
    const block =
      rootStack.type === "element" ? rootStack.children[0] : undefined
    const section = block.type === "element" ? block.children[0] : undefined
    const cluster =
      section?.type === "element" ? section.children[0] : undefined
    const button =
      cluster?.type === "element" ? cluster.children[1] : undefined

    expect(button).toMatchObject({
      type: "element",
      tag: "Button",
      attrs: { variant: "outline", href: "/docs" },
    })
  })

  it("parses kanban boards", () => {
    const document = parseAgentHtml(fixture("valid", "kanban-basic.xml"))
    const rootStack = document.root.children[0]
    const block =
      rootStack.type === "element" ? rootStack.children[0] : undefined
    const section = block.type === "element" ? block.children[0] : undefined
    const kanban =
      section?.type === "element" ? section.children[0] : undefined
    const firstColumn =
      kanban?.type === "element" ? kanban.children[0] : undefined

    expect(kanban).toMatchObject({
      type: "element",
      tag: "Kanban",
    })
    expect(firstColumn).toMatchObject({
      type: "element",
      tag: "KanbanColumn",
      attrs: { value: "todo", title: "Todo" },
    })
  })

  it("throws on multiple roots", () => {
    expect(() =>
      parseAgentHtml("<Cell title=\"A\" /><Cell title=\"B\" />")
    ).toThrow("Document must contain exactly one root element")
  })

  it("throws on mismatched closing tags", () => {
    expect(() => parseAgentHtml("<Cell title=\"A\"><Stack></Cell>")).toThrow(
      "Mismatched closing tag"
    )
  })
})

