import { afterEach, describe, expect, it, vi } from "vitest"

import { artifactLabel, fetchCodexThreads, hostApiRoutes } from "./api"

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
