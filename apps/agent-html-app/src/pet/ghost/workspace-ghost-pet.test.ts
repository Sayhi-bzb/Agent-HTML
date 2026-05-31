import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const petPath = fileURLToPath(
  new URL("./workspace-ghost-pet.tsx", import.meta.url)
)
const petSource = readFileSync(petPath, "utf8")

describe("WorkspaceGhostPet status placement", () => {
  it("does not show idle fallback text", () => {
    expect(petSource).not.toContain("watching this canvas")
    expect(petSource).not.toContain("waiting for input")
    expect(petSource).not.toContain("something needs attention")
    expect(petSource).not.toContain("ready for review")
  })

  it("keeps the upper bubble area scoped to speech bubbles and approvals", () => {
    expect(petSource).toContain("PetApprovalCard")
    expect(petSource).toContain("speechBubbles.map")
    expect(petSource).not.toContain("getPresenceMessage")
  })

  it("renders status messages near the lower action area", () => {
    expect(petSource).toContain("const statusMessage = presence.message?.text")
    expect(petSource).toContain("top-full")
    expect(petSource).toContain("{statusMessage}")
    expect(petSource).toContain("{presence.action.label}")
  })

  it("does not make the transcript popover globally draggable or unselectable", () => {
    expect(petSource).toContain('className="pointer-events-auto w-auto p-0"')
    expect(petSource).not.toContain(
      '"pointer-events-auto w-auto p-0 select-none",\n              isTranscriptDragging ? "cursor-grabbing" : "cursor-grab"'
    )
  })
})
