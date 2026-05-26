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
})
