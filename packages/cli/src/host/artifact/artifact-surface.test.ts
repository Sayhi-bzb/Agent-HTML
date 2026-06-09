import { describe, expect, it } from "vitest"

import {
  formatArtifactLoadError,
  shouldShowArtifactSkeleton,
} from "./artifact-surface"

describe("formatArtifactLoadError", () => {
  it("adds artifact module context to dynamic import fetch failures", () => {
    const bundleUrl =
      "/__agent-html/artifact.js?filePath=agent-html%2Fartifacts%2Fdemo.artifact.tsx&v=1"

    expect(
      formatArtifactLoadError({
        bundleUrl,
        error: new Error(
          "Failed to fetch dynamically imported module: http://127.0.0.1:5177/__agent-html/artifact.js"
        ),
      })
    ).toContain(`Module: ${bundleUrl}`)
  })

  it("preserves specific thrown module errors", () => {
    expect(
      formatArtifactLoadError({
        bundleUrl: "/__agent-html/artifact.js?filePath=demo",
        error: new Error("Unable to transform module: /__agent-html/artifact.js"),
      })
    ).toBe("Unable to transform module: /__agent-html/artifact.js")
  })
})

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
        activeFilePath: "agent-html/artifacts/example.artifact.tsx",
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
        activeFilePath: "agent-html/artifacts/example.artifact.tsx",
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
