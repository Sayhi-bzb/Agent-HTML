import { describe, expect, it } from "vitest"

import type { AgentHtmlTag } from "@/agent-html"
import {
  agentHtmlPromptSchemaArtifactPath,
  buildEnabledAgentHtmlPromptSchema,
} from "@/app/gallery/component-market-repository"

describe("component market repository", () => {
  it("builds an enabled prompt schema artifact", () => {
    const schema = buildEnabledAgentHtmlPromptSchema(
      new Set<AgentHtmlTag>(["Card", "Chart"])
    )

    expect(schema).toContain("# Gallery Preview DSL")
    expect(schema).toContain(
      "- `Card:size?=\"default|sm\" -> CardHeader?, CardContent?, CardFooter?`"
    )
    expect(schema).toContain(
      "- `ChartRow:label=string, [series key]=number -> none`"
    )
    expect(schema).not.toContain("- `Tabs:")
    expect(schema).not.toContain("- `Button:")
  })

  it("keeps the schema artifact path stable for Codex actions", () => {
    expect(agentHtmlPromptSchemaArtifactPath).toBe(
      ".tmp/agent-html-prompt-schema.md"
    )
  })
})
