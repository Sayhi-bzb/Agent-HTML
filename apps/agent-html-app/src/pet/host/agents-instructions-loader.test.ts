import { describe, expect, it, vi } from "vitest"

import { loadAgentsInstructions } from "./agents-instructions-loader"

describe("loadAgentsInstructions", () => {
  it("loads root instructions from the workspace store first", async () => {
    const codexRequest = vi.fn()
    const trace = vi.fn()

    await expect(
      loadAgentsInstructions({
        codexRequest,
        path: "D:\\AgentHTML\\AGENTS.md",
        readWorkspaceInstructions: () => Promise.resolve("# Workspace\n"),
        sequence: 1,
        trace,
      })
    ).resolves.toEqual({
      source: "workspace",
      text: "# Workspace\n",
    })

    expect(codexRequest).not.toHaveBeenCalled()
    expect(trace).toHaveBeenCalledWith(
      "settings:agents:workspace-read:ok",
      expect.objectContaining({ length: 12, sequence: 1 })
    )
  })

  it("falls back to Codex when workspace read fails", async () => {
    const codexRequest = vi.fn().mockResolvedValue({ content: "# Codex\n" })

    await expect(
      loadAgentsInstructions({
        codexRequest,
        path: "D:\\AgentHTML\\AGENTS.md",
        readWorkspaceInstructions: () =>
          Promise.reject(new Error("workspace unavailable")),
        sequence: 2,
      })
    ).resolves.toEqual({
      source: "codex",
      text: "# Codex\n",
    })

    expect(codexRequest).toHaveBeenCalledWith("fs/readFile", {
      path: "D:\\AgentHTML\\AGENTS.md",
    })
  })

  it("times out the workspace read and still settles with Codex fallback", async () => {
    vi.useFakeTimers()
    const codexRequest = vi.fn().mockResolvedValue("# Codex\n")
    const loadPromise = loadAgentsInstructions({
      codexRequest,
      path: "D:\\AgentHTML\\AGENTS.md",
      readWorkspaceInstructions: () => new Promise<string>(() => {}),
      sequence: 3,
      timeoutMs: 5,
    })

    await vi.advanceTimersByTimeAsync(5)

    await expect(loadPromise).resolves.toEqual({
      source: "codex",
      text: "# Codex\n",
    })
    vi.useRealTimers()
  })

  it("rejects when both workspace and Codex reads fail", async () => {
    await expect(
      loadAgentsInstructions({
        codexRequest: () => Promise.reject(new Error("codex unavailable")),
        path: "D:\\AgentHTML\\AGENTS.md",
        readWorkspaceInstructions: () =>
          Promise.reject(new Error("workspace unavailable")),
        sequence: 4,
      })
    ).rejects.toThrow("codex unavailable")
  })
})
