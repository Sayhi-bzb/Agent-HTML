import { describe, expect, it } from "vitest"

import {
  CodexConnectionProvider,
  markCodexStartupEvent,
  readThreadId,
  readThreads,
  scheduleCodexAutoConnect,
  useCodexConnection,
  type CodexConnectionPhase,
  type CodexConnectionSettings,
  type CodexConnectionStatus,
  type CodexHostHealth,
  type CodexRuntimeCapabilityStatus,
  type CodexRuntimeStatus,
  type CodexThreadListState,
  type CodexThreadSummary,
} from "@/app/codex/connection"

describe("Codex connection facade", () => {
  it("keeps the public runtime exports available", () => {
    expect(CodexConnectionProvider).toEqual(expect.any(Function))
    expect(useCodexConnection).toEqual(expect.any(Function))
    expect(markCodexStartupEvent).toEqual(expect.any(Function))
    expect(readThreadId).toEqual(expect.any(Function))
    expect(readThreads).toEqual(expect.any(Function))
    expect(scheduleCodexAutoConnect).toEqual(expect.any(Function))
  })

  it("keeps the public type exports available", () => {
    const phase: CodexConnectionPhase = "connected"
    const settings: CodexConnectionSettings = { codexCommand: "codex" }
    const status: CodexConnectionStatus = "connected"
    const health: CodexHostHealth = {
      appServerRunning: true,
      connected: true,
      ok: true,
      status,
    }
    const capability: CodexRuntimeCapabilityStatus = { ok: true }
    const runtimeStatus: CodexRuntimeStatus = {
      capabilities: {
        apps: capability,
        collaborationModes: capability,
        config: capability,
        mcpServers: capability,
        models: capability,
        plugins: capability,
        skills: capability,
      },
      config: {},
      status: "ready",
    }
    const thread: CodexThreadSummary = { id: "thr_1" }
    const threadList: CodexThreadListState = {
      isLoading: false,
      items: [thread],
    }

    expect({
      health,
      phase,
      runtimeStatus,
      settings,
      status,
      threadList,
    }).toMatchObject({
      phase: "connected",
      settings: { codexCommand: "codex" },
      status: "connected",
      threadList: { items: [{ id: "thr_1" }] },
    })
  })
})
