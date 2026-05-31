import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const appFramePath = fileURLToPath(
  new URL("../../shell/app-frame.tsx", import.meta.url)
)
const mainPath = fileURLToPath(new URL("../../main.tsx", import.meta.url))
const hostPath = fileURLToPath(new URL("./workspace-pet-host.tsx", import.meta.url))
const hostSessionPath = fileURLToPath(
  new URL("./workspace-pet-host-session.tsx", import.meta.url)
)
const composerPath = fileURLToPath(
  new URL("./pet-message-composer.tsx", import.meta.url)
)
const surfacePath = fileURLToPath(
  new URL("../../workspace/surface.tsx", import.meta.url)
)

const appFrameSource = readFileSync(appFramePath, "utf8")
const composerSource = readFileSync(composerPath, "utf8")
const mainSource = readFileSync(mainPath, "utf8")
const hostSource = readFileSync(hostPath, "utf8")
const hostSessionSource = readFileSync(hostSessionPath, "utf8")
const surfaceSource = readFileSync(surfacePath, "utf8")

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
    expect(hostSource).toContain("React.lazy")
    expect(hostSource).toContain("workspace-pet-host-session")
    expect(hostSessionSource).toContain("WorkspaceGhostPet")
    expect(hostSessionSource).toContain("PetMessageComposer")
    expect(hostSessionSource).toContain("PetSettingsContent")
    expect(hostSessionSource).toContain("settingsContent")
    expect(hostSessionSource).toContain("threadPickerContent")
    expect(hostSessionSource).toContain("transcriptContent")
    expect(hostSessionSource).toContain("onPromptSubmit")
    expect(hostSessionSource).toContain("onInterruptTurn")
    expect(hostSource).not.toContain("WebviewWindow")
    expect(hostSource).not.toContain("emitTo")
    expect(hostSource).not.toContain("codex_host_stop")
    expect(hostSessionSource).not.toContain("WebviewWindow")
    expect(hostSessionSource).not.toContain("emitTo")
    expect(hostSessionSource).not.toContain("codex_host_stop")
  })

  it("treats pet message send as a floating interaction", () => {
    expect(hostSessionSource).toContain("onSent={() => setIsMessageOpen(false)}")
    expect(hostSessionSource).toContain('surface="floating"')
    expect(hostSessionSource).not.toContain(
      "bg-background/80 shadow-none backdrop-blur-sm"
    )
    expect(composerSource).toContain("className?: string")
    expect(composerSource).toContain("className={cn(className)}")
    expect(composerSource).toContain("surface?: AgentHtmlPromptComposerSurface")
    expect(composerSource).toContain("surface={surface}")
    expect(composerSource).toContain('onDraftChange("")')
    expect(composerSource).toContain("onPromptSubmit?.({")
    expect(composerSource).toContain("prompt,")
    expect(composerSource).not.toContain("target:")
  })

  it("shares the pet message composer with the transcript footer", () => {
    expect(surfaceSource).toContain("messageDraft")
    expect(surfaceSource).toContain("setMessageDraft")
    expect(surfaceSource).toContain("transcriptComposer")
    expect(surfaceSource).toContain("composer={transcriptComposer}")
    expect(surfaceSource).toContain('surface="floating"')
    expect(surfaceSource).not.toContain(
      "bg-background/80 shadow-none backdrop-blur-sm"
    )
    expect(surfaceSource).toContain("onMessageDraftChange: setMessageDraft")
    expect(hostSessionSource).toContain("draft={snapshot.messageDraft}")
    expect(hostSessionSource).toContain(
      "onDraftChange={snapshot.onMessageDraftChange}"
    )
  })

  it("passes transcript close behavior through the pet host", () => {
    expect(surfaceSource).toContain("renderTranscriptContent")
    expect(surfaceSource).toContain("onClose={onClose}")
    expect(hostSessionSource).toContain("snapshot.renderTranscriptContent?.({")
    expect(hostSessionSource).toContain("onClose: () => setIsTranscriptOpen(false)")
    expect(surfaceSource).not.toContain("isTranscriptPinned")
    expect(surfaceSource).not.toContain("setIsTranscriptPinned")
    expect(surfaceSource).not.toContain("onPinnedChange")
    expect(hostSessionSource).not.toContain("isTranscriptPinned")
  })
})
