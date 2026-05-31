import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const promptComposerPath = fileURLToPath(
  new URL("./prompt-composer.tsx", import.meta.url)
)

const promptComposerSource = readFileSync(promptComposerPath, "utf8")

describe("AgentHtmlPromptComposer", () => {
  it("centralizes floating input surface styling", () => {
    expect(promptComposerSource).toContain("AgentHtmlPromptComposerSurface")
    expect(promptComposerSource).toContain('"default" | "floating"')
    expect(promptComposerSource).toContain("bg-background/75")
    expect(promptComposerSource).toContain("shadow-none")
    expect(promptComposerSource).toContain("backdrop-blur-md")
    expect(promptComposerSource).toContain(
      "promptComposerSurfaceClassName[surface]"
    )
  })
})
