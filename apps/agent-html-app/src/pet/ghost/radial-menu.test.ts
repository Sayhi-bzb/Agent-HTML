import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const radialMenuPath = fileURLToPath(
  new URL("./radial-menu.tsx", import.meta.url)
)
const ghostPetPath = fileURLToPath(
  new URL("./workspace-ghost-pet.tsx", import.meta.url)
)

const radialMenuSource = readFileSync(radialMenuPath, "utf8")
const ghostPetSource = readFileSync(ghostPetPath, "utf8")

describe("ghost radial menu", () => {
  it("exposes an interrupt action", () => {
    expect(radialMenuSource).toContain("SquareIcon")
    expect(radialMenuSource).toContain('id: "interrupt"')
    expect(radialMenuSource).toContain('label: "Interrupt"')
    expect(radialMenuSource).toContain("canInterrupt")
  })

  it("exposes a settings action", () => {
    expect(radialMenuSource).toContain("SettingsIcon")
    expect(radialMenuSource).toContain('id: "settings"')
    expect(radialMenuSource).toContain('label: "Settings"')
  })

  it("exposes a transcript action", () => {
    expect(radialMenuSource).toContain("ActivityIcon")
    expect(radialMenuSource).toContain('id: "transcript"')
    expect(radialMenuSource).toContain('label: "Transcript"')
  })

  it("routes thread and transcript selections to the unified thread panel", () => {
    expect(ghostPetSource).toContain('if (item === "interrupt")')
    expect(ghostPetSource).toContain("onInterruptTurn?.()")
    expect(ghostPetSource).toContain('if (item === "settings")')
    expect(ghostPetSource).toContain("onSettingsOpenChange?.(true)")
    expect(ghostPetSource).toContain("settingsContent")
    expect(ghostPetSource).toContain('if (item === "threads")')
    expect(ghostPetSource).toContain('if (item === "transcript")')
    expect(ghostPetSource).toContain("onThreadPanelOpenChange?.(true)")
    expect(ghostPetSource).toContain("threadPanelContent")
    expect(ghostPetSource).not.toContain("onTranscriptOpenChange?.(true)")
    expect(ghostPetSource).not.toContain("transcriptContent")
  })

  it("maps pet cursor actions to stable commands", () => {
    const doubleClickHandler = ghostPetSource.slice(
      ghostPetSource.indexOf("const handleDoubleClick"),
      ghostPetSource.indexOf("const handleMenuSelect")
    )

    expect(doubleClickHandler).toContain("onMessageOpenChange?.(true)")
    expect(doubleClickHandler).toContain("setIsMenuOpen(false)")
    expect(doubleClickHandler).not.toContain("setIsMenuOpen((current) => !current)")
    expect(radialMenuSource).toContain('data-cursor=')
    expect(radialMenuSource).toContain("cursor-not-allowed")
  })

  it("keeps drag motion on animation frames instead of pointermove renders", () => {
    expect(ghostPetSource).toContain("requestAnimationFrame")
    expect(ghostPetSource).toContain("pendingPositionRef")
    expect(ghostPetSource).toContain("positionRef.current")
    expect(ghostPetSource).toContain("getGhostTransform")
    expect(ghostPetSource).toContain("pendingThreadPanelOffsetRef")
    expect(ghostPetSource).toContain("pendingSettingsOffsetRef")
  })
})
