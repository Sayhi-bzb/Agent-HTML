import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const appSource = readFileSync(
  fileURLToPath(new URL("./App.tsx", import.meta.url)),
  "utf8"
)
const appSidebarSource = readFileSync(
  fileURLToPath(new URL("./shell/app-sidebar.tsx", import.meta.url)),
  "utf8"
)
const appFrameSource = readFileSync(
  fileURLToPath(new URL("./shell/app-frame.tsx", import.meta.url)),
  "utf8"
)
const galleryControllerSource = readFileSync(
  fileURLToPath(new URL("./gallery/controller.tsx", import.meta.url)),
  "utf8"
)
const rootAppSource = readFileSync(
  fileURLToPath(new URL("./root-app.tsx", import.meta.url)),
  "utf8"
)
const workspaceControllerSource = readFileSync(
  fileURLToPath(new URL("./workspace/controller.ts", import.meta.url)),
  "utf8"
)
const appHtmlSource = readFileSync(
  fileURLToPath(new URL("../index.html", import.meta.url)),
  "utf8"
)
const verifyAppBundleSource = readFileSync(
  fileURLToPath(new URL("../../../tools/verify-app-bundle.mjs", import.meta.url)),
  "utf8"
)
const verifyExampleBuildSource = readFileSync(
  fileURLToPath(
    new URL("../../../tools/verify-example-build.mjs", import.meta.url)
  ),
  "utf8"
)
const exampleSourceCodeBlockSource = readFileSync(
  fileURLToPath(
    new URL(
      "../../agent-html-example/src/features/source-viewer/code-block.tsx",
      import.meta.url
    )
  ),
  "utf8"
)
const exampleBlockSummaryCodeSource = readFileSync(
  fileURLToPath(
    new URL(
      "../../agent-html-example/src/features/runtime-preview/block-summary-code.tsx",
      import.meta.url
    )
  ),
  "utf8"
)
const exampleRenderPanelSource = readFileSync(
  fileURLToPath(
    new URL(
      "../../agent-html-example/src/features/runtime-preview/render-panel.tsx",
      import.meta.url
    )
  ),
  "utf8"
)
const runtimeLazyChartSource = readFileSync(
  fileURLToPath(
    new URL(
      "../../../packages/agent-html/src/runtime/render/lazy-chart-runtime.tsx",
      import.meta.url
    )
  ),
  "utf8"
)
const runtimeSkeletonSource = readFileSync(
  fileURLToPath(
    new URL(
      "../../../packages/agent-html/src/runtime/ui/skeleton.tsx",
      import.meta.url
    )
  ),
  "utf8"
)

function extractConstCallback(source: string, name: string) {
  const start = source.indexOf(`const ${name} = React.useCallback`)
  expect(start).toBeGreaterThanOrEqual(0)
  const nextConst = source.indexOf("\n  const ", start + 1)

  return source.slice(start, nextConst === -1 ? undefined : nextConst)
}

describe("App source boundaries", () => {
  it("keeps workspace ownership in the workspace controller", () => {
    expect(appSource).toContain("useWorkspaceController")
    expect(appSource).not.toContain("createWorkspaceStore")
    expect(appSource).not.toContain("markCodexStartupEvent")
    expect(appSource).not.toContain("setProjects")
    expect(appSource).not.toContain("setOpenTabs")
    expect(appSource).not.toContain("getNextActiveTabId")
    expect(appSource).not.toContain("createWorkspaceSectionTab")
  })

  it("keeps gallery ownership in the gallery controller", () => {
    expect(appSource).toContain("useGalleryController")
    expect(appSource).toContain("galleryController.requestEnterGallery")
    expect(appSource).not.toContain('import("@/app/gallery/gallery-mode")')
    expect(appSource).not.toContain("<GalleryMode")
    expect(appSource).not.toContain("onControllerChange")
    expect(appSource).not.toContain("setGalleryController")
    expect(appSource).not.toContain("createGalleryComponentMarketStore")
    expect(appSource).not.toContain("GalleryEditorPanel")
    expect(appSource).not.toContain("GalleryMarketSidebar")
    expect(appSource).not.toContain("saveAppliedAppTheme")
    expect(appSource).not.toContain("updateAppThemeDraft")
    expect(appSource).not.toContain("setAppThemeDraft")
    const requestEnterGallerySource = extractConstCallback(
      galleryControllerSource,
      "requestEnterGallery"
    )
    expect(requestEnterGallerySource).not.toContain("setAppThemeDraft")
    expect(requestEnterGallerySource).not.toContain('setActiveViewId("theme")')
  })

  it("keeps shell composition in the app frame", () => {
    expect(appSource).toContain("AppFrame")
    expect(appSource).not.toContain("AppSidebar")
    expect(appSource).not.toContain("ConfirmationDialog")
    expect(appSource).not.toContain("SidebarProvider")
    expect(appSource).not.toContain("WorkspaceSurface")
  })

  it("keeps workspace mounted while gallery is visible", () => {
    expect(appFrameSource).toContain("activeThemeCssVariables")
    expect(appFrameSource).toContain("WindowChromeFrame style={activeThemeStyle}")
    expect(appFrameSource).toContain("isGalleryMode ? \"hidden\"")
    expect(appFrameSource).toContain("colorCssVariables={activeThemeCssVariables}")
    expect(appFrameSource).toContain("{isGalleryMode ? gallery.panel : null}")
    expect(appFrameSource).not.toContain("surfaceMode === \"gallery\" ? (")
    expect(appFrameSource).not.toContain("AppThemeScope")
  })

  it("keeps the settings menu behind the sidebar lazy boundary", () => {
    expect(appSidebarSource).toContain("React.lazy")
    expect(appSidebarSource).toContain('import("@/app/shell/settings-menu")')
    expect(appSidebarSource).not.toContain(
      'import { SettingsMenu } from "@/app/shell/settings-menu"'
    )
  })

  it("keeps secondary window apps behind the root lazy boundary", () => {
    expect(rootAppSource).toContain("React.lazy")
    expect(rootAppSource).toContain(
      'import("@/app/pet/host/thread-panel-window-app")'
    )
    expect(rootAppSource).toContain("ThreadPanelWindowStartupSkeleton")
    expect(rootAppSource).toContain("PetSettingsWindowStartupSkeleton")
    expect(rootAppSource).not.toContain("fallback={null}")
    expect(rootAppSource).not.toContain(
      'import { ThreadPanelWindowApp } from "@/app/pet/host/thread-panel-window-app"'
    )
  })

  it("keeps startup loading covered before workspace data is ready", () => {
    expect(appHtmlSource).toContain("data-app-startup-shell")
    expect(appHtmlSource).toContain("app-startup-workspace-surface")
    expect(workspaceControllerSource).toContain("isLoadingWorkspace")
    expect(appFrameSource).toContain("AppWorkspaceStartupSkeleton")
  })

  it("keeps an app entry bundle budget gate", () => {
    expect(verifyAppBundleSource).toContain("maxEntryBundleRawBytes")
    expect(verifyAppBundleSource).toContain("maxEntryBundleGzipBytes")
    expect(verifyAppBundleSource).toContain("largestEntryBundle")
    expect(verifyAppBundleSource).toContain("gzipSync")
    expect(verifyAppBundleSource).toContain("entry bundle raw size")
    expect(verifyAppBundleSource).toContain("entry bundle gzip size")
  })

  it("keeps an example entry bundle budget gate", () => {
    expect(verifyExampleBuildSource).toContain("maxEntryBundleRawBytes")
    expect(verifyExampleBuildSource).toContain("maxEntryBundleGzipBytes")
    expect(verifyExampleBuildSource).toContain("gzipSync")
    expect(verifyExampleBuildSource).toContain("entry bundle raw size")
    expect(verifyExampleBuildSource).toContain("entry bundle gzip size")
  })

  it("keeps the example source viewer on the shared highlighter boundary", () => {
    expect(exampleSourceCodeBlockSource).toContain("highlightCodeToHtml")
    expect(exampleSourceCodeBlockSource).not.toContain('from "shiki"')
    expect(exampleSourceCodeBlockSource).not.toContain(
      'from "@/agent-html/runtime/ui/code-highlighter"'
    )
    expect(exampleBlockSummaryCodeSource).toContain("highlightCodeToHtml")
    expect(exampleBlockSummaryCodeSource).not.toContain('from "shiki"')
    expect(exampleBlockSummaryCodeSource).not.toContain(
      'from "@/agent-html/runtime/ui/code-highlighter"'
    )
  })

  it("keeps the example runtime preview off the motion runtime", () => {
    expect(exampleRenderPanelSource).not.toContain('from "motion/react"')
    expect(exampleRenderPanelSource).not.toContain("<motion.")
  })

  it("keeps runtime loading fallbacks on runtime-owned primitives", () => {
    expect(runtimeLazyChartSource).toContain(
      'from "@/agent-html/runtime/ui/skeleton"'
    )
    expect(runtimeLazyChartSource).not.toContain("@/app/shared/ui/skeleton")
    expect(runtimeLazyChartSource).not.toContain("@/app/shared/ui/spinner")
    expect(runtimeSkeletonSource).not.toContain("@/app/shared/ui")
  })
})
