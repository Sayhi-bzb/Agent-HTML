import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const appFramePath = fileURLToPath(
  new URL("../../shell/app-frame.tsx", import.meta.url)
)
const mainPath = fileURLToPath(new URL("../../main.tsx", import.meta.url))
const rootAppPath = fileURLToPath(
  new URL("../../root-app.tsx", import.meta.url)
)
const appliedThemeProviderPath = fileURLToPath(
  new URL("../../shared/app-theme/applied-theme-provider.tsx", import.meta.url)
)
const appliedThemeContextPath = fileURLToPath(
  new URL("../../shared/app-theme/applied-theme-context.ts", import.meta.url)
)
const storageSyncPath = fileURLToPath(
  new URL("../../shared/storage-sync.ts", import.meta.url)
)
const appCssPath = fileURLToPath(new URL("../../index.css", import.meta.url))
const tauriConfigPath = fileURLToPath(
  new URL("../../../../../src-tauri/tauri.conf.json", import.meta.url)
)
const tauriCapabilityPath = fileURLToPath(
  new URL("../../../../../src-tauri/capabilities/default.json", import.meta.url)
)
const hostPath = fileURLToPath(
  new URL("./workspace-pet-host.tsx", import.meta.url)
)
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
const petSettingsPath = fileURLToPath(
  new URL("./pet-settings-content.tsx", import.meta.url)
)
const petSettingsSessionPath = fileURLToPath(
  new URL("./settings/pet-settings-session.tsx", import.meta.url)
)
const petSettingsNativeBridgePath = fileURLToPath(
  new URL("./pet-settings-native-bridge.ts", import.meta.url)
)
const petSettingsWindowAppPath = fileURLToPath(
  new URL("./pet-settings-window-app.tsx", import.meta.url)
)
const petSettingsShellWindowPath = fileURLToPath(
  new URL("../../shell/pet-settings-window.tsx", import.meta.url)
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
const secondaryWindowPath = fileURLToPath(
  new URL("../../shared/window/secondary-window.ts", import.meta.url)
)
const secondaryWindowBridgePath = fileURLToPath(
  new URL("../../shared/window/use-secondary-window-bridge.ts", import.meta.url)
)

const appFrameSource = readFileSync(appFramePath, "utf8")
const composerSource = readFileSync(composerPath, "utf8")
const mainSource = readFileSync(mainPath, "utf8")
const rootAppSource = readFileSync(rootAppPath, "utf8")
const appliedThemeProviderSource = readFileSync(
  appliedThemeProviderPath,
  "utf8"
)
const appliedThemeContextSource = readFileSync(appliedThemeContextPath, "utf8")
const storageSyncSource = readFileSync(storageSyncPath, "utf8")
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
const petSettingsSource = readFileSync(petSettingsPath, "utf8")
const petSettingsSessionSource = readFileSync(petSettingsSessionPath, "utf8")
const petSettingsNativeBridgeSource = readFileSync(
  petSettingsNativeBridgePath,
  "utf8"
)
const petSettingsWindowAppSource = readFileSync(
  petSettingsWindowAppPath,
  "utf8"
)
const petSettingsShellWindowSource = readFileSync(
  petSettingsShellWindowPath,
  "utf8"
)
const surfaceSource = readFileSync(surfacePath, "utf8")
const siteHeaderSource = readFileSync(siteHeaderPath, "utf8")
const windowChromeSource = readFileSync(windowChromePath, "utf8")
const secondaryWindowSource = readFileSync(secondaryWindowPath, "utf8")
const secondaryWindowBridgeSource = readFileSync(
  secondaryWindowBridgePath,
  "utf8"
)
const appThemeScopeSource = readFileSync(
  fileURLToPath(new URL("../../shared/app-theme/scope.tsx", import.meta.url)),
  "utf8"
)

describe("pet host contract", () => {
  it("keeps pet mounted inside the app frame", () => {
    expect(appFrameSource).toContain("WorkspacePetHost")
    expect(appFrameSource).toContain("<WorkspacePetHost />")
    expect(appFrameSource).toContain("PetSettingsWindowProvider")
    expect(appFrameSource).toContain("WindowChromeFrame")
    expect(appFrameSource).not.toContain("WorkspacePetBridge")
  })

  it("applies the saved app theme across every app root", () => {
    expect(mainSource).toContain("AppliedAppThemeProvider")
    expect(appliedThemeProviderSource).toContain("readSyncedStorageValue")
    expect(appliedThemeProviderSource).toContain("writeSyncedStorageValue")
    expect(appliedThemeProviderSource).toContain("subscribeSyncedStorageKey")
    expect(appliedThemeProviderSource).toContain(
      "applyAppliedAppThemeToDocument"
    )
    expect(appliedThemeProviderSource).toContain("appliedAppThemeStorageKey")
    expect(appliedThemeContextSource).toContain("useAppliedAppTheme")
    expect(appliedThemeContextSource).toContain("appliedThemeCssVariables")
    expect(storageSyncSource).toContain("agent-html:storage-sync")
    expect(storageSyncSource).toContain('window.addEventListener("storage"')
    expect(threadPanelWindowAppSource).not.toContain("AppThemeScope")
    expect(appFrameSource).not.toContain("AppThemeScope")
    expect(appThemeScopeSource).not.toContain("document.body.style")
  })

  it("routes pet secondary surfaces through native secondary windows", () => {
    expect(mainSource).not.toContain("PetWindowApp")
    expect(mainSource).not.toContain("PetPanelWindowApp")
    expect(rootAppSource).not.toContain('windowName === "pet"')
    expect(rootAppSource).not.toContain('windowName === "pet-panel"')
    expect(rootAppSource).toContain('get("window")')
    expect(rootAppSource).toContain('"thread-panel"')
    expect(rootAppSource).toContain('"pet-settings"')
    expect(rootAppSource).toContain("React.lazy")
    expect(rootAppSource).toContain("ThreadPanelWindowStartupSkeleton")
    expect(rootAppSource).toContain("PetSettingsWindowStartupSkeleton")
    expect(rootAppSource).toContain("WindowChromeFrame")
    expect(rootAppSource).toContain("<WindowChromeFrame>")
    expect(rootAppSource).not.toContain("rounded-[var(--window-chrome-radius)] border bg-background")
    expect(rootAppSource).not.toContain("fallback={null}")
    expect(rootAppSource).toContain(
      'import("@/app/pet/host/thread-panel-window-app")'
    )
    expect(rootAppSource).toContain(
      'import("@/app/pet/host/pet-settings-window-app")'
    )
    expect(rootAppSource).toContain("LazyThreadPanelWindowApp")
    expect(rootAppSource).toContain("LazyPetSettingsWindowApp")
    expect(rootAppSource).not.toContain(
      'import { ThreadPanelWindowApp } from "@/app/pet/host/thread-panel-window-app"'
    )
    expect(tauriConfigSource).toContain('"label": "thread-panel"')
    expect(tauriConfigSource).toContain('"url": "/?window=thread-panel"')
    expect(tauriConfigSource).toContain('"label": "pet-settings"')
    expect(tauriConfigSource).toContain('"url": "/?window=pet-settings"')
    expect(tauriCapabilitySource).toContain('"thread-panel"')
    expect(tauriCapabilitySource).toContain('"pet-settings"')
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
    expect(hostSessionSource).toContain("usePetSettingsWindow")
    expect(hostSessionSource).toContain("useSecondaryWindowBridge")
    expect(hostSessionSource).toContain("threadPanelBridge")
    expect(hostSessionSource).toContain("petSettingsWindow.isOpen")
    expect(hostSessionSource).toContain("petSettingsWindow.setOpen")
    expect(hostSessionSource).not.toContain("PetSettingsContent")
    expect(hostSessionSource).not.toContain("PetSettingsSurface")
    expect(hostSessionSource).not.toContain("PetSettingsBridge")
    expect(hostSessionSource).not.toContain("PetSettingsDispatch")
    expect(hostSessionSource).not.toContain("PetSettingsSurfaceSnapshot")
    expect(hostSessionSource).not.toContain("settingsDispatch")
    expect(hostSessionSource).not.toContain("setSettingsDispatch")
    expect(hostSessionSource).not.toContain("setSettingsSnapshot")
    expect(hostSessionSource).not.toContain("handleSettingsClose")
    expect(hostSessionSource).not.toContain("handleSettingsBridgeChange")
    expect(hostSessionSource).not.toContain("publishPetSettingsNativeSnapshot")
    expect(hostSessionSource).not.toContain("subscribePetSettingsNativeActions")
    expect(hostSessionSource).not.toContain("settingsWindowBridge")
    expect(hostSessionSource).not.toContain("renderSurface={false}")
    expect(hostSessionSource).not.toContain("setSettingsBridge")
    expect(hostSessionSource).not.toContain(
      "useState<PetSettingsBridge | null>"
    )
    expect(hostSessionSource).toContain("threadPanelContent")
    expect(hostSessionSource).toContain("PetThreadPanelContent")
    expect(hostSessionSource).toContain("ThreadPanelAppWindowHost")
    expect(hostSessionSource).toContain("onPromptSubmit")
    expect(hostSessionSource).toContain("onInterruptTurn")
    expect(hostSessionSource).toContain("preloadThreadPanelNativeWindowApp")
    expect(hostSessionSource).not.toContain("useNativeSettingsFallback")
    expect(hostSessionSource).not.toContain("useNativeThreadPanelFallback")
    expect(hostSessionSource).not.toContain(
      "setUseNativeThreadPanelFallback(true)"
    )
    expect(hostSource).not.toContain("WebviewWindow")
    expect(hostSource).not.toContain("emitTo")
    expect(hostSource).not.toContain("codex_host_stop")
    expect(hostSessionSource).not.toContain("codex_host_stop")
    expect(hostSessionSource).not.toContain('<PetPanel size="auto">')
    expect(threadPanelWindowHostSource).not.toContain("WebviewWindow")
    expect(threadPanelWindowHostSource).not.toContain("emitTo")
    expect(threadPanelNativeBridgeSource).not.toContain("WebviewWindow")
    expect(threadPanelNativeBridgeSource).not.toContain("emitTo")
    expect(petSettingsNativeBridgeSource).not.toContain("WebviewWindow")
    expect(petSettingsNativeBridgeSource).not.toContain("emitTo")
    expect(secondaryWindowSource).toContain("WebviewWindow")
    expect(secondaryWindowSource).toContain("emitTo")
    expect(secondaryWindowBridgeSource).toContain(
      "export function useSecondaryWindowBridge"
    )
    expect(secondaryWindowBridgeSource).toContain("setUseNativeFallback(true)")
    expect(secondaryWindowBridgeSource).toContain("publishSnapshot(snapshot)")
  })

  it("treats pet message send as a floating interaction", () => {
    expect(hostSessionSource).toContain(
      "onSent={() => setIsMessageOpen(false)}"
    )
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
    expect(hostSessionSource).toContain(
      "onClose={() => threadPanelCloseRef.current()}"
    )
    expect(hostSessionSource).toContain("threadPanelBridge.isOpen")
    expect(hostSessionSource).toContain("onThreadPanelOpenChange")
    expect(hostSessionSource).toContain("ThreadPanelAppWindowHost")
    expect(hostSessionSource).toContain("canUseThreadPanelNativeWindow")
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
    expect(secondaryWindowSource).toContain(
      "export function createSecondaryWindowSurface"
    )
    expect(secondaryWindowSource).toContain("WebviewWindow")
    expect(secondaryWindowSource).toContain("localStorage.setItem")
    expect(secondaryWindowSource).toContain("localStorage.getItem")
    expect(secondaryWindowSource).toContain("existingWindow.show()")
    expect(secondaryWindowSource).toContain("existingWindow.setFocus()")
    expect(secondaryWindowSource).toContain("existingWindow?.hide()")
    expect(secondaryWindowSource).toContain("return false")
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
      "THREAD_PANEL_SNAPSHOT_STORAGE_KEY ="
    )
    expect(threadPanelNativeBridgeSource).toContain(
      "createSecondaryWindowSurface"
    )
    expect(threadPanelNativeBridgeSource).toContain("ThreadPanelNativeSnapshot")
    expect(threadPanelNativeBridgeSource).toContain("ThreadPanelNativeAction")
    expect(threadPanelNativeBridgeSource).toContain(
      "openThreadPanelNativeWindow"
    )
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
    expect(threadPanelNativeBridgeSource).not.toContain("WebviewWindow")
    expect(threadPanelNativeBridgeSource).not.toContain("localStorage.setItem")
    expect(threadPanelNativeBridgeSource).not.toContain("localStorage.getItem")
    expect(threadPanelNativeBridgeSource).not.toContain("existingWindow.show()")
    expect(threadPanelNativeBridgeSource).not.toContain(
      "existingWindow.setFocus()"
    )
    expect(threadPanelNativeBridgeSource).not.toContain(
      "existingWindow?.hide()"
    )
    expect(threadPanelNativeBridgeSource).not.toContain("emitTo")
    expect(threadPanelNativeBridgeSource).not.toContain("listen<")
  })

  it("reuses the thread panel surface in the native window root", () => {
    expect(threadPanelWindowAppSource).toContain("ThreadPanelSurface")
    expect(threadPanelWindowAppSource).toContain("WindowChromeFrame")
    expect(threadPanelWindowAppSource).toContain("WindowTitlebar")
    expect(threadPanelWindowAppSource).toContain("headerSlot={(header) =>")
    expect(threadPanelWindowAppSource).not.toContain("WindowDragHandle")
    expect(threadPanelWindowAppSource).not.toContain("data-window-drag-handle")
    expect(threadPanelWindowAppSource).not.toContain('data-cursor="drag"')
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
      'className="flex h-full min-h-0 w-full min-w-0 flex-col'
    )
  })

  it("keeps pet settings UI behind a secondary-window surface boundary", () => {
    expect(petSettingsShellWindowSource).toContain(
      "export function PetSettingsWindowProvider"
    )
    expect(petSettingsShellWindowSource).toContain(
      "export function usePetSettingsWindow"
    )
    expect(petSettingsShellWindowSource).toContain("PetSettingsContent")
    expect(petSettingsShellWindowSource).toContain("PetSettingsSurface")
    expect(petSettingsShellWindowSource).toContain(
      "publishPetSettingsNativeSnapshot"
    )
    expect(petSettingsShellWindowSource).toContain(
      "subscribePetSettingsNativeActions"
    )
    expect(petSettingsShellWindowSource).toContain("useSecondaryWindowBridge")
    expect(petSettingsShellWindowSource).toContain('type: "set-active-view"')
    expect(petSettingsShellWindowSource).not.toContain("useCodexConnection")
    expect(petSettingsSource).toContain(
      'from "./settings/pet-settings-surface"'
    )
    expect(petSettingsSource).toContain(
      'from "./settings/pet-settings-session"'
    )
    expect(petSettingsSource).toContain('from "./settings/types"')
    expect(petSettingsSource).toContain("PetSettingsSurfaceSnapshot")
    expect(petSettingsSource).toContain("PetSettingsAction")
    expect(petSettingsSource).toContain("PetSettingsBridge")
    expect(petSettingsSessionSource).toContain("onBridgeChange")
    expect(petSettingsSessionSource).toContain("renderSurface")
    expect(petSettingsNativeBridgeSource).toContain(
      'PET_SETTINGS_WINDOW_LABEL = "pet-settings"'
    )
    expect(petSettingsNativeBridgeSource).toContain(
      'PET_SETTINGS_SNAPSHOT_EVENT = "pet-settings://snapshot"'
    )
    expect(petSettingsNativeBridgeSource).toContain(
      'PET_SETTINGS_ACTION_EVENT = "pet-settings://action"'
    )
    expect(petSettingsNativeBridgeSource).toContain(
      "createSecondaryWindowSurface"
    )
    expect(petSettingsWindowAppSource).toContain("PetSettingsSurface")
    expect(petSettingsWindowAppSource).toContain("WindowChromeFrame")
    expect(petSettingsWindowAppSource).toContain("WindowTitlebar")
    expect(petSettingsWindowAppSource).toContain("WindowControls")
    expect(petSettingsWindowAppSource).toContain("renderHeader={false}")
    expect(petSettingsWindowAppSource).toContain("AgentHTML settings")
    expect(petSettingsWindowAppSource).not.toContain("getSettingsSubtitle")
    expect(petSettingsWindowAppSource).toContain(
      "readPetSettingsNativeSnapshotCache"
    )
    expect(petSettingsWindowAppSource).toContain(
      "dispatchPetSettingsNativeAction"
    )
    expect(petSettingsWindowAppSource).toContain("hideWindow")
    expect(petSettingsWindowAppSource).not.toContain("closeWindow")
    expect(petSettingsWindowAppSource).not.toContain("CodexConnectionProvider")
    expect(petSettingsWindowAppSource).not.toContain("useCodexConnection")
  })

  it("keeps native window chrome outside business surfaces", () => {
    expect(windowChromeSource).toContain("export function WindowChromeFrame")
    expect(windowChromeSource).toContain("export function WindowTitlebar")
    expect(windowChromeSource).toContain("export function WindowDragHandle")
    expect(windowChromeSource).toContain("export function WindowControls")
    expect(windowChromeSource).toContain("subscribeWindowMaximizedState")
    expect(windowChromeSource).toContain("startWindowDrag")
    expect(windowChromeSource).toContain("preloadCurrentWindowHandle")
    expect(windowChromeSource).toContain("data-window-chrome-surface")
    expect(windowChromeSource).toContain("style?: React.CSSProperties")
    expect(windowChromeSource).toContain(
      "rounded-[var(--window-chrome-radius)]"
    )
    expect(windowChromeSource).not.toContain("border border-border/70")
    expect(windowChromeSource).toContain("data-window-maximized")
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
    expect(appCssSource).toMatch(/html,\s+body,\s+#root/)
    expect(appCssSource).toContain("background: transparent")
    expect(appCssSource).toContain("[data-window-chrome-surface]")
    expect(appCssSource).not.toContain("[data-window-chrome-surface]::after")
    expect(appCssSource).not.toContain("inset: 1px")
    expect(appCssSource).not.toContain(
      "border-radius: max(0px, calc(var(--window-chrome-radius) - 1px))"
    )
    expect(appCssSource).toContain(
      "[data-window-chrome-root][data-window-maximized]"
    )
    expect(appCssSource).toContain("--window-chrome-inset: 0px")
    expect(appCssSource).toContain("--window-chrome-radius: var(--radius-xl)")
    expect(appCssSource).not.toContain(
      "--window-chrome-radius: calc(var(--radius)"
    )
    expect(appCssSource).toContain("--window-chrome-shadow: none")
    expect(appCssSource).toContain("overflow: hidden")
    expect(appCssSource).toContain("overscroll-behavior: none")
    expect(tauriConfigSource).toContain('"transparent": true')
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
