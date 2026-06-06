import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const blockInputGroupPath = fileURLToPath(
  new URL("./block-input-group.tsx", import.meta.url)
)
const blockInputPopoverPath = fileURLToPath(
  new URL("./block-input-popover.tsx", import.meta.url)
)

const blockInputGroupSource = readFileSync(blockInputGroupPath, "utf8")
const blockInputPopoverSource = readFileSync(blockInputPopoverPath, "utf8")

describe("AgentHtmlBlockInputGroup", () => {
  it("uses the shared floating prompt composer surface", () => {
    expect(blockInputGroupSource).toContain(
      "type AgentHtmlPromptComposerSurface"
    )
    expect(blockInputGroupSource).toContain(
      "surface?: AgentHtmlPromptComposerSurface"
    )
    expect(blockInputGroupSource).toContain("surface={surface}")
    expect(blockInputPopoverSource).toContain('surface="floating"')
    expect(blockInputPopoverSource).not.toContain("bg-background/80")
  })
})
