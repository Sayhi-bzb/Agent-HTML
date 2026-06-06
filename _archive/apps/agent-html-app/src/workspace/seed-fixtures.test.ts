import { describe, expect, it } from "vitest"

import introduceAgentHtmlSource from "@/app/workspace/fixtures/introduce-agent-html.ahtml?raw"
import introduceAgentHtmlZhSource from "@/app/workspace/fixtures/introduce-agent-html-cn.ahtml?raw"
import runtimeAlignmentSource from "@/app/workspace/fixtures/runtime-alignment.ahtml?raw"
import { parseAgentHtml, validateAgentHtml } from "@/agent-html"

const seedFixtures = [
  ["introduce-agent-html", introduceAgentHtmlSource],
  ["introduce-agent-html-cn", introduceAgentHtmlZhSource],
  ["runtime-alignment", runtimeAlignmentSource],
] as const

describe("workspace seed fixtures", () => {
  it.each(seedFixtures)("keeps %s valid AgentHTML", (_name, source) => {
    const validation = validateAgentHtml(parseAgentHtml(source))

    expect(validation.errors).toEqual([])
    expect(validation.ok).toBe(true)
  })
})
