import { afterEach, describe, expect, it, vi } from "vitest"

import {
  artifactLabel,
  artifactBundleUrl,
  createArtifact,
  deleteArtifact,
  fetchArtifacts,
  fetchCodexThreads,
  fetchCodexTranscript,
  fontStylesheetUrl,
  hostApiRoutes,
  isArtifactBundleUrl,
  publishCanvasInspection,
  publicAssetUrl,
  renameArtifact,
  renameArtifactTitle,
  reorderCanvasNodes,
  reparentCanvasNodes,
  saveCanvasLayoutPatch,
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
    const url = artifactBundleUrl(
      "agent-html/artifacts/example.artifact.tsx",
      3
    )

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
          diagnostics: [],
          status: "ready",
          version: 1,
        }),
        ok: true,
      } as Response
    })

    await expect(fetchArtifacts()).resolves.toMatchObject({
      artifacts: [],
      diagnostics: [],
    })
  })

  it("requests a refreshed artifact registry snapshot for pending polling", async () => {
    vi.stubGlobal("fetch", async (url: string) => {
      expect(url).toBe(`${hostApiRoutes.artifacts}?refresh=1`)
      return {
        json: async () => ({
          artifacts: [],
          diagnostics: [],
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
    vi.stubGlobal(
      "fetch",
      async () =>
        new Response("<!doctype html><html></html>", {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
          status: 200,
        })
    )

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

describe("fetchCodexTranscript", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("loads the normalized read-only thread history", async () => {
    vi.stubGlobal("fetch", async (url: string) => {
      expect(url).toBe(`${hostApiRoutes.codexTranscript}?threadId=thread-1`)
      return new Response(
        JSON.stringify({
          notifications: [],
          threadId: "thread-1",
          turns: [
            {
              id: "turn-1",
              items: [
                {
                  contentText: "Build the workspace tabs",
                  id: "item-1",
                  type: "userMessage",
                },
              ],
            },
          ],
        }),
        { headers: { "Content-Type": "application/json" } }
      )
    })

    await expect(fetchCodexTranscript("thread-1")).resolves.toMatchObject({
      threadId: "thread-1",
      turns: [{ id: "turn-1" }],
    })
  })
})

describe("Canvas inspection transport", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("publishes the versioned Canonical Store document", async () => {
    const document = {
      active: true,
      nodes: [
        {
          height: 80,
          id: "card",
          siblingOrder: 0,
          sources: ["agent-html/canvases/demo.canvas.tsx"],
          width: 100,
          x: 0,
          y: 0,
        },
      ],
      sourceFilePath: "agent-html/canvases/demo.canvas.tsx",
      version: 2 as const,
    }
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      expect(url).toBe(hostApiRoutes.canvasInspection)
      expect(init?.method).toBe("POST")
      expect(JSON.parse(String(init?.body))).toEqual({ document })
      return new Response(
        JSON.stringify({ ok: true, sourceFilePath: document.sourceFilePath }),
        { headers: { "Content-Type": "application/json" } }
      )
    })

    await expect(publishCanvasInspection(document)).resolves.toEqual({
      ok: true,
      sourceFilePath: document.sourceFilePath,
    })
  })

  it("persists dirty Canvas Node geometry as a patch", async () => {
    const filePath = "agent-html/canvases/demo.canvas.tsx"
    const nodes = {
      card: { height: 180, width: 320, x: 40, y: 60 },
    }
    const removedNodeIds = ["old-card"]
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      expect(url).toBe(hostApiRoutes.canvasLayout)
      expect(init?.method).toBe("POST")
      expect(JSON.parse(String(init?.body))).toEqual({
        filePath,
        nodes,
        removedNodeIds,
      })
      return new Response(
        JSON.stringify({
          nodes,
          removedNodeIds,
        }),
        { headers: { "Content-Type": "application/json" } }
      )
    })

    await expect(
      saveCanvasLayoutPatch({ filePath, nodes, removedNodeIds })
    ).resolves.toEqual({ nodes, removedNodeIds })
  })

  it("reparents Canvas Nodes through the hierarchy route", async () => {
    const request = {
      filePath: "agent-html/canvases/demo.canvas.tsx",
      nodeIds: ["card"],
      parentId: "group",
    }
    const result = {
      geometries: {
        card: { height: 180, width: 320, x: -40, y: 20 },
      },
      movedNodeIds: ["card"],
      parentId: "group",
    }
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      expect(url).toBe(hostApiRoutes.canvasReparent)
      expect(init?.method).toBe("POST")
      expect(JSON.parse(String(init?.body))).toEqual(request)
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      })
    })

    await expect(reparentCanvasNodes(request)).resolves.toEqual(result)
  })

  it("reorders Canvas Nodes through the layer route", async () => {
    const request = {
      action: "bring-to-front" as const,
      filePath: "agent-html/canvases/demo.canvas.tsx",
      nodeIds: ["a"],
    }
    const result = {
      action: "bring-to-front" as const,
      groups: [{ nodeIds: ["b", "a"], parentId: null }],
    }
    vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
      expect(url).toBe(hostApiRoutes.canvasReorder)
      expect(init?.method).toBe("POST")
      expect(JSON.parse(String(init?.body))).toEqual(request)
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      })
    })

    await expect(reorderCanvasNodes(request)).resolves.toEqual(result)
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

  it("renames artifact titles through the host API", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (url, init) => {
        expect(url).toBe(hostApiRoutes.artifactTitle)
        expect(JSON.parse(String(init?.body))).toEqual({
          filePath: "agent-html/artifacts/demo.artifact.tsx",
          title: "New title",
        })
        return new Response(
          JSON.stringify({
            filePath: "agent-html/artifacts/demo.artifact.tsx",
            title: "New title",
          }),
          { headers: { "Content-Type": "application/json" } }
        )
      })

    await expect(
      renameArtifactTitle({
        filePath: "agent-html/artifacts/demo.artifact.tsx",
        title: "New title",
      })
    ).resolves.toEqual({
      filePath: "agent-html/artifacts/demo.artifact.tsx",
      title: "New title",
    })
    fetchMock.mockRestore()
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
