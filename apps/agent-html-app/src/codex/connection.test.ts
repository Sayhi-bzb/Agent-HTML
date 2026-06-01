import { afterEach, describe, expect, it, vi } from "vitest"

import {
  readThreadId,
  readThreads,
  scheduleCodexAutoConnect,
} from "@/app/codex/connection"
import {
  readEffectiveConfig,
  readCapabilityItems,
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

  it("reads generic capability item names from app-server list shapes", () => {
    expect(
      readRuntimeItems({
        items: [{ name: "agent-html" }],
      })
    ).toEqual([
      {
        id: "agent-html",
        name: "agent-html",
        path: undefined,
        source: undefined,
        sourceType: undefined,
        status: undefined,
      },
    ])
    expect(readRuntimeItems({ plugins: [{ id: "plugin-1" }] })).toEqual([])
    expect(readRuntimeItems(["plain-skill"])).toEqual([
      { name: "plain-skill" },
    ])
  })

  it("reads skill names without flattening unrelated nested entities", () => {
    expect(
      readCapabilityItems("skills", {
        skills: [
          {
            enabled: true,
            name: "agent-html",
            path: "AgentHTML/.agents/skills/agent-html",
            tools: [{ name: "not-a-skill" }],
          },
        ],
      })
    ).toEqual([
      {
        enabled: true,
        id: "agent-html",
        name: "agent-html",
        path: "AgentHTML/.agents/skills/agent-html",
        source: "AgentHTML/.agents/skills/agent-html",
        sourceType: undefined,
        status: undefined,
      },
    ])
  })

  it("reads cwd-grouped skills from skills/list without counting groups", () => {
    expect(
      readCapabilityItems("skills", {
        data: [
          {
            cwd: "D:/codes/Agent-HTML",
            skills: [
              {
                description: "AgentHTML artifact skill",
                enabled: true,
                name: "agent-html",
                path: "D:/codes/Agent-HTML/.agents/skills/agent-html",
                scope: "project",
              },
            ],
            errors: [],
          },
          {
            cwd: "C:/Users/Admin",
            skills: [
              {
                description: "Create skills",
                enabled: false,
                name: "skill-creator",
                path: "C:/Users/Admin/.codex/skills/skill-creator",
                scope: "user",
              },
            ],
            errors: [],
          },
        ],
      })
    ).toEqual([
      {
        enabled: true,
        id: "agent-html",
        name: "agent-html",
        path: "D:/codes/Agent-HTML/.agents/skills/agent-html",
        source: "D:/codes/Agent-HTML/.agents/skills/agent-html",
        sourceType: undefined,
        scope: "project",
        status: undefined,
      },
      {
        enabled: false,
        id: "skill-creator",
        name: "skill-creator",
        path: "C:/Users/Admin/.codex/skills/skill-creator",
        source: "C:/Users/Admin/.codex/skills/skill-creator",
        sourceType: undefined,
        scope: "user",
        status: undefined,
      },
    ])
  })

  it("reads MCP server names without flattening tools or resources", () => {
    expect(
      readCapabilityItems("mcpServers", {
        data: [
          {
            authStatus: "authenticated",
            name: "filesystem",
            resources: [{ name: "not-a-server-resource" }],
            status: "ready",
            tools: [{ name: "not-a-server-tool" }],
          },
        ],
      })
    ).toEqual([
      {
        authStatus: "authenticated",
        childrenCount: 2,
        enabled: undefined,
        id: "filesystem",
        name: "filesystem",
        path: undefined,
        source: undefined,
        sourceType: undefined,
        status: "ready",
      },
    ])
  })

  it("reads plugin names without flattening bundled capabilities", () => {
    expect(
      readCapabilityItems("plugins", {
        plugins: [
          {
            apps: [{ name: "not-a-plugin-app" }],
            installed: true,
            mcpServers: [{ name: "not-a-plugin-mcp" }],
            name: "browser-tools",
            skills: [{ name: "not-a-plugin-skill" }],
            source: { path: "AgentHTML/plugins/browser-tools", type: "local" },
          },
        ],
      })
    ).toEqual([
      {
        childrenCount: 3,
        id: "browser-tools",
        installed: true,
        name: "browser-tools",
        path: undefined,
        source: "AgentHTML/plugins/browser-tools",
        sourceType: "local",
        status: undefined,
      },
    ])
  })

  it("reads app names without exposing app metadata in the UI item name", () => {
    expect(
      readCapabilityItems("apps", {
        data: [
          {
            description: "GitHub connector",
            id: "github",
            installUrl: "https://chatgpt.com/apps/github/github",
            isAccessible: true,
            isEnabled: false,
            name: "GitHub",
          },
        ],
      })
    ).toEqual([
      {
        enabled: false,
        id: "github",
        isAccessible: true,
        name: "GitHub",
        path: undefined,
        source: undefined,
        sourceType: undefined,
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
