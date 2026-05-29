import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const providerSource = readFileSync(
  fileURLToPath(new URL("./block-runtime-provider.tsx", import.meta.url)),
  "utf8"
)

describe("AgentHtmlBlockRuntimeProvider source guardrails", () => {
  it("does not derive block hit-testing coordinates from dnd-kit drag deltas", () => {
    expect(providerSource).not.toContain("getEventPointer")
    expect(providerSource).not.toContain("event.delta")
    expect(providerSource).not.toContain("initialPointerRef")
    expect(providerSource).not.toContain("lastPointerRef")
  })

  it("names drag hit-testing coordinates as browser client pointers", () => {
    expect(providerSource).toContain("AgentHtmlClientPointer")
    expect(providerSource).toContain("lastClientPointerRef")
    expect(providerSource).toContain("updateDragClientPointer")
  })

  it("does not clear hover from wrapper pointerleave during scroll", () => {
    expect(providerSource).toContain("updateHoveredBlockFromPointer")
  })

  it("keeps block input popover positioning outside the provider", () => {
    expect(providerSource).not.toContain("@floating-ui/react")
    expect(providerSource).not.toContain("AgentHtmlBlockInputGroup")
    expect(providerSource).toContain("useAgentHtmlBlockInputPopover")
  })

  it("keeps block registry maps outside the provider", () => {
    expect(providerSource).not.toContain("new Map<string, HTMLElement>()")
    expect(providerSource).not.toContain(
      "new Map<string, AgentHtmlInteractionUnit>()"
    )
    expect(providerSource).toContain("useAgentHtmlBlockRegistry")
  })

  it("keeps block layout animation outside the provider", () => {
    expect(providerSource).not.toContain("pendingLayoutSnapshotRef")
    expect(providerSource).not.toContain("getAgentHtmlBlockLayoutTransitions")
    expect(providerSource).toContain("useAgentHtmlBlockLayoutAnimation")
  })

  it("keeps block overlay presentation outside the provider", () => {
    expect(providerSource).not.toContain(
      "data-agent-html-block-landing-overlay"
    )
    expect(providerSource).not.toContain(
      "data-agent-html-block-input-popover"
    )
    expect(providerSource).not.toContain("data-agent-html-block-drag-overlay")
    expect(providerSource).toContain("AgentHtmlBlockDragOverlay")
  })
})
