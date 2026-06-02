/// <reference types="node" />

import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { parseAgentHtml } from "@/agent-html/parse/parse-agent-html"
import { serializeAgentHtml } from "@/agent-html/ast/serialize-agent-html"
import { validateAgentHtml } from "@/agent-html/validate/validate-agent-html"

function fixture(...parts: string[]) {
  return readFileSync(
    new URL(`../fixtures/${parts.join("/")}`, import.meta.url),
    "utf8"
  )
}

describe("serializeAgentHtml", () => {
  it.each([
    "minimal-cell.xml",
    "cell-blocks.xml",
    "card-tabs-grid.xml",
    "complex-dashboard.xml",
    "codeblock-basic.xml",
  ])("roundtrips valid fixture %s", (name) => {
    const document = parseAgentHtml(fixture("valid", name))
    const serialized = serializeAgentHtml(document)
    const reparsed = parseAgentHtml(serialized)

    expect(validateAgentHtml(reparsed)).toMatchObject({ ok: true })
  })
})
