import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const appFramePath = fileURLToPath(
  new URL("../../shell/app-frame.tsx", import.meta.url)
)
const mainPath = fileURLToPath(new URL("../../main.tsx", import.meta.url))
const rootAppPath = fileURLToPath(new URL("../../root-app.tsx", import.meta.url))
const appliedThemeProviderPath = fileURLToPath(
  new URL("../../shared/app-theme/applied-theme-provider.tsx", import.meta.url)
)
const appCssPath = fileURLToPath(new URL("../../index.css", import.meta.url))
const tauriConfigPath = fileURLToPath(
  new URL("../../../../../src-tauri/tauri.conf.json", import.meta.url)
)
const tauriCapabilityPath = fileURLToPath(
  new URL(
    "../../../../../src-tauri/capabilities/default.json",
    import.meta.url
  )
)
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
const threadPanelNativeBridgePath = fileURLToPath(
  new URL("./thread-panel-native-bridge.ts", import.meta.url)
)
const threadPanelWindowAppPath = fileURLToPath(
  new URL("./thread-panel-window-app.tsx", import.meta.url)
)
const composerPath = fileURLToPath(
  new URL("./pet-message-composer.tsx", import.meta.url)
)
const surfacePath = fileURLToPath(
  new URL("../../workspace/surface.tsx", import.meta.url)
)
const siteHeaderPath = fileURLToPath(
  new URL("../../shell/site-header.tsx", import.meta.url)
)
const windowChromePath = fileURLToPath(
  new URL("../../shared/ui/window-chrome.tsx", import.meta.url)
)

const appFrameSource = readFileSync(appFramePath, "utf8")
const composerSource = readFileSync(composerPath, "utf8")
const mainSource = readFileSync(mainPath, "utf8")
const rootAppSource = readFileSync(rootAppPath, "utf8")
const appliedThemeProviderSource = readFileSync(
  appliedThemeProviderPath,
  "utf8"
)
const appCssSource = readFileSync(appCssPath, "utf8")
const tauriConfigSource = readFileSync(tauriConfigPath, "utf8")
const tauriCapabilitySource = readFileSync(tauriCapabilityPath, "utf8")
const hostSource = readFileSync(hostPath, "utf8")
const hostSessionSource = readFileSync(hostSessionPath, "utf8")
const threadPanelSource = readFileSync(threadPanelPath, "utf8")
const threadPanelWindowHostSource = readFileSync(
  threadPanelWindowHostPath,
  "utf8"
)
const threadPanelNativeBridgeSource = readFileSync(
  threadPanelNativeBridgePath,
  "utf8"
)
const threadPanelWindowAppSource = readFileSync(
  threadPanelWindowAppPath,
  "utf8"
)
const surfaceSource = readFileSync(surfacePath, "utf8")
const siteHeaderSource = readFileSync(siteHeaderPath, "utf8")
const windowChromeSource = readFileSync(windowChromePath, "utf8")

describe("pet host contract", () => {
  it("keeps pet mounted inside the app frame", () => {
    expect(appFrameSource).toContain("WorkspacePetHost")
    expect(appFrameSource).toContain("<WorkspacePetHost />")
    expect(appFrameSource).toContain("WindowChromeFrame")
    expect(appFrameSource).not.toContain("WorkspacePetBridge")
  })

  it("applies the saved app theme across every app root", () => {
    expect(mainSource).toContain("AppliedAppThemeProvider")
    expect(appliedThemeProviderSource).toContain("loadAppliedAppTheme")
    expect(appliedThemeProviderSource).toContain("applyAppTheme")
    expect(appliedThemeProviderSource).toContain("createDefaultAppThemeDraft")
    expect(appliedThemeProviderSource).toContain("appliedAppThemeStorageKey")
    expect(appliedThemeProviderSource).toContain('window.addEventListener("storage"')
    expect(appliedThemeProviderSource).toContain(
      "event.key !== appliedAppThemeStorageKey"
    )
    expect(threadPanelWindowAppSource).not.toContain("AppThemeScope")
  })

  it("only routes the thread panel through a native secondary window", () => {
    expect(mainSource).not.toContain("PetWindowApp")
    expect(mainSource).not.toContain("PetPanelWindowApp")
    expect(rootAppSource).not.toContain('windowName === "pet"')
    expect(rootAppSource).not.toContain('windowName === "pet-panel"')
    expect(rootAppSource).toContain('get("window")')
    expect(rootAppSource).toContain('"thread-panel"')
    expect(rootAppSource).toContain("React.lazy")
    expect(rootAppSource).toContain(
      'import("@/app/pet/host/thread-panel-window-app")'
    )
    expect(rootAppSource).toContain("LazyThreadPanelWindowApp")
    expect(rootAppSource).not.toContain(
      'import { ThreadPanelWindowApp } from "@/app/pet/host/thread-panel-window-app"'
    )
    expect(tauriConfigSource).toContain('"label": "thread-panel"')
    expect(tauriConfigSource).toContain('"url": "/?window=thread-panel"')
    expect(tauriCapabilitySource).toContain('"thread-panel"')
    expect(tauriCapabilitySource).toContain('"core:window:allow-show"')
    expect(tauriCapabilitySource).toContain('"core:window:allow-set-focus"')
    expect(tauriCapabilitySource).toContain('"core:window:allow-hide"')
    expect(tauriCapabilitySource).not.toContain('"pet"')
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
    expect(hostSessionSource).toContain("preloadThreadPanelNativeWindowApp")
    expect(hostSessionSource).toContain("useNativeThreadPanelFallback")
    expect(hostSessionSource).toContain("setUseNativeThreadPanelFallback(true)")
    expect(hostSource).not.toContain("WebviewWindow")
    expect(hostSource).not.toContain("emitTo")
    expect(hostSource).not.toContain("codex_host_stop")
    expect(hostSessionSource).not.toContain("codex_host_stop")
    expect(hostSessionSource).not.toContain("<PetPanel size=\"auto\">")
    expect(threadPanelWindowHostSource).not.toContain("WebviewWindow")
    expect(threadPanelWindowHostSource).not.toContain("emitTo")
    expect(threadPanelNativeBridgeSource).toContain("WebviewWindow")
    expect(threadPanelNativeBridgeSource).toContain("emitTo")
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
    expect(hostSessionSource).toContain("ThreadPanelAppWindowHost")
    expect(hostSessionSource).toContain("canUseNativeThreadPanel")
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

  it("keeps native thread panel transport behind the bridge protocol", () => {
    expect(threadPanelNativeBridgeSource).toContain(
      'THREAD_PANEL_WINDOW_LABEL = "thread-panel"'
    )
    expect(threadPanelNativeBridgeSource).toContain(
      'THREAD_PANEL_SNAPSHOT_EVENT = "thread-panel://snapshot"'
    )
    expect(threadPanelNativeBridgeSource).toContain(
      'THREAD_PANEL_ACTION_EVENT = "thread-panel://action"'
    )
    expect(threadPanelNativeBridgeSource).toContain(
      'THREAD_PANEL_SNAPSHOT_STORAGE_KEY ='
    )
    expect(threadPanelNativeBridgeSource).toContain(
      "ThreadPanelNativeSnapshot"
    )
    expect(threadPanelNativeBridgeSource).toContain("ThreadPanelNativeAction")
    expect(threadPanelNativeBridgeSource).toContain(
      "openThreadPanelNativeWindow"
    )
    expect(threadPanelNativeBridgeSource).toContain("try {")
    expect(threadPanelNativeBridgeSource).toContain("catch {")
    expect(threadPanelNativeBridgeSource).toContain("return false")
    expect(threadPanelNativeBridgeSource).toContain(
      "closeThreadPanelNativeWindow"
    )
    expect(threadPanelNativeBridgeSource).toContain(
      "getLatestThreadPanelNativeSnapshot"
    )
    expect(threadPanelNativeBridgeSource).toContain(
      "readThreadPanelNativeSnapshotCache"
    )
    expect(threadPanelNativeBridgeSource).toContain(
      "writeThreadPanelNativeSnapshotCache"
    )
    expect(threadPanelNativeBridgeSource).toContain(
      "setLatestThreadPanelNativeSnapshot"
    )
    expect(threadPanelNativeBridgeSource).toContain(
      "publishThreadPanelNativeSnapshot"
    )
    expect(threadPanelNativeBridgeSource).toContain(
      "subscribeThreadPanelNativeActions"
    )
    expect(threadPanelNativeBridgeSource).toContain(
      "subscribeThreadPanelNativeSnapshots"
    )
    expect(threadPanelNativeBridgeSource).toContain(
      "preloadThreadPanelNativeWindowApp"
    )
    expect(threadPanelNativeBridgeSource).toContain("localStorage.setItem")
    expect(threadPanelNativeBridgeSource).toContain("localStorage.getItem")
    expect(threadPanelNativeBridgeSource).toContain("existingWindow?.hide()")
    expect(threadPanelNativeBridgeSource).not.toContain("existingWindow?.close()")
    expect(threadPanelNativeBridgeSource).toContain("existingWindow.show()")
    expect(threadPanelNativeBridgeSource).toContain("existingWindow.setFocus()")
  })

  it("reuses the thread panel surface in the native window root", () => {
    expect(threadPanelWindowAppSource).toContain("ThreadPanelSurface")
    expect(threadPanelWindowAppSource).toContain("WindowChromeFrame")
    expect(threadPanelWindowAppSource).toContain("WindowTitlebar")
    expect(threadPanelWindowAppSource).toContain(
      "headerSlot={(header) =>"
    )
    expect(threadPanelWindowAppSource).not.toContain("WindowDragHandle")
    expect(threadPanelWindowAppSource).not.toContain("data-window-drag-handle")
    expect(threadPanelWindowAppSource).not.toContain("data-cursor=\"drag\"")
    expect(threadPanelWindowAppSource).not.toContain("getDragRegionProps")
    expect(threadPanelWindowAppSource).not.toContain("dragRegionProps")
    expect(threadPanelWindowAppSource).toContain(
      "readThreadPanelNativeSnapshotCache"
    )
    expect(threadPanelWindowAppSource).toContain("PetThreadTranscriptContent")
    expect(threadPanelWindowAppSource).toContain("PetMessageComposer")
    expect(threadPanelWindowAppSource).toContain(
      "subscribeThreadPanelNativeSnapshots"
    )
    expect(threadPanelWindowAppSource).toContain(
      "dispatchThreadPanelNativeAction"
    )
    expect(threadPanelWindowAppSource).toContain("hideWindow")
    expect(threadPanelWindowAppSource).not.toContain("closeWindow")
    expect(threadPanelWindowAppSource).not.toContain("useWorkspaceController")
    expect(threadPanelWindowAppSource).not.toContain("CodexConnectionProvider")
  })

  it("keeps thread panel UI behind an app-hosted surface boundary", () => {
    expect(threadPanelSource).toContain("export function ThreadPanelSurface")
    expect(threadPanelSource).toContain("ThreadPanelSurfaceSnapshot")
    expect(threadPanelSource).toContain("ThreadPanelAction")
    expect(threadPanelSource).toContain("ThreadPanelDispatch")
    expect(threadPanelSource).toContain("ThreadPanelBridge")
    expect(threadPanelSource).toContain("ThreadPanelHeaderSlot")
    expect(threadPanelSource).toContain("headerSlot")
    expect(threadPanelSource).toContain("data-tauri-no-drag")
    expect(threadPanelSource).not.toContain("dragRegionProps")
    expect(threadPanelSource).not.toContain("getDragRegionProps")
    expect(threadPanelSource).not.toContain("data-tauri-drag-region")
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

  it("keeps native window chrome outside business surfaces", () => {
    expect(windowChromeSource).toContain("export function WindowChromeFrame")
    expect(windowChromeSource).toContain("export function WindowTitlebar")
    expect(windowChromeSource).toContain("export function WindowDragHandle")
    expect(windowChromeSource).toContain("export function WindowControls")
    expect(windowChromeSource).toContain("startWindowDrag")
    expect(windowChromeSource).toContain("preloadCurrentWindowHandle")
    expect(windowChromeSource).toContain("onMouseDown")
    expect(windowChromeSource).toContain("data-window-drag-handle")
    expect(windowChromeSource).toContain("data-window-no-drag")
    expect(windowChromeSource).toContain('data-cursor="drag"')
    expect(windowChromeSource).not.toContain(
      'data-cursor={drag ? "drag" : undefined}'
    )
    expect(windowChromeSource).not.toContain("debugWindowChrome")
    expect(windowChromeSource).not.toContain("agent-html:debug-window-chrome")
    expect(windowChromeSource).not.toContain("console.table")
    expect(windowChromeSource).not.toContain("outerPosition")
    expect(siteHeaderSource).toContain("WindowTitlebar")
    expect(siteHeaderSource).toContain("WindowControls")
    expect(siteHeaderSource).not.toContain("WindowDragHandle")
    expect(siteHeaderSource).not.toContain(
      'className="flex min-w-0 flex-1 items-center"\n          data-tauri-no-drag'
    )
    expect(siteHeaderSource).not.toContain("sticky top-0")
    expect(siteHeaderSource).not.toContain("getDragRegionProps")
    expect(siteHeaderSource).not.toContain("data-tauri-drag-region")
    expect(appCssSource).toContain("html,\n  body,\n  #root")
    expect(appCssSource).toContain("overflow: hidden")
    expect(appCssSource).toContain("overscroll-behavior: none")
  })

  it("routes thread panel behavior through a snapshot and action protocol", () => {
    expect(threadPanelSource).toContain('type: "new-thread"')
    expect(threadPanelSource).toContain('type: "resume-thread"')
    expect(threadPanelSource).toContain('type: "rename-thread"')
    expect(threadPanelSource).toContain('type: "set-search-open"')
    expect(threadPanelSource).toContain('type: "set-message-draft"')
    expect(threadPanelSource).toContain('type: "submit-prompt"')
    expect(threadPanelSource).toContain('type: "interrupt-turn"')
    expect(threadPanelSource).toContain("searchOpen: isSearchOpen")
    expect(threadPanelSource).toContain("snapshot.searchOpen")
    expect(threadPanelSource).toContain("const dispatch: ThreadPanelDispatch")
    expect(threadPanelSource).toContain("const bridge: ThreadPanelBridge")
    expect(threadPanelSource).not.toContain("ThreadPanelSurfaceActions")
  })
})
