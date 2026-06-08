import { describe, expect, it } from "vitest"

import { artifactLabel } from "./api"

describe("artifactLabel", () => {
  it("removes the artifact entry suffix from workspace paths", () => {
    expect(
      artifactLabel(
        "agent-html/artifacts/project-visual-explainer.artifact.tsx"
      )
    ).toBe("project-visual-explainer")
  })

  it("handles Windows path separators", () => {
    expect(
      artifactLabel(
        "agent-html\\artifacts\\project-visual-explainer.artifact.tsx"
      )
    ).toBe("project-visual-explainer")
  })

  it("keeps non-artifact filenames unchanged", () => {
    expect(artifactLabel("agent-html/artifacts/README.md")).toBe("README.md")
  })
})
