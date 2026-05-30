import { afterEach, describe, expect, it, vi } from "vitest"

import {
  readThreadId,
  readThreads,
  scheduleCodexAutoConnect,
} from "@/app/codex/connection"
import {
  readEffectiveConfig,
  readRuntimeItems,
} from "@/app/codex/connection/parsers"

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("Codex thread response parsing", () => {
  it("reads official paginated thread/list data", () => {
    expect(
      readThreads({
        data: [
          {
            createdAt: 1730910000,
            id: "thr_1",
            preview: "First",
            status: "idle",
            updated_at: 1730910100,
          },
        ],
        nextCursor: null,
      })
    ).toEqual([
      {
        createdAt: "1730910000",
        id: "thr_1",
        name: null,
        status: "idle",
        updatedAt: "1730910100",
      },
    ])
  })

  it("reads alternate thread array shapes", () => {
    expect(readThreads({ threads: [{ id: "thr_1", name: "One" }] })).toEqual([
      {
        createdAt: undefined,
        id: "thr_1",
        name: "One",
        status: null,
        updatedAt: undefined,
      },
    ])
    expect(readThreads({ items: [{ id: "thr_2", title: "Two" }] })).toEqual([
      {
        createdAt: undefined,
        id: "thr_2",
        name: "Two",
        status: null,
        updatedAt: undefined,
      },
    ])
  })

  it("reads thread ids from official and compact responses", () => {
    expect(readThreadId({ thread: { id: "thr_official" } })).toBe(
      "thr_official"
    )
    expect(readThreadId({ threadId: "thr_compact" })).toBe("thr_compact")
    expect(readThreadId({ id: "thr_root" })).toBe("thr_root")
  })
})

describe("Codex runtime capability parsing", () => {
  it("reads effective sandbox and approval config", () => {
    expect(
      readEffectiveConfig({
        config: {
          approval_policy: "on-request",
          model: "gpt-5.5",
          model_provider: "OpenAI",
          sandbox_mode: "workspace-write",
        },
      })
    ).toEqual({
      approvalPolicy: "on-request",
      approvalPolicyDiagnostic: undefined,
      model: "gpt-5.5",
      modelProvider: "OpenAI",
      sandboxMode: "workspace-write",
      sandboxModeDiagnostic: undefined,
    })
  })

  it("diagnoses config responses that omit sandbox and approval fields", () => {
    expect(readEffectiveConfig({ config: { model: "gpt-5.5" } })).toEqual({
      approvalPolicy: undefined,
      approvalPolicyDiagnostic: "not exposed by config/read",
      model: "gpt-5.5",
      modelProvider: undefined,
      sandboxMode: undefined,
      sandboxModeDiagnostic: "not exposed by config/read",
    })
  })

  it("reads capability item names from app-server list shapes", () => {
    expect(
      readRuntimeItems({
        skills: [{ name: "agent-html" }],
      })
    ).toEqual([
      {
        id: "agent-html",
        name: "agent-html",
        source: undefined,
        status: undefined,
      },
    ])
    expect(
      readRuntimeItems({
        plugins: [{ id: "plugin-1", title: "Plugin One" }],
      })
    ).toEqual([
      {
        id: "plugin-1",
        name: "Plugin One",
        source: undefined,
        status: undefined,
      },
    ])
    expect(
      readRuntimeItems({
        servers: [{ name: "filesystem", status: "ready" }],
      })
    ).toEqual([
      {
        id: "filesystem",
        name: "filesystem",
        source: undefined,
        status: "ready",
      },
    ])
    expect(readRuntimeItems(["plain-skill"])).toEqual([
      { name: "plain-skill", source: undefined },
    ])
  })

  it("reads nested runtime capability items with inherited sources", () => {
    expect(
      readRuntimeItems({
        items: [
          {
            cwd: "D:/codes/AgentHTML",
            skills: [
              { name: "agent-html", path: "AgentHTML/.agents/skills/agent-html" },
            ],
          },
          {
            cwd: null,
            skills: [
              { name: "commit", path: "C:/Users/Admin/.agents/skills/commit" },
            ],
          },
        ],
      })
    ).toEqual([
      {
        id: "agent-html",
        name: "agent-html",
        source: "AgentHTML/.agents/skills/agent-html",
        status: undefined,
      },
      {
        id: "commit",
        name: "commit",
        source: "C:/Users/Admin/.agents/skills/commit",
        status: undefined,
      },
    ])
  })

  it("reads plugin source metadata from nested source objects", () => {
    expect(
      readRuntimeItems({
        plugins: [
          {
            name: "browser-tools",
            source: { path: "AgentHTML/plugins/browser-tools", type: "local" },
          },
        ],
      })
    ).toEqual([
      {
        id: "browser-tools",
        name: "browser-tools",
        source: "AgentHTML/plugins/browser-tools",
        status: undefined,
      },
    ])
  })

  it("skips runtime capability items without a readable name", () => {
    expect(readRuntimeItems({ items: [{ enabled: true }, null, 12] })).toEqual(
      []
    )
  })
})

describe("Codex auto-connect scheduling", () => {
  it("delays host connection until the scheduled startup task", async () => {
    vi.useFakeTimers()
    const connect = vi.fn().mockResolvedValue(undefined)

    scheduleCodexAutoConnect({
      connect,
      delayMs: 250,
      getAttemptId: () => 0,
      settings: { codexCommand: "codex" },
    })

    expect(connect).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(249)
    expect(connect).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)

    expect(connect).toHaveBeenCalledWith({ codexCommand: "codex" })
  })

  it("skips delayed auto-connect after a manual connection attempt starts", async () => {
    vi.useFakeTimers()
    let attemptId = 0
    const connect = vi.fn().mockResolvedValue(undefined)
    const onSkip = vi.fn()

    scheduleCodexAutoConnect({
      connect,
      delayMs: 250,
      getAttemptId: () => attemptId,
      onSkip,
      settings: { codexCommand: "codex" },
    })
    attemptId = 1
    await vi.advanceTimersByTimeAsync(250)

    expect(connect).not.toHaveBeenCalled()
    expect(onSkip).toHaveBeenCalledTimes(1)
  })
})
