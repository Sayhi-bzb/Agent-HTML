import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

const sidebarSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "sidebar.tsx"),
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
})
