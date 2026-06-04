import { describe, expect, it } from "vitest"

import { shouldShowArtifactSkeleton } from "./artifact-surface"

describe("shouldShowArtifactSkeleton", () => {
  it("shows skeleton while the artifact list is loading", () => {
    expect(
      shouldShowArtifactSkeleton({
        activeFilePath: null,
        artifactCount: 0,
        artifactLoading: false,
        artifactsLoading: true,
        error: null,
        loadError: null,
        mountedFilePath: null,
      })
    ).toBe(true)
  })

  it("shows skeleton while the active artifact bundle is loading", () => {
    expect(
      shouldShowArtifactSkeleton({
        activeFilePath: ".agent-html/artifacts/example.agent.tsx",
        artifactCount: 1,
        artifactLoading: true,
        artifactsLoading: false,
        error: null,
        loadError: null,
        mountedFilePath: null,
      })
    ).toBe(true)
  })

  it("hides skeleton for errors and empty completed loads", () => {
    expect(
      shouldShowArtifactSkeleton({
        activeFilePath: ".agent-html/artifacts/example.agent.tsx",
        artifactCount: 1,
        artifactLoading: true,
        artifactsLoading: false,
        error: "Failed",
        loadError: null,
        mountedFilePath: null,
      })
    ).toBe(false)

    expect(
      shouldShowArtifactSkeleton({
        activeFilePath: null,
        artifactCount: 0,
        artifactLoading: false,
        artifactsLoading: false,
        error: null,
        loadError: null,
        mountedFilePath: null,
      })
    ).toBe(false)
  })
})
