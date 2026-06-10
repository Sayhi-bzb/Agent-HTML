import { describe, expect, it } from "vitest"

import {
  shouldBlockArtifactWithError,
  shouldShowArtifactSkeleton,
} from "./artifact-surface-state"

describe("shouldShowArtifactSkeleton", () => {
  it("shows skeleton while the artifact list is loading", () => {
    expect(
      shouldShowArtifactSkeleton({
        activeFilePath: null,
        artifactCount: 0,
        artifactsLoading: true,
        error: null,
        loadError: null,
        mountedFilePath: null,
        status: "idle",
      })
    ).toBe(true)
  })

  it("shows skeleton while the active artifact bundle is loading", () => {
    expect(
      shouldShowArtifactSkeleton({
        activeFilePath: "agent-html/artifacts/example.artifact.tsx",
        artifactCount: 1,
        artifactsLoading: false,
        error: null,
        loadError: null,
        mountedFilePath: null,
        status: "loading",
      })
    ).toBe(true)
  })

  it("hides skeleton for errors and empty completed loads", () => {
    expect(
      shouldShowArtifactSkeleton({
        activeFilePath: "agent-html/artifacts/example.artifact.tsx",
        artifactCount: 1,
        artifactsLoading: false,
        error: "Failed",
        loadError: null,
        mountedFilePath: null,
        status: "failed",
      })
    ).toBe(false)

    expect(
      shouldShowArtifactSkeleton({
        activeFilePath: null,
        artifactCount: 0,
        artifactsLoading: false,
        error: null,
        loadError: null,
        mountedFilePath: null,
        status: "idle",
      })
    ).toBe(false)
  })
})

describe("shouldBlockArtifactWithError", () => {
  it("does not block the mounted artifact for a nonblocking load issue", () => {
    expect(
      shouldBlockArtifactWithError({
        activeFilePath: "agent-html/artifacts/current.artifact.tsx",
        error: "Bundle load failed",
        loadError: null,
        mountedFilePath: "agent-html/artifacts/current.artifact.tsx",
      })
    ).toBe(false)
  })

  it("blocks when the active artifact has no mounted surface", () => {
    expect(
      shouldBlockArtifactWithError({
        activeFilePath: "agent-html/artifacts/next.artifact.tsx",
        error: "Bundle load failed",
        loadError: null,
        mountedFilePath: "agent-html/artifacts/current.artifact.tsx",
      })
    ).toBe(true)
  })
})
