import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { resolveArtifactRefreshState } from "./artifact/artifact-refresh-state"

const appPath = fileURLToPath(new URL("./app.tsx", import.meta.url))
const appSource = readFileSync(appPath, "utf8")

describe("ReactCanvasHostApp prompt status copy", () => {
  it("only keeps error-oriented prompt status copy", () => {
    expect(appSource).not.toContain("Sending to Codex")
    expect(appSource).not.toContain("Sending to example pipeline")
    expect(appSource).not.toContain("Sent to Codex thread")
    expect(appSource).not.toContain("Started a new Codex thread")
    expect(appSource).not.toContain("Sent to example pipeline")
    expect(appSource).toContain('setPromptStatus("No active artifact.")')
    expect(appSource).toContain("setPromptStatus(errorMessage)")
  })
})

describe("resolveArtifactRefreshState", () => {
  const artifacts = [
    {
      blocks: [],
      filePath: "agent-html/artifacts/current.artifact.tsx",
    },
    {
      blocks: [],
      filePath: "agent-html/artifacts/pending.artifact.tsx",
    },
  ]

  it("activates a pending artifact once it appears in the registry", () => {
    expect(
      resolveArtifactRefreshState({
        artifacts,
        currentFilePath: "agent-html/artifacts/current.artifact.tsx",
        pendingFilePath: "agent-html/artifacts/pending.artifact.tsx",
        storedFilePath: null,
      })
    ).toEqual({
      activeFilePath: "agent-html/artifacts/pending.artifact.tsx",
      pendingReady: true,
    })
  })

  it("keeps the current artifact when it remains available", () => {
    expect(
      resolveArtifactRefreshState({
        artifacts,
        currentFilePath: "agent-html/artifacts/current.artifact.tsx",
        pendingFilePath: null,
        storedFilePath: "agent-html/artifacts/pending.artifact.tsx",
      })
    ).toEqual({
      activeFilePath: "agent-html/artifacts/current.artifact.tsx",
      pendingReady: false,
    })
  })
})
