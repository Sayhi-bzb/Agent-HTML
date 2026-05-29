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
  it("exposes a settings action", () => {
    expect(radialMenuSource).toContain("SettingsIcon")
    expect(radialMenuSource).toContain('id: "settings"')
    expect(radialMenuSource).toContain('label: "Settings"')
  })

  it("routes settings selection to the settings popover", () => {
    expect(ghostPetSource).toContain('if (item === "settings")')
    expect(ghostPetSource).toContain("onSettingsOpenChange?.(true)")
    expect(ghostPetSource).toContain("settingsContent")
  })
})
