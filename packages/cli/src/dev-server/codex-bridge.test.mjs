import { describe, expect, it } from "vitest"

import {
  createInitializeParams,
  createThreadListParams,
  isEmptyRolloutError,
  listCodexThreadsWithRequest,
  startCodexTurnWithRequest,
} from "./codex-bridge.mjs"

describe("React Canvas Codex bridge", () => {
  it("opts into experimental app-server APIs for transcript history", () => {
    expect(createInitializeParams()).toEqual({
      capabilities: {
        experimentalApi: true,
      },
      clientInfo: {
        name: "agent_html_canvas",
        title: "AgentHTML Canvas",
        version: "0.1.0",
      },
    })
  })

  it("filters thread lists by the repository root cwd", () => {
    expect(createThreadListParams("D:\\codes\\Agent-HTML")).toEqual({
      cwd: "D:\\codes\\Agent-HTML",
      limit: 25,
      sortKey: "updated_at",
      sourceKinds: ["appServer", "vscode", "cli"],
    })
  })

  it("recognizes transient empty rollout transcript reads", () => {
    expect(
      isEmptyRolloutError(
        new Error(
          "thread-store internal error: failed to read thread rollout-1.jsonl: rollout at rollout-1.jsonl is empty"
        )
      )
    ).toBe(true)
    expect(isEmptyRolloutError(new Error("thread not found"))).toBe(false)
  })

  it("normalizes thread list responses", async () => {
    const result = await listCodexThreadsWithRequest({
      request: async (method, params) => {
        expect(method).toBe("thread/list")
        expect(params).toEqual(createThreadListParams("/repo"))
        return {
          data: [
            {
              createdAt: 1,
              id: "thr_1",
              name: "Canvas",
              preview: "Edit a block",
              updatedAt: 2,
            },
          ],
        }
      },
      root: "/repo",
    })

    expect(result).toEqual({
      cwd: "/repo",
      threads: [
        {
          createdAt: "1",
          id: "thr_1",
          name: "Canvas",
          preview: "Edit a block",
          status: null,
          updatedAt: "2",
        },
      ],
    })
  })

  it("starts a new thread before the turn when no thread is selected", async () => {
    const calls = []
    const result = await startCodexTurnWithRequest({
      prompt: "Request:\nUpdate this block.",
      request: async (method, params) => {
        calls.push({ method, params })
        if (method === "thread/start") {
          return { thread: { id: "thr_new" } }
        }
        if (method === "turn/start") {
          return { turn: { id: "turn_1" } }
        }
        throw new Error(`Unexpected method: ${method}`)
      },
      root: "/repo",
      threadId: null,
    })

    expect(result).toEqual({
      startedNewThread: true,
      threadId: "thr_new",
      turnId: "turn_1",
    })
    expect(calls).toEqual([
      {
        method: "thread/start",
        params: {
          cwd: "/repo",
          serviceName: "agent_html",
        },
      },
      {
        method: "turn/start",
        params: {
          input: [
            {
              text: "Request:\nUpdate this block.",
              type: "text",
            },
          ],
          threadId: "thr_new",
        },
      },
    ])
  })

  it("resumes the selected thread before starting a turn", async () => {
    const calls = []
    const result = await startCodexTurnWithRequest({
      prompt: "Request:\nTighten copy.",
      request: async (method, params) => {
        calls.push({ method, params })
        if (method === "thread/resume") {
          return {}
        }
        if (method === "turn/start") {
          return { turn: { id: "turn_existing" } }
        }
        throw new Error(`Unexpected method: ${method}`)
      },
      root: "/repo",
      threadId: "thr_existing",
    })

    expect(result).toEqual({
      startedNewThread: false,
      threadId: "thr_existing",
      turnId: "turn_existing",
    })
    expect(calls).toEqual([
      {
        method: "thread/resume",
        params: {
          cwd: "/repo",
          threadId: "thr_existing",
        },
      },
      {
        method: "turn/start",
        params: {
          input: [
            {
              text: "Request:\nTighten copy.",
              type: "text",
            },
          ],
          threadId: "thr_existing",
        },
      },
    ])
  })
})
