import { describe, expect, it } from "vitest"

import { formatBlockPrompt } from "./prompt.mjs"

const payload = {
  blockPath: "summary",
  filePath: ".agent-html/artifacts/example.agent.tsx",
  request: "Tighten this summary.",
  selectedSource: '<Block id="summary">Summary</Block>',
  targetStatus: "selected_block",
}

describe("React Canvas prompt bridge", () => {
  it("formats selected block prompts as fenced tsx", () => {
    expect(formatBlockPrompt(payload)).toContain("```tsx")
    expect(formatBlockPrompt(payload)).toContain("blockPath: summary")
    expect(formatBlockPrompt(payload)).toContain("Request:\nTighten this summary.")
  })

  it("omits source fence for missing blocks", () => {
    const prompt = formatBlockPrompt({
      ...payload,
      selectedSource: null,
      targetStatus: "missing_block",
    })

    expect(prompt).toContain("targetStatus: missing_block")
    expect(prompt).not.toContain("```tsx")
  })

  it("uses one formatter for host display and clipboard output", () => {
    const formattedPrompt = formatBlockPrompt(payload)

    expect(formattedPrompt).toBe(formatBlockPrompt(payload))
  })
})
