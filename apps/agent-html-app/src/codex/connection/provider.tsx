import * as React from "react"

import { scheduleCodexAutoConnect } from "./auto-connect"
import { ACTIVE_THREAD_STORAGE_KEY, CONNECTION_TIMEOUT_MS } from "./constants"
import { getErrorMessage } from "./errors"
import { codexHostClient } from "./host-client"
import type { CodexHostCommand } from "./host-client"
import {
  CODEX_RUNTIME_READS,
  countItems,
  createIdleRuntimeStatus,
  createRuntimeStatusFromEntries,
} from "./runtime-status"
import { areSettingsEqual, loadSettings, validateSettings } from "./settings"
import { normalizeStatus, statusFromPhase, statusToPhase } from "./status"
import { createIdleThreadList } from "./thread-list"
import { codexThreadService } from "./thread-service"
import { withTimeout } from "./timeout"
import {
  summarizeRpcResult,
  summarizeTraceValue,
  writeConnectionTrace,
} from "./trace"
import type {
  ApplyProcessStatusOptions,
  CodexConnectionContextValue,
  CodexConnectionPhase,
  CodexConnectionSettings,
  CodexHostHealth,
  CodexHostProcessStatus,
  CodexRuntimeStatus,
  CodexThreadListState,
  ScheduledCodexAutoConnect,
  WorkspaceRootSettings,
  WorkspaceRootStatus,
} from "./types"
import { CodexConnectionContext } from "./context"

function storeActiveThreadId(threadId: string) {
  if (typeof localStorage === "undefined") {
    return
  }

  localStorage.setItem(ACTIVE_THREAD_STORAGE_KEY, threadId)
}

export function CodexConnectionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [settings, setSettings] =
    React.useState<CodexConnectionSettings>(loadSettings)
  const [workspaceRootStatus, setWorkspaceRootStatus] =
    React.useState<WorkspaceRootStatus | null>(null)
  const [health, setHealth] = React.useState<CodexHostHealth | null>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)
  const canManageHost = codexHostClient.canManageHost()
  const [phase, setPhase] = React.useState<CodexConnectionPhase>(
    canManageHost ? "loadingSettings" : "stopped"
  )
  const [lastError, setLastError] = React.useState<string | null>(null)
  const [isBusy, setIsBusy] = React.useState(false)
  const [runtimeStatus, setRuntimeStatus] =
    React.useState<CodexRuntimeStatus>(createIdleRuntimeStatus)
  const [threadList, setThreadList] =
    React.useState<CodexThreadListState>(createIdleThreadList)
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null)
  const connectionAttemptRef = React.useRef(0)
  const phaseRef = React.useRef<CodexConnectionPhase>(phase)
  const runtimeStatusRequestRef = React.useRef<Promise<void> | null>(null)
  const settingsRef = React.useRef(settings)

  React.useEffect(() => {
    writeConnectionTrace("startup:provider-mounted", {
      phase: phaseRef.current,
    })
  }, [])

  React.useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  React.useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  const applyProcessStatus = React.useCallback(
    (
      processStatus: CodexHostProcessStatus,
      options: ApplyProcessStatusOptions = {}
    ) => {
      setHealth(processStatus.health)
      const nextStatus = normalizeStatus(processStatus.status, processStatus.health)
      setPhase((currentPhase) => {
        let nextPhase: CodexConnectionPhase
        if (nextStatus === "connected") {
          nextPhase = "connected"
        } else if (nextStatus === "starting" && !options.allowConnectingPhase) {
          nextPhase = currentPhase === "connected" ? "connected" : currentPhase
        } else {
          nextPhase = statusToPhase(nextStatus)
        }

        writeConnectionTrace("phase:apply", {
          allowConnectingPhase: Boolean(options.allowConnectingPhase),
          appServerRunning: processStatus.health.appServerRunning,
          connected: processStatus.health.connected,
          currentPhase,
          error: processStatus.health.error,
          hostStatus: processStatus.status,
          nextPhase,
          nextStatus,
          pid: processStatus.pid ?? null,
          stderr: processStatus.health.stderr,
        })
        return nextPhase
      })
      setLastError(processStatus.health.error ?? processStatus.health.stderr ?? null)
    },
    []
  )

  const runCommand = React.useCallback(
    async (
      command: CodexHostCommand,
      settingsOverride?: CodexConnectionSettings
    ) => {
      if (!canManageHost) {
        throw new Error("Desktop runtime required to manage Codex.")
      }

      const targetSettings = settingsOverride ?? settingsRef.current
      validateSettings(targetSettings)

      writeConnectionTrace("command:start", {
        command,
        phase: phaseRef.current,
      })

      try {
        const processStatus = await codexHostClient.runCommand(
          command,
          targetSettings
        )
        writeConnectionTrace("command:result", {
          appServerRunning: processStatus.health.appServerRunning,
          command,
          connected: processStatus.health.connected,
          error: processStatus.health.error,
          hostStatus: processStatus.status,
          phase: phaseRef.current,
          pid: processStatus.pid ?? null,
          stderr: processStatus.health.stderr,
        })
        return processStatus
      } catch (error) {
        writeConnectionTrace("command:error", {
          command,
          error: getErrorMessage(error),
          phase: phaseRef.current,
        })
        throw error
      }
    },
    [canManageHost]
  )

  const saveSettingsEverywhere = React.useCallback(
    async (nextSettings: CodexConnectionSettings) => {
      if (canManageHost) {
        const savedSettings = await codexHostClient.saveSettings(nextSettings)
        settingsRef.current = savedSettings
        setSettings((currentSettings) =>
          areSettingsEqual(currentSettings, savedSettings)
            ? currentSettings
            : savedSettings
        )
        return savedSettings
      }

      settingsRef.current = nextSettings
      setSettings((currentSettings) =>
        areSettingsEqual(currentSettings, nextSettings)
          ? currentSettings
          : nextSettings
      )
      return nextSettings
    },
    [canManageHost]
  )

  const connect = React.useCallback(async (settingsOverride?: CodexConnectionSettings) => {
    const attemptId = connectionAttemptRef.current + 1
    connectionAttemptRef.current = attemptId
    writeConnectionTrace("connect:start", {
      attemptId,
      phase: phaseRef.current,
    })
    setIsBusy(true)
    setPhase("connecting")
    setLastError(null)
    setActiveThreadId(null)
    setThreadList((currentList) => ({
      ...currentList,
      error: null,
      isLoading: true,
    }))

    try {
      const processStatus = await withTimeout(
        runCommand("codex_host_start", settingsOverride),
        CONNECTION_TIMEOUT_MS,
        "Codex connection timed out."
      )
      if (connectionAttemptRef.current !== attemptId) {
        writeConnectionTrace("connect:stale-result", {
          attemptId,
          currentAttemptId: connectionAttemptRef.current,
          hostStatus: processStatus.status,
        })
        return
      }

      applyProcessStatus(processStatus, { allowConnectingPhase: true })
    } catch (error) {
      writeConnectionTrace("connect:error", {
        attemptId,
        currentAttemptId: connectionAttemptRef.current,
        error: getErrorMessage(error),
        phase: phaseRef.current,
      })
      if (connectionAttemptRef.current === attemptId) {
        setPhase("error")
        setLastError(getErrorMessage(error))
      }
      throw error
    } finally {
      if (connectionAttemptRef.current === attemptId) {
        setIsBusy(false)
      }
      writeConnectionTrace("connect:finally", {
        attemptId,
        currentAttemptId: connectionAttemptRef.current,
        phase: phaseRef.current,
      })
    }
  }, [applyProcessStatus, runCommand])

  const stop = React.useCallback(async (settingsOverride?: CodexConnectionSettings) => {
    const attemptId = connectionAttemptRef.current + 1
    connectionAttemptRef.current = attemptId
    writeConnectionTrace("stop:start", {
      attemptId,
      phase: phaseRef.current,
    })
    setIsBusy(true)
    setLastError(null)

    try {
      const processStatus = await runCommand("codex_host_stop", settingsOverride)
      if (connectionAttemptRef.current !== attemptId) {
        writeConnectionTrace("stop:stale-result", {
          attemptId,
          currentAttemptId: connectionAttemptRef.current,
          hostStatus: processStatus.status,
        })
        return
      }

      applyProcessStatus(processStatus)
      setActiveThreadId(null)
      setPhase("stopped")
    } catch (error) {
      writeConnectionTrace("stop:error", {
        attemptId,
        currentAttemptId: connectionAttemptRef.current,
        error: getErrorMessage(error),
        phase: phaseRef.current,
      })
      if (connectionAttemptRef.current === attemptId) {
        setPhase("error")
        setLastError(getErrorMessage(error))
      }
    } finally {
      if (connectionAttemptRef.current === attemptId) {
        setIsBusy(false)
      }
    }
  }, [applyProcessStatus, runCommand])

  const restart = React.useCallback(async (settingsOverride?: CodexConnectionSettings) => {
    const attemptId = connectionAttemptRef.current + 1
    connectionAttemptRef.current = attemptId
    writeConnectionTrace("restart:start", {
      attemptId,
      phase: phaseRef.current,
    })
    setIsBusy(true)
    setPhase("connecting")
    setLastError(null)
    setActiveThreadId(null)
    setThreadList((currentList) => ({
      ...currentList,
      error: null,
      isLoading: true,
    }))

    try {
      const processStatus = await withTimeout(
        runCommand("codex_host_restart", settingsOverride),
        CONNECTION_TIMEOUT_MS,
        "Codex connection timed out."
      )
      if (connectionAttemptRef.current !== attemptId) {
        writeConnectionTrace("restart:stale-result", {
          attemptId,
          currentAttemptId: connectionAttemptRef.current,
          hostStatus: processStatus.status,
        })
        return
      }

      applyProcessStatus(processStatus, { allowConnectingPhase: true })
    } catch (error) {
      writeConnectionTrace("restart:error", {
        attemptId,
        currentAttemptId: connectionAttemptRef.current,
        error: getErrorMessage(error),
        phase: phaseRef.current,
      })
      if (connectionAttemptRef.current === attemptId) {
        setPhase("error")
        setLastError(getErrorMessage(error))
      }
    } finally {
      if (connectionAttemptRef.current === attemptId) {
        setIsBusy(false)
      }
    }
  }, [applyProcessStatus, runCommand])

  const start = React.useCallback(async (settingsOverride?: CodexConnectionSettings) => {
    await connect(settingsOverride)
  }, [connect])

  const request = React.useCallback(
    async (method: string, params: unknown) => {
      if (!canManageHost) {
        throw new Error("Desktop runtime required to manage Codex.")
      }

      const targetSettings = settingsRef.current
      validateSettings(targetSettings)

      writeConnectionTrace("rpc:start", {
        method,
        params: summarizeTraceValue(params),
        phase: phaseRef.current,
      })
      const result = await codexHostClient.request({
        method,
        params,
        settings: targetSettings,
      })

      writeConnectionTrace("rpc:result", {
        method,
        phase: phaseRef.current,
        result: summarizeRpcResult(result),
      })
      return result
    },
    [canManageHost]
  )

  const refreshRuntimeStatus = React.useCallback(async () => {
    if (runtimeStatusRequestRef.current) {
      return runtimeStatusRequestRef.current
    }

    if (!canManageHost || phaseRef.current !== "connected") {
      setRuntimeStatus(createIdleRuntimeStatus())
      return
    }

    const requestPromise = (async () => {
      setRuntimeStatus((currentStatus) => ({
        ...currentStatus,
        error: null,
        status: "loading",
      }))

      const entries = await Promise.all(
        CODEX_RUNTIME_READS.map(async (spec) => {
          try {
            const result = await request(
              spec.method,
              spec.params({ cwd: health?.cwd })
            )
            return {
              capability: spec.capability,
              result,
              status: {
                count: countItems(result),
                ok: true,
              },
            }
          } catch (error) {
            return {
              capability: spec.capability,
              result: null,
              status: {
                error: getErrorMessage(error),
                ok: false,
              },
            }
          }
        })
      )

      setRuntimeStatus(createRuntimeStatusFromEntries(entries))
    })()

    runtimeStatusRequestRef.current = requestPromise

    try {
      await requestPromise
    } finally {
      if (runtimeStatusRequestRef.current === requestPromise) {
        runtimeStatusRequestRef.current = null
      }
    }
  }, [canManageHost, health?.cwd, request])

  const refreshThreads = React.useCallback(async () => {
    if (!canManageHost || phaseRef.current !== "connected") {
      setThreadList(createIdleThreadList())
      return
    }

    setThreadList((currentList) => ({
      ...currentList,
      error: null,
      isLoading: true,
    }))

    try {
      const { items } = await codexThreadService.listThreads({
        cwd: health?.cwd,
        request,
      })
      setThreadList({
        error: null,
        isLoading: false,
        items,
        loadedAt: new Date().toISOString(),
      })
    } catch (error) {
      setThreadList((currentList) => ({
        ...currentList,
        error: getErrorMessage(error),
        isLoading: false,
      }))
    }
  }, [canManageHost, health?.cwd, request])

  const resumeThread = React.useCallback(
    async (threadId: string) => {
      await codexThreadService.resumeThread({ request, threadId })
      setActiveThreadId(threadId)
      storeActiveThreadId(threadId)
    },
    [request]
  )

  const startNewThread = React.useCallback(async () => {
    const threadId = await codexThreadService.startThread({ request })
    setActiveThreadId(threadId)
    storeActiveThreadId(threadId)
    void refreshThreads()
    return threadId
  }, [refreshThreads, request])

  const startTurn = React.useCallback(
    async ({
      promptText,
      threadId,
    }: {
      promptText: string
      threadId: string
    }) => {
      return codexThreadService.startTurn({
        promptText,
        request,
        threadId,
      })
    },
    [request]
  )

  const interruptTurn = React.useCallback(
    async ({
      threadId,
      turnId,
    }: {
      threadId: string
      turnId?: string | null
    }) => {
      return codexThreadService.interruptTurn({
        request,
        threadId,
        turnId,
      })
    },
    [request]
  )

  const test = React.useCallback(async (settingsOverride?: CodexConnectionSettings) => {
    await connect(settingsOverride)
  }, [connect])

  const updateSettings = React.useCallback(
    async (nextSettings: CodexConnectionSettings) => {
      await saveSettingsEverywhere(nextSettings)
    },
    [saveSettingsEverywhere]
  )

  const updateWorkspaceRootSettings = React.useCallback(
    async (nextSettings: WorkspaceRootSettings) => {
      if (!canManageHost) {
        throw new Error("Desktop runtime required to update workspace root.")
      }

      const nextStatus =
        await codexHostClient.saveWorkspaceRootSettings(nextSettings)
      setWorkspaceRootStatus(nextStatus)
      return nextStatus
    },
    [canManageHost]
  )

  React.useEffect(() => {
    if (!canManageHost) {
      setIsLoaded(true)
      return
    }

    let isCurrent = true
    let cleanupScheduledConnection: ScheduledCodexAutoConnect | undefined

    void Promise.all([
      codexHostClient.loadSettings(),
      codexHostClient.loadWorkspaceRootSettings(),
    ])
      .then(([loadedSettings, loadedWorkspaceRootStatus]) => {
        if (!isCurrent) {
          return
        }

        setWorkspaceRootStatus(loadedWorkspaceRootStatus)
        settingsRef.current = loadedSettings
        setSettings((currentSettings) =>
          areSettingsEqual(currentSettings, loadedSettings)
            ? currentSettings
            : loadedSettings
        )
        writeConnectionTrace("settings:loaded", {
          command: loadedSettings.codexCommand,
          phase: phaseRef.current,
        })
        setPhase("stopped")
        setIsLoaded(true)
        writeConnectionTrace("startup:loaded-before-auto-connect", {
          phase: phaseRef.current,
        })
        cleanupScheduledConnection = scheduleCodexAutoConnect({
          connect,
          getAttemptId: () => connectionAttemptRef.current,
          onError: (error) => {
            writeConnectionTrace("auto-connect:error", {
              error: getErrorMessage(error),
              phase: phaseRef.current,
            })
          },
          onSkip: () => {
            writeConnectionTrace("auto-connect:skip", {
              phase: phaseRef.current,
            })
          },
          settings: loadedSettings,
        })
      })
      .catch((error) => {
        if (!isCurrent) {
          return
        }

        setPhase("error")
        setLastError(getErrorMessage(error))
        setIsLoaded(true)
      })
    return () => {
      isCurrent = false
      cleanupScheduledConnection?.cancel()
    }
  }, [canManageHost, connect])

  React.useEffect(() => {
    if (!canManageHost || phase !== "connected") {
      return undefined
    }

    const interval = window.setInterval(() => {
      const attemptId = connectionAttemptRef.current
      writeConnectionTrace("health:poll", {
        attemptId,
        phase: phaseRef.current,
      })
      void runCommand("codex_host_health")
        .then((processStatus) => {
          if (connectionAttemptRef.current === attemptId) {
            applyProcessStatus(processStatus)
            return
          }
          writeConnectionTrace("health:stale-result", {
            attemptId,
            currentAttemptId: connectionAttemptRef.current,
            hostStatus: processStatus.status,
          })
        })
        .catch((error) => {
          writeConnectionTrace("health:error", {
            attemptId,
            currentAttemptId: connectionAttemptRef.current,
            error: getErrorMessage(error),
            phase: phaseRef.current,
          })
          if (connectionAttemptRef.current === attemptId) {
            setPhase("error")
            setLastError(getErrorMessage(error))
          }
        })
    }, 5000)

    return () => window.clearInterval(interval)
  }, [applyProcessStatus, canManageHost, phase, runCommand])

  React.useEffect(() => {
    if (phase !== "connected") {
      setRuntimeStatus(createIdleRuntimeStatus())
      setThreadList((currentList) =>
        phase === "connecting" || phase === "loadingSettings"
          ? {
              ...currentList,
              error: null,
              isLoading: true,
            }
          : createIdleThreadList()
      )
      return
    }

    void refreshThreads()
    void refreshRuntimeStatus()
  }, [phase, refreshRuntimeStatus, refreshThreads])

  const status = statusFromPhase(phase)

  const value = React.useMemo<CodexConnectionContextValue>(
    () => ({
      activeThreadId,
      canManageHost,
      phase,
      health,
      interruptTurn,
      isLoaded,
      isBusy,
      lastError,
      refreshRuntimeStatus,
      refreshThreads,
      request,
      resumeThread,
      restart,
      runtimeStatus,
      settings,
      start,
      startNewThread,
      startTurn,
      status,
      stop,
      threadList,
      test,
      updateSettings,
      updateWorkspaceRootSettings,
      workspaceRootStatus,
    }),
    [
      activeThreadId,
      canManageHost,
      phase,
      health,
      interruptTurn,
      isLoaded,
      isBusy,
      lastError,
      refreshRuntimeStatus,
      refreshThreads,
      request,
      resumeThread,
      restart,
      runtimeStatus,
      settings,
      start,
      startNewThread,
      startTurn,
      status,
      stop,
      threadList,
      test,
      updateSettings,
      updateWorkspaceRootSettings,
      workspaceRootStatus,
    ]
  )

  return (
    <CodexConnectionContext.Provider value={value}>
      {children}
    </CodexConnectionContext.Provider>
  )
}
