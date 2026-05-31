import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { parsePetMarkdown } from "@/app/pet/ghost/pet-markdown-text"

const markdownTextPath = fileURLToPath(
  new URL("./pet-markdown-text.tsx", import.meta.url)
)
const markdownTextSource = readFileSync(markdownTextPath, "utf8")

describe("parsePetMarkdown", () => {
  it("keeps plain text and line breaks in paragraphs", () => {
    expect(parsePetMarkdown("Hello\nworld")).toEqual([
      {
        children: [{ text: "Hello\nworld", type: "text" }],
        type: "paragraph",
      },
    ])
  })

  it("parses bold and inline code", () => {
    expect(parsePetMarkdown("Use **bold** and `code`.")).toEqual([
      {
        children: [
          { text: "Use ", type: "text" },
          { text: "bold", type: "strong" },
          { text: " and ", type: "text" },
          { text: "code", type: "code" },
          { text: ".", type: "text" },
        ],
        type: "paragraph",
      },
    ])
  })

  it("parses unordered and ordered lists", () => {
    expect(parsePetMarkdown("- first\n- **second**\n\n1. one\n2. two")).toEqual([
      {
        items: [
          [{ text: "first", type: "text" }],
          [{ text: "second", type: "strong" }],
        ],
        type: "unordered-list",
      },
      {
        items: [
          [{ text: "one", type: "text" }],
          [{ text: "two", type: "text" }],
        ],
        type: "ordered-list",
      },
    ])
  })

  it("parses fenced code blocks", () => {
    expect(parsePetMarkdown("```ts\nconst value = 1\n```")).toEqual([
      {
        text: "const value = 1",
        title: "ts",
        type: "code-block",
      },
    ])
  })

  it("uses Code as the empty fenced code block title", () => {
    expect(parsePetMarkdown("```\nconst value = 1\n```")).toEqual([
      {
        text: "const value = 1",
        title: "Code",
        type: "code-block",
      },
    ])
  })

  it("renders fenced code blocks as default-collapsed blocks", () => {
    expect(markdownTextSource).toContain("@/app/shared/ui/accordion")
    expect(markdownTextSource).not.toContain("@/app/shared/ui/scroll-area")
    expect(markdownTextSource).toContain("AccordionTrigger")
    expect(markdownTextSource).toContain("AccordionContent")
    expect(markdownTextSource).not.toContain("ScrollArea")
    expect(markdownTextSource).not.toContain("ScrollBar")
    expect(markdownTextSource).toContain("collapsible")
    expect(markdownTextSource).toContain('type="single"')
    expect(markdownTextSource).not.toContain('orientation="horizontal"')
    expect(markdownTextSource).toContain("block.title")
    expect(markdownTextSource).toContain("text-foreground")
    expect(markdownTextSource).toContain("min-w-0 w-full max-w-full")
    expect(markdownTextSource).toContain("min-w-0 truncate")
    expect(markdownTextSource).toContain(
      '<div className="min-w-0 w-full max-w-full overflow-x-auto rounded-md bg-muted/70">'
    )
    expect(markdownTextSource).toContain(
      '<pre className="w-max min-w-0 px-2 py-1 pb-3 text-left font-mono text-[10px] leading-4 whitespace-pre text-foreground">'
    )
    expect(markdownTextSource).toContain("overflow-x-auto")
    expect(markdownTextSource).not.toContain("min-w-max")
    expect(markdownTextSource).not.toContain(
      '<pre className="min-w-0 w-full max-w-full overflow-x-auto rounded-md bg-muted/70 px-2 py-1 text-left font-mono text-[10px] leading-4 whitespace-pre-wrap text-foreground">'
    )
    expect(markdownTextSource).not.toContain("@/app/shared/ui/collapsible")
    expect(markdownTextSource).not.toContain("CollapsibleTrigger")
    expect(markdownTextSource).not.toContain("CollapsibleContent")
    expect(markdownTextSource).not.toContain("Code block -")
    expect(markdownTextSource).not.toContain("defaultOpen")
  })

  it("renders markdown links as label text only", () => {
    expect(
      parsePetMarkdown(
        "see [surface.tsx](D:/codes/Agent-HTML/apps/agent-html-app/src/workspace/surface.tsx) now"
      )
    ).toEqual([
      {
        children: [{ text: "see surface.tsx now", type: "text" }],
        type: "paragraph",
      },
    ])
  })

  it("keeps malformed markdown links as text", () => {
    expect(parsePetMarkdown("see [surface.tsx](D:/codes/surface.tsx")).toEqual([
      {
        children: [{ text: "see [surface.tsx](D:/codes/surface.tsx", type: "text" }],
        type: "paragraph",
      },
    ])
  })

  it("keeps markdown html as text", () => {
    expect(parsePetMarkdown("<script>alert(1)</script>")).toEqual([
      {
        children: [{ text: "<script>alert(1)</script>", type: "text" }],
        type: "paragraph",
      },
    ])
  })
})
