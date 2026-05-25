import { describe, expect, it } from "vitest"

import {
  getAgentHtmlElementByPath,
  walkAgentHtmlElementPaths,
} from "@/agent-html/ast/paths"
import { serializeAgentHtmlNode } from "@/agent-html/ast/serialize"
import { parseAgentHtml } from "@/agent-html/parse/parse-agent-html"

describe("agent-html AST helpers", () => {
  it("finds elements by generated path", () => {
    const document = parseAgentHtml(
      `<Page title="Demo"><Section><Stack><Text variant="h2">Title</Text></Stack></Section></Page>`
    )
    const paths: string[] = []

    walkAgentHtmlElementPaths(document.root, (_node, path) => {
      paths.push(path)
    })

    const textPath = paths.find((path) => path.endsWith("/Text[0]"))
    expect(textPath).toBeDefined()
    expect(getAgentHtmlElementByPath(document.root, textPath ?? "")).toMatchObject({
      tag: "Text",
    })
  })

  it("serializes an element subtree as ahtml", () => {
    const document = parseAgentHtml(
      `<Page title="Demo"><Section><Stack><Text variant="h2">Title</Text><Alert><AlertTitle>Heads up</AlertTitle></Alert></Stack></Section></Page>`
    )
    const stack = getAgentHtmlElementByPath(
      document.root,
      "/Page/Section[0]/Stack[0]"
    )

    expect(stack).not.toBeNull()
    expect(stack ? serializeAgentHtmlNode(stack) : "").toContain(
      `<Text variant="h2">Title</Text>`
    )
    expect(stack ? serializeAgentHtmlNode(stack) : "").toContain(
      `<AlertTitle>Heads up</AlertTitle>`
    )
  })
})
