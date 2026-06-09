import { afterEach, describe, expect, it, vi } from "vitest"

import {
  artifactLabel,
  deleteArtifact,
  fetchCodexThreads,
  hostApiRoutes,
  renameArtifact,
} from "./api"

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

describe("fetchCodexThreads", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("fetches normalized Codex threads", async () => {
    vi.stubGlobal("fetch", async (url: string) => {
      expect(url).toBe(hostApiRoutes.codexThreads)
      return {
        json: async () => ({
          cwd: "/repo",
          threads: [
            {
              id: "thread-1",
              name: "Canvas",
              preview: "Edit a block",
              status: null,
            },
          ],
        }),
        ok: true,
      } as Response
    })

    await expect(fetchCodexThreads()).resolves.toEqual({
      cwd: "/repo",
      threads: [
        {
          id: "thread-1",
          name: "Canvas",
          preview: "Edit a block",
          status: null,
        },
      ],
    })
  })
})

describe("artifact file operations", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("renames artifacts through the host API", async () => {
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      expect(url).toBe(hostApiRoutes.artifactRename)
      expect(init?.method).toBe("POST")
      expect(JSON.parse(String(init?.body))).toEqual({
        filePath: "agent-html/artifacts/old.artifact.tsx",
        nextFileName: "new",
      })

      return {
        json: async () => ({
          filePath: "agent-html/artifacts/new.artifact.tsx",
        }),
        ok: true,
      } as Response
    })

    await expect(
      renameArtifact({
        filePath: "agent-html/artifacts/old.artifact.tsx",
        nextFileName: "new",
      })
    ).resolves.toEqual({
      filePath: "agent-html/artifacts/new.artifact.tsx",
    })
  })

  it("deletes artifacts through the host API", async () => {
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      expect(url).toBe(hostApiRoutes.artifactDelete)
      expect(init?.method).toBe("POST")
      expect(JSON.parse(String(init?.body))).toEqual({
        filePath: "agent-html/artifacts/remove.artifact.tsx",
      })

      return {
        json: async () => ({ ok: true }),
        ok: true,
      } as Response
    })

    await expect(
      deleteArtifact({
        filePath: "agent-html/artifacts/remove.artifact.tsx",
      })
    ).resolves.toEqual({ ok: true })
  })
})
