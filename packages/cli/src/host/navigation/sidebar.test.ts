import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const sidebarPath = fileURLToPath(new URL("./sidebar.tsx", import.meta.url))
const sidebarSource = readFileSync(sidebarPath, "utf8")

describe("ReactCanvasSidebar artifact rows", () => {
  it("does not attach tooltip or native title props to artifact rows", () => {
    const artifactRowSource = sidebarSource.slice(
      sidebarSource.indexOf("artifacts.map((artifact) => {"),
      sidebarSource.indexOf("</HostSidebarAction>", sidebarSource.indexOf("artifacts.map((artifact) => {"))
    )

    expect(artifactRowSource).toContain("label={artifactLabel(artifact.filePath)}")
    expect(artifactRowSource).toContain("onClick={() => onSelectArtifact(artifact.filePath)}")
    expect(artifactRowSource).not.toContain("tooltip=")
    expect(artifactRowSource).not.toContain("title=")
  })
})
