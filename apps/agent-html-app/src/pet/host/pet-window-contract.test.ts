import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const eventsPath = fileURLToPath(
  new URL("./pet-window-events.ts", import.meta.url)
)
const appPath = fileURLToPath(new URL("./pet-window-app.tsx", import.meta.url))
const windowPath = fileURLToPath(new URL("./pet-window.ts", import.meta.url))
const mainPath = fileURLToPath(new URL("../../main.tsx", import.meta.url))
const bridgePath = fileURLToPath(
  new URL("./workspace-pet-bridge.tsx", import.meta.url)
)

const eventsSource = readFileSync(eventsPath, "utf8")
const appSource = readFileSync(appPath, "utf8")
const windowSource = readFileSync(windowPath, "utf8")
const mainSource = readFileSync(mainPath, "utf8")
const bridgeSource = readFileSync(bridgePath, "utf8")
const petWindowAppSource = appSource.slice(
  appSource.indexOf("export function PetWindowApp()"),
  appSource.indexOf("export function PetPanelWindowApp()")
)

describe("pet window contract", () => {
  it("keeps native window state serializable and free of React UI ownership", () => {
    expect(eventsSource).not.toContain("React.ReactNode")
    expect(eventsSource).not.toContain("AgentHtmlPromptComposer")
    expect(eventsSource).not.toContain("onPromptSubmit")
    expect(eventsSource).not.toContain("onResumeThread")
    expect(eventsSource).toContain("type PetWindowState")
    expect(eventsSource).toContain("ProjectThreadPickerItem[]")
  })

  it("keeps the cross-window command surface explicit", () => {
    expect(eventsSource).toContain('type: "open-panel"')
    expect(eventsSource).toContain('type: "close-panel"')
    expect(eventsSource).toContain('type: "send-prompt"')
    expect(eventsSource).toContain('type: "new-thread"')
    expect(eventsSource).toContain('type: "resume-thread"')
    expect(eventsSource).toContain('type: "rename-thread"')
    expect(eventsSource).toContain(
      'export const PET_WINDOW_COMMAND_EVENT = "agent-html:pet-command"'
    )
    expect(eventsSource).toContain(
      'export const PET_WINDOW_READY_EVENT = "agent-html:pet-ready"'
    )
    expect(eventsSource).toContain(
      'export const PET_WINDOW_STATE_EVENT = "agent-html:pet-state"'
    )
    expect(eventsSource).toContain(
      'export const PET_PANEL_STATE_EVENT = "agent-html:pet-panel-state"'
    )
    expect(eventsSource).toContain("type PetPanelState")
  })

  it("keeps the native pet route inert outside Tauri", () => {
    const effectGuardIndex = appSource.indexOf("if (!isTauri())")
    const eventImportIndex = appSource.indexOf(
      'await import("@tauri-apps/api/event")'
    )
    const windowImportIndex = appSource.indexOf(
      'await import("@tauri-apps/api/window")'
    )

    expect(effectGuardIndex).toBeGreaterThan(-1)
    expect(eventImportIndex).toBeGreaterThan(effectGuardIndex)
    expect(windowImportIndex).toBeGreaterThan(effectGuardIndex)
  })

  it("keeps Codex and workspace mutations owned by the main window bridge", () => {
    expect(bridgeSource).toContain('event.payload.type === "open-panel"')
    expect(bridgeSource).toContain('event.payload.type === "close-panel"')
    expect(bridgeSource).toContain('event.payload.type === "send-prompt"')
    expect(bridgeSource).toContain('event.payload.type === "new-thread"')
    expect(bridgeSource).toContain('event.payload.type === "resume-thread"')
    expect(bridgeSource).toContain('event.payload.type === "rename-thread"')
    expect(appSource).not.toContain("useWorkspaceAgentController")
    expect(appSource).not.toContain("useWorkspaceThreadController")
    expect(appSource).not.toContain("CodexConnectionProvider")
  })

  it("keeps native pet presentation stable instead of resizing the window", () => {
    expect(appSource).not.toContain("resizeCurrentPetWindow")
    expect(windowSource).not.toContain("resizeCurrentPetWindow")
    expect(windowSource).not.toContain("setSize")
    expect(windowSource).not.toContain("LogicalSize")
    expect(windowSource).toContain("LogicalPosition")
    expect(windowSource).toContain("setPosition")
    expect(windowSource).toContain("height: 220")
    expect(windowSource).toContain("width: 320")
    expect(windowSource).not.toContain("height: 560")
    expect(windowSource).not.toContain("width: 520")
  })

  it("keeps native pet actions behind the shared radial menu", () => {
    expect(petWindowAppSource).toContain("GhostRadialMenu")
    expect(petWindowAppSource).toContain("onContextMenu")
    expect(petWindowAppSource).toContain("onDoubleClick")
    expect(petWindowAppSource).toContain('type: "open-panel"')
    expect(petWindowAppSource).not.toContain("AgentHtmlPromptComposer")
    expect(petWindowAppSource).not.toContain("PetWindowThreadPicker")
    expect(petWindowAppSource).not.toContain("translate-x-16")
    expect(petWindowAppSource).not.toContain("-translate-y-22")
    expect(petWindowAppSource).not.toContain('aria-label="Message"')
  })

  it("keeps message and thread panels in a separate native window route", () => {
    expect(eventsSource).toContain('export const PET_PANEL_WINDOW_LABEL = "pet-panel"')
    expect(windowSource).toContain("ensurePetPanelWindow")
    expect(windowSource).toContain('url: "/?window=pet-panel"')
    expect(windowSource).toContain("visible: false")
    expect(mainSource).toContain('get("window") === "pet-panel"')
    expect(mainSource).toContain("<PetPanelWindowApp />")
    expect(bridgeSource).toContain("syncPetPanelWindow")
    expect(bridgeSource).toContain("panelWindow.show()")
    expect(bridgeSource).toContain("panelWindow.hide()")
  })
})
