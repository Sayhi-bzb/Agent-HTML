import { afterEach, describe, expect, it, vi } from "vitest"

import {
  fetchPipelineThreads,
  submitBlockPromptToPipeline,
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
})
