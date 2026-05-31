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

  it("uses the thread panel window shell for settings", () => {
    expect(settingsContentSource).toContain("<section")
    expect(settingsContentSource).toContain("<header")
    expect(settingsContentSource).toContain("<main")
    expect(settingsContentSource).toContain("ScrollArea")
    expect(settingsContentSource).toContain("Separator")
    expect(settingsContentSource).toContain("SidebarContent")
    expect(settingsContentSource).toContain("SidebarGroup")
    expect(settingsContentSource).toContain("SidebarGroupContent")
    expect(settingsContentSource).toContain("SidebarGroupLabel")
    expect(settingsContentSource).toContain("SidebarMenu")
    expect(settingsContentSource).toContain("SidebarMenuButton")
    expect(settingsContentSource).toContain("SidebarMenuItem")
    expect(settingsContentSource).toContain("SidebarStateProvider")
    expect(settingsContentSource).toContain("onClose?: () => void")
    expect(settingsContentSource).toContain("Close settings")
    expect(settingsContentSource).toContain("SettingsInfoPanel")
    expect(settingsContentSource).not.toContain("PetPanelHeader")
    expect(settingsContentSource).not.toContain("PetPanelBody")
    expect(settingsContentSource).not.toContain("PetPanelFooter")
  })

  it("exposes sidebar navigation for agent configuration views", () => {
    expect(settingsContentSource).toContain('"AGENTS.md",')
    expect(settingsContentSource).toContain('"MCP",')
    expect(settingsContentSource).toContain('"Skills",')
    expect(settingsContentSource).toContain('"Plugins",')
    expect(settingsContentSource).toContain('"Runtime",')
    expect(settingsContentSource).toContain('"Connection",')
    expect(settingsContentSource.indexOf('"AGENTS.md",')).toBeLessThan(
      settingsContentSource.indexOf('"MCP",')
    )
    expect(settingsContentSource.indexOf('"MCP",')).toBeLessThan(
      settingsContentSource.indexOf('"Skills",')
    )
    expect(settingsContentSource.indexOf('"Skills",')).toBeLessThan(
      settingsContentSource.indexOf('"Plugins",')
    )
    expect(settingsContentSource.indexOf('"Plugins",')).toBeLessThan(
      settingsContentSource.indexOf('"Runtime",')
    )
    expect(settingsContentSource.indexOf('"Runtime",')).toBeLessThan(
      settingsContentSource.indexOf('"Connection",')
    )
    expect(settingsContentSource).toContain("type SettingsView")
    expect(settingsContentSource).toContain('initialView = "AGENTS.md"')
    expect(settingsContentSource).toContain("activeView")
    expect(settingsContentSource).toContain("setActiveView(view)")
    expect(settingsContentSource).toContain("SettingsViewContent")
    expect(settingsContentSource).toContain('activeView === "AGENTS.md"')
    expect(settingsContentSource).toContain('activeView === "MCP"')
    expect(settingsContentSource).toContain('activeView === "Skills"')
    expect(settingsContentSource).toContain('activeView === "Plugins"')
    expect(settingsContentSource).toContain('activeView === "Runtime"')
    expect(settingsContentSource).toContain("SettingsViewContent")
    expect(settingsContentSource).toContain("ConnectionView")
    expect(settingsContentSource).toContain("AgentsMdView")
    expect(settingsContentSource).toContain("<McpView")
    expect(settingsContentSource).toContain("<SkillsView")
    expect(settingsContentSource).toContain("<PluginsView")
    expect(settingsContentSource).toContain("<RuntimeView")
    expect(settingsContentSource).toContain("Custom workspace root")
    expect(settingsContentSource).toContain("Test connection")
    expect(settingsContentSource).not.toContain("TabsList")
    expect(settingsContentSource).not.toContain("TabsTrigger")
    expect(settingsContentSource).not.toContain("TabsContent")
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

  it("maps company agent state to dedicated Tauri commands", () => {
    expect(storeSource).toContain('invoke("get_company_agent_state")')
    expect(storeSource).toContain('invoke("update_company_agent_state"')
  })
})
