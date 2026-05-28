import * as React from "react"
import { invoke, isTauri } from "@tauri-apps/api/core"

export type CodexConnectionStatus =
  | "connected"
  | "disconnected"
  | "error"
  | "starting"
  | "stopped"

export type CodexConnectionSettings = {
  codexCommand: string
  codexEventLogPath: string
  eventLogEnabled: boolean
  eventLogPath: string
}

export type CodexHostHealth = {
  appServerRunning: boolean
  codexCommand?: string | null
  connected: boolean
  cwd?: string | null
  error?: string | null
  ok: boolean
  provider?: string | null
  stderr?: string | null
  status: CodexConnectionStatus
}

type CodexHostProcessStatus = {
  health: CodexHostHealth
  pid?: number | null
  status: CodexConnectionStatus
}

type CodexRpcRequestResult = {
  result: unknown
}

type CodexTurnStartResult = {
  threadId: string
  turnId?: string | null
}

type CodexConnectionContextValue = {
  activeThreadId: string | null
  canManageHost: boolean
  phase: CodexConnectionPhase
  health: CodexHostHealth | null
  isLoaded: boolean
  isBusy: boolean
  lastError: string | null
  openLogs: (settingsOverride?: CodexConnectionSettings) => Promise<void>
  request: (method: string, params: unknown) => Promise<unknown>
  settings: CodexConnectionSettings
  status: CodexConnectionStatus
  start: (settingsOverride?: CodexConnectionSettings) => Promise<void>
  startTurn: (promptText: string) => Promise<CodexTurnStartResult>
  stop: (settingsOverride?: CodexConnectionSettings) => Promise<void>
  restart: (settingsOverride?: CodexConnectionSettings) => Promise<void>
  test: (settingsOverride?: CodexConnectionSettings) => Promise<void>
  updateSettings: (settings: CodexConnectionSettings) => Promise<void>
}

const STORAGE_KEY = "agent-html.codex-connection"
const TRACE_STORAGE_KEY = "agent-html.codex-connection-trace"
const CONNECTION_TIMEOUT_MS = 30000

export type CodexConnectionPhase =
  | "connected"
  | "connecting"
  | "error"
  | "loadingSettings"
  | "stopped"

type CodexHostLogPaths = {
  codexEventLogPath: string
  eventLogPath: string
  resolvedFromDefaults: boolean
}

type ApplyProcessStatusOptions = {
  allowConnectingPhase?: boolean
}

type ConnectionTracePayload = Record<string, unknown>

const CodexConnectionContext = React.createContext<
  CodexConnectionContextValue | undefined
>(undefined)

function getDefaultCodexCommand() {
  return typeof navigator !== "undefined" && navigator.platform.includes("Win")
    ? "codex.cmd"
    : "codex"
}

function getDefaultSettings(): CodexConnectionSettings {
  return {
    codexCommand: getDefaultCodexCommand(),
    codexEventLogPath: ".tmp\\agent-html-codex-app-server-events.jsonl",
    eventLogEnabled: false,
    eventLogPath: ".tmp\\agent-html-codex-turns.jsonl",
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function loadSettings(): CodexConnectionSettings {
  if (typeof localStorage === "undefined") {
    return getDefaultSettings()
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return getDefaultSettings()
  }

  try {
    const parsed: unknown = JSON.parse(stored)
    const defaults = getDefaultSettings()
    if (!isPlainObject(parsed)) {
      return defaults
    }

    return {
      codexCommand:
        typeof parsed.codexCommand === "string"
          ? parsed.codexCommand
          : defaults.codexCommand,
      codexEventLogPath:
        typeof parsed.codexEventLogPath === "string"
          ? parsed.codexEventLogPath
          : defaults.codexEventLogPath,
      eventLogEnabled:
        typeof parsed.eventLogEnabled === "boolean"
          ? parsed.eventLogEnabled
          : defaults.eventLogEnabled,
      eventLogPath:
        typeof parsed.eventLogPath === "string"
          ? parsed.eventLogPath
          : defaults.eventLogPath,
    }
  } catch {
    return getDefaultSettings()
  }
}

function saveSettings(settings: CodexConnectionSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

function getOpenLogsInstructions(paths: CodexHostLogPaths) {
  return [
    "Open these log files from your workspace or file explorer:",
    `Event log: ${paths.eventLogPath}`,
    `Codex event log: ${paths.codexEventLogPath}`,
  ].join("\n")
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function validateSettings(settings: CodexConnectionSettings) {
  if (!settings.codexCommand.trim()) {
    throw new Error("Set the Codex command before connecting.")
  }
}

function readObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null
}

function readThreadId(value: unknown) {
  const result = readObject(value)
  const thread = readObject(result?.thread)
  return typeof thread?.id === "string" ? thread.id : null
}

function readTurnId(value: unknown) {
  const result = readObject(value)
  const turn = readObject(result?.turn)
  return typeof turn?.id === "string" ? turn.id : null
}

function normalizeStatus(status: CodexConnectionStatus, health: CodexHostHealth | null) {
  if (health?.connected) {
    return "connected"
  }

  if (health?.error) {
    return "error"
  }

  if (status === "starting" || health?.appServerRunning) {
    return "starting"
  }

  return status
}

function statusFromPhase(phase: CodexConnectionPhase): CodexConnectionStatus {
  if (phase === "connected") return "connected"
  if (phase === "connecting" || phase === "loadingSettings") return "starting"
  if (phase === "error") return "error"
  return "stopped"
}

function statusToPhase(status: CodexConnectionStatus): CodexConnectionPhase {
  if (status === "connected") return "connected"
  if (status === "starting") return "connecting"
  if (status === "error") return "error"
  return "stopped"
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string) {
  let timeout: ReturnType<typeof setTimeout> | undefined
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(message)), timeoutMs)
  })

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeout) {
      clearTimeout(timeout)
    }
  })
}

function areSettingsEqual(
  left: CodexConnectionSettings,
  right: CodexConnectionSettings
) {
  return (
    left.codexCommand === right.codexCommand &&
    left.codexEventLogPath === right.codexEventLogPath &&
    left.eventLogEnabled === right.eventLogEnabled &&
    left.eventLogPath === right.eventLogPath
  )
}

function isConnectionTraceEnabled() {
  return (
    typeof localStorage !== "undefined" &&
    localStorage.getItem(TRACE_STORAGE_KEY) === "1"
  )
}

function writeConnectionTrace(event: string, payload: ConnectionTracePayload) {
  if (!isConnectionTraceEnabled()) {
    return
  }

  const line = {
    event,
    payload,
    side: "frontend",
    ts: new Date().toISOString(),
  }
  console.info("[codex-connection-trace]", line)

  if (!isTauri()) {
    return
  }

  void invoke("codex_connection_trace", {
    input: {
      event,
      payload,
    },
  }).catch((error) => {
    console.warn("[codex-connection-trace] write failed", error)
  })
}

export function CodexConnectionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [settings, setSettings] =
    React.useState<CodexConnectionSettings>(loadSettings)
  const [health, setHealth] = React.useState<CodexHostHealth | null>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [phase, setPhase] = React.useState<CodexConnectionPhase>(
    isTauri() ? "loadingSettings" : "stopped"
  )
  const [lastError, setLastError] = React.useState<string | null>(null)
  const [isBusy, setIsBusy] = React.useState(false)
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null)
  const canManageHost = isTauri()
  const connectionAttemptRef = React.useRef(0)
  const phaseRef = React.useRef<CodexConnectionPhase>(phase)
  const settingsRef = React.useRef(settings)

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
    async (command: string, settingsOverride?: CodexConnectionSettings) => {
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
        const processStatus = await invoke<CodexHostProcessStatus>(command, {
          settings: targetSettings,
        })
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
        const savedSettings = await invoke<CodexConnectionSettings>(
          "codex_host_settings_save",
          {
            settings: nextSettings,
          }
        )
        settingsRef.current = savedSettings
        setSettings((currentSettings) =>
          areSettingsEqual(currentSettings, savedSettings)
            ? currentSettings
            : savedSettings
        )
        saveSettings(savedSettings)
        return savedSettings
      }

      settingsRef.current = nextSettings
      setSettings((currentSettings) =>
        areSettingsEqual(currentSettings, nextSettings)
          ? currentSettings
          : nextSettings
      )
      saveSettings(nextSettings)
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
        phase: phaseRef.current,
      })
      const response = await invoke<CodexRpcRequestResult>("codex_rpc_request", {
        input: {
          method,
          params,
        },
        settings: targetSettings,
      })

      writeConnectionTrace("rpc:result", {
        method,
        phase: phaseRef.current,
      })
      return response.result
    },
    [canManageHost]
  )

  const startTurn = React.useCallback(
    async (promptText: string) => {
      const threadId =
        activeThreadId ??
        readThreadId(
          await request("thread/start", {
            persistExtendedHistory: false,
            serviceName: "agent_html",
          })
        )

      if (!threadId) {
        throw new Error("Codex did not return a thread id.")
      }

      setActiveThreadId(threadId)

      const result = await request("turn/start", {
        input: [
          {
            text: promptText,
            type: "text",
          },
        ],
        threadId,
      })

      return {
        threadId,
        turnId: readTurnId(result),
      }
    },
    [activeThreadId, request]
  )

  const test = React.useCallback(async (settingsOverride?: CodexConnectionSettings) => {
    await connect(settingsOverride)
  }, [connect])

  const openLogs = React.useCallback(
    async (settingsOverride?: CodexConnectionSettings) => {
      const targetSettings = settingsOverride ?? settingsRef.current
      if (!canManageHost) {
        throw new Error(
          getOpenLogsInstructions({
            codexEventLogPath: targetSettings.codexEventLogPath,
            eventLogPath: targetSettings.eventLogPath,
            resolvedFromDefaults: false,
          })
        )
      }

      await invoke<string>("codex_host_open_logs", {
        settings: targetSettings,
      })
    },
    [canManageHost]
  )

  const updateSettings = React.useCallback(
    async (nextSettings: CodexConnectionSettings) => {
      await saveSettingsEverywhere(nextSettings)
    },
    [saveSettingsEverywhere]
  )

  React.useEffect(() => {
    if (!canManageHost) {
      setIsLoaded(true)
      return
    }

    let isCurrent = true

    void invoke<CodexConnectionSettings>("codex_host_settings_load")
      .then((loadedSettings) => {
        if (!isCurrent) {
          return
        }

        settingsRef.current = loadedSettings
        setSettings((currentSettings) =>
          areSettingsEqual(currentSettings, loadedSettings)
            ? currentSettings
            : loadedSettings
        )
        saveSettings(loadedSettings)
        writeConnectionTrace("settings:loaded", {
          command: loadedSettings.codexCommand,
          phase: phaseRef.current,
        })
        setPhase("connecting")
        return connect(loadedSettings)
      })
      .then(() => {
        if (!isCurrent) {
          return
        }

        setIsLoaded(true)
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

  const status = statusFromPhase(phase)

  const value = React.useMemo<CodexConnectionContextValue>(
    () => ({
      activeThreadId,
      canManageHost,
      phase,
      health,
      isLoaded,
      isBusy,
      lastError,
      openLogs,
      request,
      restart,
      settings,
      start,
      startTurn,
      status,
      stop,
      test,
      updateSettings,
    }),
    [
      activeThreadId,
      canManageHost,
      phase,
      health,
      isLoaded,
      isBusy,
      lastError,
      openLogs,
      request,
      restart,
      settings,
      start,
      startTurn,
      status,
      stop,
      test,
      updateSettings,
    ]
  )

  return (
    <CodexConnectionContext.Provider value={value}>
      {children}
    </CodexConnectionContext.Provider>
  )
}

export function useCodexConnection() {
  const context = React.useContext(CodexConnectionContext)
  if (!context) {
    throw new Error("useCodexConnection must be used within CodexConnectionProvider")
  }

  return context
}
