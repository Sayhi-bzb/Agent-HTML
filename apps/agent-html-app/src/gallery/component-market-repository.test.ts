import { describe, expect, it } from "vitest"

import type { AgentHtmlTag } from "@/agent-html"
import {
  agentHtmlPromptSchemaArtifactPath,
  buildEnabledAgentHtmlPromptSchema,
  buildGalleryComponentPromptMetrics,
  estimatePromptSchemaTokens,
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

  it("estimates prompt schema token counts from generated text", () => {
    expect(estimatePromptSchemaTokens("abcd")).toEqual({
      characters: 4,
      tokens: 1,
    })
    expect(estimatePromptSchemaTokens("abcde")).toEqual({
      characters: 5,
      tokens: 2,
    })
  })

  it("builds component-level prompt token metrics", () => {
    const metrics = buildGalleryComponentPromptMetrics(
      new Set<AgentHtmlTag>(["Card"]),
      "Chart"
    )

    expect(metrics.current.tokens).toBeGreaterThan(0)
    expect(metrics.componentTokens).toBeGreaterThan(0)
    expect(metrics.withComponent.tokens).toBeGreaterThan(
      metrics.withoutComponent.tokens
    )
  })
})
