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

  it("lets the message input own its floating surface", () => {
    expect(petSource).toContain(
      'className="pointer-events-auto w-90 border-0 bg-transparent p-0 shadow-none"'
    )
  })

  it("delegates the thread panel surface to an app window host", () => {
    expect(petSource).toContain("onThreadPanelOpenChange?.(true)")
    expect(petSource).not.toContain("isThreadPanelOpen")
    expect(petSource).not.toContain("threadPanelContent")
    expect(petSource).not.toContain("isThreadPanelDragging")
    expect(petSource).not.toContain("pendingThreadPanelOffsetRef")
    expect(petSource).not.toContain("isThreadPickerOpen")
    expect(petSource).not.toContain("isTranscriptOpen")
  })

  it("does not close the thread panel from the pet popover lifecycle", () => {
    expect(petSource).not.toContain("isTranscriptPinned")
    expect(petSource).not.toContain("onThreadPanelOpenChange?.(false)")
    expect(petSource).not.toContain("handleThreadPanelOpenChange")
  })
})
