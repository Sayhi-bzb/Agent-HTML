import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const appSource = readFileSync(
  fileURLToPath(new URL("./App.tsx", import.meta.url)),
  "utf8"
)

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
    expect(appSource).not.toContain("createGalleryComponentMarketStore")
    expect(appSource).not.toContain("GalleryEditorPanel")
    expect(appSource).not.toContain("GalleryMarketSidebar")
    expect(appSource).not.toContain("saveAppliedAppTheme")
    expect(appSource).not.toContain("updateAppThemeDraft")
    expect(appSource).not.toContain("setAppThemeDraft")
  })

  it("keeps shell composition in the app frame", () => {
    expect(appSource).toContain("AppFrame")
    expect(appSource).not.toContain("AppSidebar")
    expect(appSource).not.toContain("ConfirmationDialog")
    expect(appSource).not.toContain("SidebarProvider")
    expect(appSource).not.toContain("WorkspaceSurface")
  })
})
