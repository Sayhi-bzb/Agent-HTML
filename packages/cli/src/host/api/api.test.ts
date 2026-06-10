import { afterEach, describe, expect, it, vi } from "vitest"

import {
  artifactLabel,
  artifactBundleUrl,
  createArtifact,
  deleteArtifact,
  fetchArtifacts,
  fetchCodexThreads,
  fontStylesheetUrl,
  hostApiRoutes,
  isArtifactBundleUrl,
  publicAssetUrl,
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

describe("host API route helpers", () => {
  it("owns artifact bundle URLs", () => {
    const url = artifactBundleUrl("agent-html/artifacts/example.artifact.tsx", 3)

    expect(url).toBe(
      "/__agent-html/artifact.js?filePath=agent-html%2Fartifacts%2Fexample.artifact.tsx&v=3"
    )
    expect(isArtifactBundleUrl(url)).toBe(true)
    expect(isArtifactBundleUrl("/__agent-html/artifacts")).toBe(false)
  })

  it("owns proxied font stylesheet URLs", () => {
    expect(
      fontStylesheetUrl("https://fontsapi.zeoseven.com/570/main/result.css")
    ).toBe(
      "/__agent-html/font-stylesheet?url=https%3A%2F%2Ffontsapi.zeoseven.com%2F570%2Fmain%2Fresult.css"
    )
  })

  it("owns public asset URLs", () => {
    expect(publicAssetUrl("ghost.svg")).toBe("/__agent-html/public/ghost.svg")
    expect(publicAssetUrl("/ghost.svg")).toBe("/__agent-html/public/ghost.svg")
  })
})

describe("fetchArtifacts", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("fetches the current artifact registry snapshot by default", async () => {
    vi.stubGlobal("fetch", async (url: string) => {
      expect(url).toBe(hostApiRoutes.artifacts)
      return {
        json: async () => ({
          artifacts: [],
          guardIssues: [],
          status: "ready",
          version: 1,
        }),
        ok: true,
      } as Response
    })

    await expect(fetchArtifacts()).resolves.toMatchObject({
      artifacts: [],
      guardIssues: [],
    })
  })

  it("requests a refreshed artifact registry snapshot for pending polling", async () => {
    vi.stubGlobal("fetch", async (url: string) => {
      expect(url).toBe(`${hostApiRoutes.artifacts}?refresh=1`)
      return {
        json: async () => ({
          artifacts: [],
          guardIssues: [],
          status: "ready",
          version: 2,
        }),
        ok: true,
      } as Response
    })

    await expect(fetchArtifacts({ refresh: true })).resolves.toMatchObject({
      version: 2,
    })
  })

  it("reports HTML responses from host API routes explicitly", async () => {
    vi.stubGlobal("fetch", async () => new Response("<!doctype html><html></html>", {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
      status: 200,
    }))

    await expect(fetchArtifacts()).rejects.toThrow(
      "Host API route returned HTML instead of JSON: /__agent-html/artifacts"
    )
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

  it("creates artifacts through the host API", async () => {
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      expect(url).toBe(hostApiRoutes.artifactCreate)
      expect(init?.method).toBe("POST")
      expect(JSON.parse(String(init?.body))).toEqual({
        filePath: "agent-html/artifacts/new.artifact.tsx",
        request: "Build a dashboard",
      })

      return {
        json: async () => ({
          filePath: "agent-html/artifacts/new.artifact.tsx",
        }),
        ok: true,
      } as Response
    })

    await expect(
      createArtifact({
        filePath: "agent-html/artifacts/new.artifact.tsx",
        request: "Build a dashboard",
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
