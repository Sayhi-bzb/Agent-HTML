import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

const sidebarSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "sidebar.tsx"),
  "utf8"
)
const appSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "../app.tsx"),
  "utf8"
)

describe("Canvas sidebar composition", () => {
  it("keeps Artifact search without rendering an Artifact content list", () => {
    expect(sidebarSource).toContain("<ReactCanvasArtifactSearch")
    expect(sidebarSource).toContain("<SidebarContent>")
    expect(sidebarSource).toContain("<ReactCanvasThemeEditor")
    expect(sidebarSource).not.toContain("ArtifactSidebarItem")
    expect(sidebarSource).not.toContain("ReactCanvasArtifactListSkeleton")
    expect(sidebarSource).not.toContain("canvas-sidebar-artifact-list")
    expect(sidebarSource).not.toContain("onRenameArtifact")
    expect(sidebarSource).not.toContain("onRequestDeleteArtifact")
  })

  it("keeps the Search trigger in standalone Canvas and hides it in Desktop", () => {
    expect(sidebarSource).toContain("showTrigger")
    expect(sidebarSource).toContain("onOpenChange")
    expect(appSource).toContain("showArtifactSearchAction={")
    expect(appSource).toContain("window.parent === window")
    expect(appSource).toContain("isArtifactSearchShortcut(event)")
    expect(appSource).toContain('onOpenArtifactSearch: () =>')
  })
})
