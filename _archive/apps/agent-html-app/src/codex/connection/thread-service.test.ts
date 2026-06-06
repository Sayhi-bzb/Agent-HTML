import { describe, expect, it, vi } from "vitest"

import { codexThreadService } from "./thread-service"

describe("codexThreadService", () => {
  it("lists threads with cwd-scoped params", async () => {
    const request = vi.fn().mockResolvedValue({
      data: [{ id: "thr_1", title: "One" }],
    })

    await expect(
      codexThreadService.listThreads({ cwd: "D:/AgentHTML", request })
    ).resolves.toEqual({
      items: [
        {
          createdAt: undefined,
          id: "thr_1",
          name: "One",
          status: null,
          updatedAt: undefined,
        },
      ],
    })

    expect(request).toHaveBeenCalledWith("thread/list", {
      cwd: "D:/AgentHTML",
      limit: 50,
      sortKey: "updated_at",
      sourceKinds: ["appServer", "vscode", "cli"],
    })
  })

  it("keeps thread lists scoped to the Codex cwd", async () => {
    const request = vi.fn().mockResolvedValue({ data: [] })

    await expect(
      codexThreadService.listThreads({ cwd: "D:/AgentHTML", request })
    ).resolves.toEqual({
      items: [],
    })

    expect(request).toHaveBeenCalledTimes(1)
  })

  it("starts a persisted Agent-HTML thread and returns its id", async () => {
    const request = vi.fn().mockResolvedValue({ thread: { id: "thr_new" } })

    await expect(
      codexThreadService.startThread({ cwd: "D:/AgentHTML", request })
    ).resolves.toBe("thr_new")

    expect(request).toHaveBeenCalledWith("thread/start", {
      cwd: "D:/AgentHTML",
      persistExtendedHistory: false,
      serviceName: "agent_html",
    })
  })

  it("throws when a started thread response has no id", async () => {
    const request = vi.fn().mockResolvedValue({})

    await expect(codexThreadService.startThread({ request })).rejects.toThrow(
      "Codex did not return a thread id."
    )

    expect(request).toHaveBeenCalledWith("thread/start", {
      persistExtendedHistory: false,
      serviceName: "agent_html",
    })
  })

  it("resumes a thread by id with the Codex cwd", async () => {
    const request = vi.fn().mockResolvedValue(undefined)

    await codexThreadService.resumeThread({
      cwd: "D:/AgentHTML",
      request,
      threadId: "thr_1",
    })

    expect(request).toHaveBeenCalledWith("thread/resume", {
      cwd: "D:/AgentHTML",
      threadId: "thr_1",
    })
  })

  it("starts a turn and returns the parsed turn id", async () => {
    const request = vi.fn().mockResolvedValue({ turn: { id: "turn_1" } })

    await expect(
      codexThreadService.startTurn({
        cwd: "D:/AgentHTML",
        promptText: "Update the button",
        request,
        threadId: "thr_1",
      })
    ).resolves.toEqual({
      threadId: "thr_1",
      turnId: "turn_1",
    })

    expect(request).toHaveBeenCalledWith("turn/start", {
      cwd: "D:/AgentHTML",
      input: [
        {
          text: "Update the button",
          type: "text",
        },
      ],
      threadId: "thr_1",
    })
  })

  it("requires a thread id before starting a turn", async () => {
    const request = vi.fn()

    await expect(
      codexThreadService.startTurn({
        promptText: "Update the button",
        request,
        threadId: "",
      })
    ).rejects.toThrow("Choose a Codex thread before sending a request.")

    expect(request).not.toHaveBeenCalled()
  })

  it("interrupts the active turn without stopping the host", async () => {
    const request = vi.fn().mockResolvedValue({})

    await codexThreadService.interruptTurn({
      request,
      threadId: "thr_1",
      turnId: "turn_1",
    })

    expect(request).toHaveBeenCalledWith("turn/interrupt", {
      threadId: "thr_1",
      turnId: "turn_1",
    })
    expect(request).not.toHaveBeenCalledWith(
      expect.stringContaining("codex_host_stop"),
      expect.anything()
    )
  })

  it("requires a thread id before interrupting a turn", async () => {
    const request = vi.fn()

    await expect(
      codexThreadService.interruptTurn({
        request,
        threadId: "",
      })
    ).rejects.toThrow("Choose a Codex thread before interrupting a turn.")

    expect(request).not.toHaveBeenCalled()
  })
})
