import { describe, expect, it, vi } from "vitest"

import {
  pendingArtifactPollFailureLimit,
  pendingArtifactPollIntervalMs,
  refreshPendingArtifactRegistry,
  shouldPollPendingArtifact,
  startPendingArtifactPolling,
} from "./use-artifact-registry"

describe("pending artifact polling", () => {
  it("polls only while a pending artifact file path is available", () => {
    expect(shouldPollPendingArtifact(null)).toBe(false)
    expect(
      shouldPollPendingArtifact("agent-html/artifacts/new-artifact.artifact.tsx")
    ).toBe(true)
  })

  it("starts an immediate refresh and schedules follow-up refreshes", () => {
    const refresh = vi.fn()
    const setIntervalFn = vi.fn(() => 7)
    const clearIntervalFn = vi.fn()

    const stop = startPendingArtifactPolling({
      clearIntervalFn,
      pendingFilePath: "agent-html/artifacts/new-artifact.artifact.tsx",
      refresh,
      setIntervalFn,
    })

    expect(refresh).toHaveBeenCalledTimes(1)
    expect(setIntervalFn).toHaveBeenCalledWith(
      expect.any(Function),
      pendingArtifactPollIntervalMs
    )

    stop()

    expect(clearIntervalFn).toHaveBeenCalledWith(7)
  })

  it("does not schedule polling without a pending artifact", () => {
    const refresh = vi.fn()
    const setIntervalFn = vi.fn(() => 7)
    const clearIntervalFn = vi.fn()

    const stop = startPendingArtifactPolling({
      clearIntervalFn,
      pendingFilePath: null,
      refresh,
      setIntervalFn,
    })

    stop()

    expect(refresh).not.toHaveBeenCalled()
    expect(setIntervalFn).not.toHaveBeenCalled()
    expect(clearIntervalFn).not.toHaveBeenCalled()
  })

  it("stops polling after repeated registry refresh failures", async () => {
    const refresh = vi.fn(() => false)
    const setIntervalFn = vi.fn(() => 7)
    const clearIntervalFn = vi.fn()
    const onPollingFailed = vi.fn()

    startPendingArtifactPolling({
      clearIntervalFn,
      maxConsecutiveFailures: pendingArtifactPollFailureLimit,
      onPollingFailed,
      pendingFilePath: "agent-html/artifacts/new-artifact.artifact.tsx",
      refresh,
      setIntervalFn,
    })
    const scheduledRefresh = setIntervalFn.mock.calls[0][0] as () => void

    for (let i = 1; i < pendingArtifactPollFailureLimit; i += 1) {
      scheduledRefresh()
    }

    await Promise.resolve()

    expect(onPollingFailed).toHaveBeenCalledWith(
      `Artifact registry polling failed ${pendingArtifactPollFailureLimit} times.`
    )
    expect(clearIntervalFn).toHaveBeenCalledWith(7)
  })

  it("forces a registry refresh while polling for a pending artifact", async () => {
    const refreshArtifacts = vi.fn(async () => {})
    const setLoadError = vi.fn()

    await expect(
      refreshPendingArtifactRegistry({
        refreshArtifacts,
        setLoadError,
      })
    ).resolves.toBe(true)

    expect(refreshArtifacts).toHaveBeenCalledWith({ forceRefresh: true })
    expect(setLoadError).not.toHaveBeenCalled()
  })

  it("reports registry refresh failures to the host", async () => {
    const refreshArtifacts = vi.fn(async () => {
      throw new Error("Host API route returned HTML instead of JSON")
    })
    const setLoadError = vi.fn()

    await expect(
      refreshPendingArtifactRegistry({
        refreshArtifacts,
        setLoadError,
      })
    ).resolves.toBe(false)

    expect(setLoadError).toHaveBeenCalledWith(
      "Host API route returned HTML instead of JSON"
    )
  })
})
