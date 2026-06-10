import path from "node:path"

import { describe, expect, it } from "vitest"

import { createArtifactScaffold } from "./artifact-scaffold.mjs"

describe("artifact scaffold", () => {
  it("creates a minimal Canvas artifact source from an entry path and request", () => {
    const source = createArtifactScaffold({
      entryPath: path.join(
        "agent-html",
        "artifacts",
        "build-dashboard.artifact.tsx"
      ),
      request: "Build a dashboard",
    })

    expect(source).toContain('import { Artifact, Block } from "@agent-html/react"')
    expect(source).toContain("export default function BuildDashboardArtifact()")
    expect(source).toContain('<Block id="overview" title="Overview">')
    expect(source).toContain('{"Build a dashboard"}')
  })
})
