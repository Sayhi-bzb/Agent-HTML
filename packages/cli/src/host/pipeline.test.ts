import { afterEach, describe, expect, it, vi } from "vitest"

import {
  fetchPipelineThreads,
  submitBlockPromptToPipeline,
  submitCreateArtifactToPipeline,
  submitGuardFixRequestToPipeline,
} from "./pipeline"
import { hostApiRoutes } from "./api/api"

describe("host pipeline adapters", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("serves an example thread without calling Codex routes", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      fetchPipelineThreads({ pipeline: "example" })
    ).resolves.toMatchObject({
      cwd: "agent-html example",
      threads: [
        {
          id: "example-thread",
          name: "Example session",
        },
      ],
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("returns deterministic example turns without calling Codex routes", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      submitBlockPromptToPipeline({
        activeThreadId: null,
        blockId: "summary",
        filePath: "agent-html/artifacts/demo.artifact.tsx",
        pipeline: "example",
        request: "Update copy",
      })
    ).resolves.toEqual({
      startedNewThread: true,
      threadId: "example-thread",
      turnId: "example-turn",
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("rejects example artifact creation without calling Codex routes", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      submitCreateArtifactToPipeline({
        activeThreadId: null,
        filePath: "agent-html/artifacts/new-artifact.artifact.tsx",
        pipeline: "example",
        request: "Build a dashboard",
      })
    ).rejects.toThrow("Artifact creation is disabled in the example pipeline.")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("uses Codex routes for the Codex pipeline", async () => {
    vi.stubGlobal("CustomEvent", class {
      detail: unknown

      constructor(_type: string, init?: { detail?: unknown }) {
        this.detail = init?.detail
      }
    })
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
      localStorage: {
        getItem: vi.fn(() => null),
      },
    })
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (String(url).startsWith(hostApiRoutes.blockImplementation)) {
        return {
          json: async () => ({
            implementationPath: "agent-html/artifacts/demo/summary.block.tsx",
          }),
          ok: true,
        } as Response
      }

      expect(url).toBe(hostApiRoutes.codexTurn)
      expect(init?.method).toBe("POST")
      expect(JSON.parse(String(init?.body))).toMatchObject({
        threadId: "thread-1",
      })

      return {
        json: async () => ({
          startedNewThread: false,
          threadId: "thread-1",
          turnId: "turn-1",
        }),
        ok: true,
      } as Response
    })
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      submitBlockPromptToPipeline({
        activeThreadId: "thread-1",
        blockId: "summary",
        filePath: "agent-html/artifacts/demo.artifact.tsx",
        pipeline: "codex",
        request: "Update copy",
      })
    ).resolves.toEqual({
      startedNewThread: false,
      threadId: "thread-1",
      turnId: "turn-1",
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("uses Codex routes for Codex artifact creation", async () => {
    vi.stubGlobal("CustomEvent", class {
      detail: unknown

      constructor(_type: string, init?: { detail?: unknown }) {
        this.detail = init?.detail
      }
    })
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
      localStorage: {
        getItem: vi.fn(() => null),
      },
    })
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toBe(hostApiRoutes.codexTurn)
      expect(init?.method).toBe("POST")
      const body = JSON.parse(String(init?.body))
      expect(body.threadId).toBeNull()
      expect(body.prompt).toContain("agent-html/artifacts/new-artifact.artifact.tsx")
      expect(body.prompt).toContain("Build a dashboard")

      return {
        json: async () => ({
          startedNewThread: true,
          threadId: "thread-new",
          turnId: "turn-new",
        }),
        ok: true,
      } as Response
    })
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      submitCreateArtifactToPipeline({
        activeThreadId: null,
        filePath: "agent-html/artifacts/new-artifact.artifact.tsx",
        pipeline: "codex",
        request: "Build a dashboard",
      })
    ).resolves.toEqual({
      filePath: "agent-html/artifacts/new-artifact.artifact.tsx",
      startedNewThread: true,
      threadId: "thread-new",
      turnId: "turn-new",
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("returns deterministic example guard fix turns without calling Codex routes", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      submitGuardFixRequestToPipeline({
        activeThreadId: null,
        filePath: "agent-html/artifacts/demo.artifact.tsx",
        issues: [
          {
            filePath: "agent-html/artifacts/demo.artifact.tsx",
            message: "Unsafe className.",
            severity: "warning",
          },
          {
            filePath: "agent-html/artifacts/demo.artifact.tsx",
            guardScope: "workspace-boundary",
            line: 4,
            message: "Import crosses the React Canvas boundary.",
            severity: "error",
            suggestion: "Import from local agent-html source.",
          },
        ],
        pipeline: "example",
      })
    ).resolves.toEqual({
      startedNewThread: true,
      threadId: "example-thread",
      turnId: "example-guard-fix-turn",
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("sends only guard errors to Codex guard fix requests", async () => {
    vi.stubGlobal("CustomEvent", class {
      detail: unknown

      constructor(_type: string, init?: { detail?: unknown }) {
        this.detail = init?.detail
      }
    })
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
      localStorage: {
        getItem: vi.fn(() => null),
      },
    })
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toBe(hostApiRoutes.codexTurn)
      expect(init?.method).toBe("POST")
      const body = JSON.parse(String(init?.body))
      expect(body.threadId).toBe("thread-1")
      expect(body.prompt).toContain("task: fix-canvas-guard-errors")
      expect(body.prompt).toContain("agent-html/artifacts/demo.artifact.tsx")
      expect(body.prompt).toContain("workspace-boundary line 4")
      expect(body.prompt).toContain("Import crosses the React Canvas boundary.")
      expect(body.prompt).toContain("Import from local agent-html source.")
      expect(body.prompt).not.toContain("Unsafe className.")

      return {
        json: async () => ({
          startedNewThread: false,
          threadId: "thread-1",
          turnId: "guard-turn-1",
        }),
        ok: true,
      } as Response
    })
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      submitGuardFixRequestToPipeline({
        activeThreadId: "thread-1",
        filePath: "agent-html/artifacts/demo.artifact.tsx",
        issues: [
          {
            filePath: "agent-html/artifacts/demo.artifact.tsx",
            message: "Unsafe className.",
            severity: "warning",
          },
          {
            filePath: "agent-html/artifacts/demo.artifact.tsx",
            guardScope: "workspace-boundary",
            line: 4,
            message: "Import crosses the React Canvas boundary.",
            severity: "error",
            suggestion: "Import from local agent-html source.",
          },
        ],
        pipeline: "codex",
      })
    ).resolves.toEqual({
      startedNewThread: false,
      threadId: "thread-1",
      turnId: "guard-turn-1",
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
