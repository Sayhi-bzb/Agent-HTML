import { afterEach, describe, expect, it, vi } from "vitest"

import { codexHostClient } from "./host-client"

const invokeMock = vi.hoisted(() => vi.fn())
const isTauriMock = vi.hoisted(() => vi.fn())

vi.mock("@tauri-apps/api/core", () => ({
  invoke: invokeMock,
  isTauri: isTauriMock,
}))

afterEach(() => {
  invokeMock.mockReset()
  isTauriMock.mockReset()
})

describe("codexHostClient", () => {
  it("reports whether the host can be managed", () => {
    isTauriMock.mockReturnValue(true)

    expect(codexHostClient.canManageHost()).toBe(true)
    expect(isTauriMock).toHaveBeenCalledTimes(1)
  })

  it("loads and saves Codex host settings through Tauri commands", async () => {
    invokeMock
      .mockResolvedValueOnce({ codexCommand: "codex.cmd" })
      .mockResolvedValueOnce({ codexCommand: "codex" })

    await expect(codexHostClient.loadSettings()).resolves.toEqual({
      codexCommand: "codex.cmd",
    })
    await expect(
      codexHostClient.saveSettings({ codexCommand: "codex" })
    ).resolves.toEqual({ codexCommand: "codex" })

    expect(invokeMock).toHaveBeenNthCalledWith(1, "codex_host_settings_load")
    expect(invokeMock).toHaveBeenNthCalledWith(2, "codex_host_settings_save", {
      settings: { codexCommand: "codex" },
    })
  })

  it("runs host commands with settings", async () => {
    const processStatus = {
      health: {
        appServerRunning: true,
        connected: true,
        ok: true,
        status: "connected",
      },
      pid: 123,
      status: "connected",
    }
    invokeMock.mockResolvedValueOnce(processStatus)

    await expect(
      codexHostClient.runCommand("codex_host_start", {
        codexCommand: "codex",
      })
    ).resolves.toBe(processStatus)

    expect(invokeMock).toHaveBeenCalledWith("codex_host_start", {
      settings: { codexCommand: "codex" },
    })
  })

  it("unwraps RPC request results", async () => {
    invokeMock.mockResolvedValueOnce({ result: { id: "thr_1" } })

    await expect(
      codexHostClient.request({
        method: "thread/read",
        params: { threadId: "thr_1" },
        settings: { codexCommand: "codex" },
      })
    ).resolves.toEqual({ id: "thr_1" })

    expect(invokeMock).toHaveBeenCalledWith("codex_rpc_request", {
      input: {
        method: "thread/read",
        params: { threadId: "thr_1" },
      },
      settings: { codexCommand: "codex" },
    })
  })
})
