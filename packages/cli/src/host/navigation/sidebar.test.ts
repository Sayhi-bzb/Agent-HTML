import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const sidebarPath = fileURLToPath(new URL("./sidebar.tsx", import.meta.url))
const sidebarSource = readFileSync(sidebarPath, "utf8")

describe("ReactCanvasSidebar artifact rows", () => {
  it("does not attach tooltip or native title props to artifact rows", () => {
    const artifactRowSource = sidebarSource.slice(
      sidebarSource.indexOf("function ArtifactSidebarItem"),
      sidebarSource.indexOf("function shortCodexThreadId")
    )

    expect(artifactRowSource).toContain("const label = artifactLabel(artifact.filePath)")
    expect(artifactRowSource).toContain("label={label}")
    expect(artifactRowSource).toContain("onClick={() => onSelectArtifact(artifact.filePath)}")
    expect(artifactRowSource).not.toContain("tooltip=")
    expect(artifactRowSource).not.toContain("title=")
  })

  it("uses a dropdown command menu with dialog-backed management actions", () => {
    const artifactRowSource = sidebarSource.slice(
      sidebarSource.indexOf("function ArtifactSidebarItem"),
      sidebarSource.indexOf("function shortCodexThreadId")
    )

    expect(artifactRowSource).toContain("<DropdownMenu>")
    expect(artifactRowSource).toContain("Artifact actions")
    expect(artifactRowSource).toContain('label="Rename"')
    expect(artifactRowSource).toContain('label="Delete"')
    expect(artifactRowSource).toContain("<Dialog ")
    expect(artifactRowSource).toContain("<AlertDialog ")
  })
})
