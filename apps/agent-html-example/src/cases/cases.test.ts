import { describe, expect, it } from "vitest"

import { parseAgentHtml, validateAgentHtml } from "@/agent-html"
import artifactSource from "@example/cases/introduce-agent-html.ahtml?raw"
import artifactSourceZh from "@example/cases/introduce-agent-html-cn.ahtml?raw"

const cases = [
  ["introduce-agent-html", artifactSource],
  ["introduce-agent-html-cn", artifactSourceZh],
] as const

describe("example AgentHTML cases", () => {
  it.each(cases)("keeps %s valid AgentHTML", (_name, source) => {
    const validation = validateAgentHtml(parseAgentHtml(source))

    expect(validation.errors).toEqual([])
    expect(validation.ok).toBe(true)
  })
})
