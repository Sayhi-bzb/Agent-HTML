import { describe, expect, it } from "vitest"

import { resolveArtifactRefreshState } from "./app"

const exampleArtifacts = [
  {
    blocks: [],
    filePath: "agent-html/artifacts/current.artifact.tsx",
  },
  {
    blocks: [],
    filePath: "agent-html/artifacts/rename.artifact.tsx",
  },
]

describe("resolveArtifactRefreshState", () => {
  it("selects the pending artifact when discovery finds it", () => {
    expect(
      resolveArtifactRefreshState({
        artifacts: exampleArtifacts,
        currentFilePath: "agent-html/artifacts/current.artifact.tsx",
        pendingFilePath: "agent-html/artifacts/rename.artifact.tsx",
        storedFilePath: null,
      })
    ).toEqual({
      activeFilePath: "agent-html/artifacts/rename.artifact.tsx",
      pendingReady: true,
    })
  })

  it("keeps the current artifact while the pending artifact is missing", () => {
    expect(
      resolveArtifactRefreshState({
        artifacts: [exampleArtifacts[0]],
        currentFilePath: "agent-html/artifacts/current.artifact.tsx",
        pendingFilePath: "agent-html/artifacts/rename.artifact.tsx",
        storedFilePath: null,
      })
    ).toEqual({
      activeFilePath: "agent-html/artifacts/current.artifact.tsx",
      pendingReady: false,
    })
  })

  it("falls back to stored preferences before the first artifact", () => {
    expect(
      resolveArtifactRefreshState({
        artifacts: exampleArtifacts,
        currentFilePath: "agent-html/artifacts/missing.artifact.tsx",
        pendingFilePath: null,
        storedFilePath: "agent-html/artifacts/rename.artifact.tsx",
      })
    ).toEqual({
      activeFilePath: "agent-html/artifacts/rename.artifact.tsx",
      pendingReady: false,
    })
  })
})
