import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const settingsContentPath = fileURLToPath(
  new URL("./pet-settings-content.tsx", import.meta.url)
)
const storePath = fileURLToPath(
  new URL("../../workspace/store.ts", import.meta.url)
)

const settingsContentSource = readFileSync(settingsContentPath, "utf8")
const storeSource = readFileSync(storePath, "utf8")

describe("pet settings content", () => {
  it("loads and saves root AGENTS.md through the workspace store", () => {
    expect(settingsContentSource).toContain("getRootAgentsInstructions")
    expect(settingsContentSource).toContain("updateRootAgentsInstructions")
    expect(settingsContentSource).toContain("AgentHTML/AGENTS.md")
  })

  it("uses formal popover and settings surface structure", () => {
    expect(settingsContentSource).toContain("PopoverHeader")
    expect(settingsContentSource).toContain("PopoverTitle")
    expect(settingsContentSource).toContain("PopoverDescription")
    expect(settingsContentSource).toContain("SettingsInfoPanel")
  })

  it("exposes header tabs for agent configuration views", () => {
    for (const label of [
      "Instructions",
      "Skills",
      "MCP",
      "Plugins",
      "Runtime",
    ]) {
      expect(settingsContentSource).toContain(`"${label}"`)
    }
    expect(settingsContentSource).toContain('role="tablist"')
    expect(settingsContentSource).toContain('role="tab"')
  })

  it("surfaces Codex app-server capabilities without owning config writes", () => {
    expect(settingsContentSource).toContain("useCodexConnection")
    expect(settingsContentSource).toContain("refreshRuntimeStatus")
    expect(settingsContentSource).toContain("CapabilityItemList")
    expect(settingsContentSource).toContain("No items reported")
    expect(settingsContentSource).toContain(".items")
    expect(settingsContentSource).toContain("item.source")
    expect(settingsContentSource).toContain('runtimeStatus.status === "loading"')
    expect(settingsContentSource).toContain("Not loaded")
    expect(settingsContentSource).toContain("Loading...")
    expect(settingsContentSource).toContain("mcpServers")
    expect(settingsContentSource).toContain("skills")
    expect(settingsContentSource).toContain("plugins")
    expect(settingsContentSource).toContain("apps")
    expect(settingsContentSource).toContain("~/.codex/config.toml")
  })

  it("maps root AGENTS.md store calls to dedicated Tauri commands", () => {
    expect(storeSource).toContain('invoke("get_root_agents_instructions")')
    expect(storeSource).toContain('invoke("update_root_agents_instructions"')
  })
})
