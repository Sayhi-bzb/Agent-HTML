import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const createArtifactSurfacePath = fileURLToPath(
  new URL("./create-artifact-surface.tsx", import.meta.url)
)
const createArtifactSurfaceSource = readFileSync(
  createArtifactSurfacePath,
  "utf8"
)

describe("CreateArtifactSurface copy", () => {
  it("uses artifact creation copy instead of chat copy", () => {
    expect(createArtifactSurfaceSource).toContain(
      'placeholder="Describe the artifact to build..."'
    )
    expect(createArtifactSurfaceSource).not.toContain("Ask, Search or Chat")
  })

  it("shows pending creation without exposing the target file path", () => {
    expect(createArtifactSurfaceSource).toContain("pending")
    expect(createArtifactSurfaceSource).toContain("Creating")
    expect(createArtifactSurfaceSource).not.toContain("pendingFilePath")
    expect(createArtifactSurfaceSource).not.toContain("artifact-pending-path")
  })
})
