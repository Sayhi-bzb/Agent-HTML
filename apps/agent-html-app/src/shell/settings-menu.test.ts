import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const settingsMenuPath = fileURLToPath(
  new URL("./settings-menu.tsx", import.meta.url)
)
const settingsMenuSource = readFileSync(settingsMenuPath, "utf8")

describe("settings menu", () => {
  it("keeps the footer settings label and opens shared connection settings window", () => {
    expect(settingsMenuSource).toContain("<Trans>Settings</Trans>")
    expect(settingsMenuSource).toContain("<Trans>Codex Connection</Trans>")
    expect(settingsMenuSource).toContain("usePetSettingsWindow")
    expect(settingsMenuSource).toContain('petSettingsWindow.open("Connection")')
    expect(settingsMenuSource).not.toContain("PetSettingsContent")
    expect(settingsMenuSource).not.toContain("DialogContent")
    expect(settingsMenuSource).not.toContain("<Trans>Agent Settings</Trans>")
  })
})
