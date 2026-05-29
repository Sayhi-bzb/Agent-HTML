import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const appFramePath = fileURLToPath(
  new URL("../../shell/app-frame.tsx", import.meta.url)
)
const mainPath = fileURLToPath(new URL("../../main.tsx", import.meta.url))
const hostPath = fileURLToPath(new URL("./workspace-pet-host.tsx", import.meta.url))

const appFrameSource = readFileSync(appFramePath, "utf8")
const mainSource = readFileSync(mainPath, "utf8")
const hostSource = readFileSync(hostPath, "utf8")

describe("pet host contract", () => {
  it("keeps pet mounted inside the app frame", () => {
    expect(appFrameSource).toContain("WorkspacePetHost")
    expect(appFrameSource).toContain("<WorkspacePetHost />")
    expect(appFrameSource).not.toContain("WorkspacePetBridge")
  })

  it("does not route pet through native windows", () => {
    expect(mainSource).not.toContain("PetWindowApp")
    expect(mainSource).not.toContain("PetPanelWindowApp")
    expect(mainSource).not.toContain('get("window") === "pet"')
    expect(mainSource).not.toContain('get("window") === "pet-panel"')
  })

  it("keeps app-hosted pet UI and actions in the host", () => {
    expect(hostSource).toContain("WorkspaceGhostPet")
    expect(hostSource).toContain("AgentHtmlPromptComposer")
    expect(hostSource).toContain("threadPickerContent")
    expect(hostSource).toContain("onPromptSubmit")
    expect(hostSource).not.toContain("WebviewWindow")
    expect(hostSource).not.toContain("emitTo")
  })
})
