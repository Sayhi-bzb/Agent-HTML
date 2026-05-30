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

  it("routes settings selection to the settings popover", () => {
    expect(ghostPetSource).toContain('if (item === "interrupt")')
    expect(ghostPetSource).toContain("onInterruptTurn?.()")
    expect(ghostPetSource).toContain('if (item === "settings")')
    expect(ghostPetSource).toContain("onSettingsOpenChange?.(true)")
    expect(ghostPetSource).toContain("settingsContent")
    expect(ghostPetSource).toContain('if (item === "transcript")')
    expect(ghostPetSource).toContain("onTranscriptOpenChange?.(true)")
    expect(ghostPetSource).toContain("transcriptContent")
  })

  it("keeps drag motion on animation frames instead of pointermove renders", () => {
    expect(ghostPetSource).toContain("requestAnimationFrame")
    expect(ghostPetSource).toContain("pendingPositionRef")
    expect(ghostPetSource).toContain("positionRef.current")
    expect(ghostPetSource).toContain("getGhostTransform")
    expect(ghostPetSource).toContain("pendingThreadPickerOffsetRef")
    expect(ghostPetSource).toContain("pendingSettingsOffsetRef")
  })
})
