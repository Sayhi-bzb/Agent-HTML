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
const threadPanelPath = fileURLToPath(
  new URL("./pet-thread-panel-content.tsx", import.meta.url)
)
const threadPanelWindowHostPath = fileURLToPath(
  new URL("./thread-panel-app-window-host.tsx", import.meta.url)
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
const threadPanelSource = readFileSync(threadPanelPath, "utf8")
const threadPanelWindowHostSource = readFileSync(
  threadPanelWindowHostPath,
  "utf8"
)
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
    expect(hostSessionSource).toContain(
      "onClose={() => setIsSettingsOpen(false)}"
    )
    expect(hostSessionSource).toContain("threadPanelContent")
    expect(hostSessionSource).toContain("PetThreadPanelContent")
    expect(hostSessionSource).toContain("ThreadPanelAppWindowHost")
    expect(hostSessionSource).toContain("onPromptSubmit")
    expect(hostSessionSource).toContain("onInterruptTurn")
    expect(hostSource).not.toContain("WebviewWindow")
    expect(hostSource).not.toContain("emitTo")
    expect(hostSource).not.toContain("codex_host_stop")
    expect(hostSessionSource).not.toContain("WebviewWindow")
    expect(hostSessionSource).not.toContain("emitTo")
    expect(hostSessionSource).not.toContain("codex_host_stop")
    expect(hostSessionSource).not.toContain("<PetPanel size=\"auto\">")
    expect(threadPanelWindowHostSource).not.toContain("WebviewWindow")
    expect(threadPanelWindowHostSource).not.toContain("emitTo")
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

  it("shares the pet message composer with the thread panel", () => {
    expect(surfaceSource).toContain("messageDraft")
    expect(surfaceSource).toContain("setMessageDraft")
    expect(hostSessionSource).toContain("threadPanelComposer")
    expect(hostSessionSource).toContain("composer={threadPanelComposer}")
    expect(hostSessionSource).toContain('surface="floating"')
    expect(surfaceSource).not.toContain(
      "bg-background/80 shadow-none backdrop-blur-sm"
    )
    expect(surfaceSource).toContain("onMessageDraftChange: setMessageDraft")
    expect(hostSessionSource).toContain("draft={snapshot.messageDraft}")
    expect(hostSessionSource).toContain(
      "onDraftChange={snapshot.onMessageDraftChange}"
    )
  })

  it("passes thread panel close behavior through the pet host", () => {
    expect(surfaceSource).toContain("threadPanel")
    expect(surfaceSource).not.toContain("PetThreadPanelContent")
    expect(surfaceSource).not.toContain("renderThreadPanelContent")
    expect(hostSessionSource).toContain("snapshot.threadPanel")
    expect(hostSessionSource).toContain("PetThreadPanelContent")
    expect(hostSessionSource).toContain("PetThreadTranscriptContent")
    expect(hostSessionSource).toContain("onClose={() => setIsThreadPanelOpen(false)}")
    expect(hostSessionSource).toContain("isThreadPanelOpen")
    expect(hostSessionSource).toContain("onThreadPanelOpenChange")
    expect(hostSessionSource).toContain(
      "<ThreadPanelAppWindowHost open={isThreadPanelOpen}>"
    )
    expect(hostSessionSource).not.toContain("isThreadPickerOpen")
    expect(hostSessionSource).not.toContain("isTranscriptOpen")
    expect(hostSessionSource).not.toContain("renderThreadPanelContent")
    expect(hostSessionSource).not.toContain("renderTranscriptContent")
    expect(hostSessionSource).not.toContain("threadPickerContent")
    expect(hostSessionSource).not.toContain("transcriptContent")
    expect(surfaceSource).not.toContain("isTranscriptPinned")
    expect(surfaceSource).not.toContain("setIsTranscriptPinned")
    expect(surfaceSource).not.toContain("onPinnedChange")
    expect(hostSessionSource).not.toContain("isTranscriptPinned")
  })

  it("hosts the thread panel as an app-internal window", () => {
    expect(threadPanelWindowHostSource).toContain(
      "export function ThreadPanelAppWindowHost"
    )
    expect(threadPanelWindowHostSource).toContain(
      'data-window-host="thread-panel"'
    )
    expect(threadPanelWindowHostSource).toContain("fixed inset-0 z-50")
    expect(threadPanelWindowHostSource).toContain("requestAnimationFrame")
    expect(threadPanelWindowHostSource).toContain("pendingPositionRef")
    expect(threadPanelWindowHostSource).toContain("pendingSizeRef")
    expect(threadPanelWindowHostSource).toContain("Resize thread panel")
    expect(threadPanelWindowHostSource).toContain("constrainPosition")
    expect(threadPanelWindowHostSource).toContain("constrainSize")
  })

  it("keeps thread panel UI behind an app-hosted surface boundary", () => {
    expect(threadPanelSource).toContain("export function ThreadPanelSurface")
    expect(threadPanelSource).toContain("ThreadPanelSurfaceSnapshot")
    expect(threadPanelSource).toContain("ThreadPanelAction")
    expect(threadPanelSource).toContain("ThreadPanelDispatch")
    expect(threadPanelSource).toContain("ThreadPanelBridge")
    expect(threadPanelSource).toContain(
      "<ThreadPanelSurface bridge={bridge} chat={chat} />"
    )
    expect(hostSessionSource).toContain("PetThreadPanelContent")
    expect(hostSessionSource).not.toContain("ThreadPanelSurface")
    expect(threadPanelSource).not.toContain("WorkspaceGhostPet")
    expect(threadPanelSource).not.toContain("WebviewWindow")
    expect(threadPanelSource).not.toContain("emitTo")
    expect(threadPanelSource).toContain(
      "className=\"flex h-full min-h-0 w-full min-w-0 flex-col"
    )
  })

  it("routes thread panel behavior through a snapshot and action protocol", () => {
    expect(threadPanelSource).toContain('type: "new-thread"')
    expect(threadPanelSource).toContain('type: "resume-thread"')
    expect(threadPanelSource).toContain('type: "rename-thread"')
    expect(threadPanelSource).toContain('type: "set-search-open"')
    expect(threadPanelSource).toContain("searchOpen: isSearchOpen")
    expect(threadPanelSource).toContain("snapshot.searchOpen")
    expect(threadPanelSource).toContain("const dispatch: ThreadPanelDispatch")
    expect(threadPanelSource).toContain("const bridge: ThreadPanelBridge")
    expect(threadPanelSource).not.toContain("ThreadPanelSurfaceActions")
  })
})
