import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const surfacePath = fileURLToPath(new URL("./surface.tsx", import.meta.url))
const surfaceSource = readFileSync(surfacePath, "utf8")

describe("workspace surface boundaries", () => {
  it("keeps document persistence out of the surface composition layer", () => {
    expect(surfaceSource).not.toContain("getProjectSectionDocument")
    expect(surfaceSource).not.toContain("updateProjectSectionDocument")
    expect(surfaceSource).not.toContain("renderWorkspaceDocument")
  })

  it("keeps thread repository ownership out of the surface composition layer", () => {
    expect(surfaceSource).not.toContain("listProjectCodexThreads")
    expect(surfaceSource).not.toContain("upsertProjectCodexThreadLink")
    expect(surfaceSource).not.toContain("touchProjectCodexThreadLink")
    expect(surfaceSource).not.toContain("deleteProjectCodexThreadLink")
  })

  it("keeps agent delivery details and large picker UI out of surface", () => {
    expect(surfaceSource).not.toContain("deliverAgentHtmlIntent")
    expect(surfaceSource).not.toContain("function ProjectThreadPickerContent")
    expect(surfaceSource).not.toContain("function SaveStatus")
  })
})
