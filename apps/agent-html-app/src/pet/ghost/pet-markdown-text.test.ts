import { describe, expect, it } from "vitest"

import { parsePetMarkdown } from "@/app/pet/ghost/pet-markdown-text"

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
        type: "code-block",
      },
    ])
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
