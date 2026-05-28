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

type CodexHostLogPaths = {
  codexEventLogPath: string
  eventLogPath: string
  resolvedFromDefaults: boolean
}

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

export function CodexConnectionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [settings, setSettings] =
    React.useState<CodexConnectionSettings>(loadSettings)
  const [health, setHealth] = React.useState<CodexHostHealth | null>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [status, setStatus] =
    React.useState<CodexConnectionStatus>("disconnected")
  const [lastError, setLastError] = React.useState<string | null>(null)
  const [isBusy, setIsBusy] = React.useState(false)
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null)
  const canManageHost = isTauri()

  const applyProcessStatus = React.useCallback(
    (processStatus: CodexHostProcessStatus) => {
      setHealth(processStatus.health)
      setStatus(normalizeStatus(processStatus.status, processStatus.health))
      setLastError(processStatus.health.error ?? processStatus.health.stderr ?? null)
    },
    []
  )

  const runCommand = React.useCallback(
    async (command: string, settingsOverride?: CodexConnectionSettings) => {
      if (!canManageHost) {
        throw new Error("Desktop runtime required to manage Codex.")
      }

      validateSettings(settingsOverride ?? settings)

      const processStatus = await invoke<CodexHostProcessStatus>(command, {
        settings: settingsOverride ?? settings,
      })
      applyProcessStatus(processStatus)
    },
    [applyProcessStatus, canManageHost, settings]
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
        setSettings(savedSettings)
        saveSettings(savedSettings)
        return savedSettings
      }

      setSettings(nextSettings)
      saveSettings(nextSettings)
      return nextSettings
    },
    [canManageHost]
  )

  const connect = React.useCallback(async (settingsOverride?: CodexConnectionSettings) => {
    setIsBusy(true)
    setStatus("starting")
    setLastError(null)

    try {
      await runCommand("codex_host_start", settingsOverride)
    } catch (error) {
      setStatus("error")
      setLastError(getErrorMessage(error))
    } finally {
      setIsBusy(false)
    }
  }, [runCommand])

  const stop = React.useCallback(async (settingsOverride?: CodexConnectionSettings) => {
    setIsBusy(true)
    setLastError(null)

    try {
      await runCommand("codex_host_stop", settingsOverride)
      setActiveThreadId(null)
    } catch (error) {
      setStatus("error")
      setLastError(getErrorMessage(error))
    } finally {
      setIsBusy(false)
    }
  }, [runCommand])

  const restart = React.useCallback(async (settingsOverride?: CodexConnectionSettings) => {
    setIsBusy(true)
    setStatus("starting")
    setLastError(null)
    setActiveThreadId(null)

    try {
      await runCommand("codex_host_restart", settingsOverride)
    } catch (error) {
      setStatus("error")
      setLastError(getErrorMessage(error))
    } finally {
      setIsBusy(false)
    }
  }, [runCommand])

  const start = React.useCallback(async (settingsOverride?: CodexConnectionSettings) => {
    await connect(settingsOverride)
  }, [connect])

  const request = React.useCallback(
    async (method: string, params: unknown) => {
      if (!canManageHost) {
        throw new Error("Desktop runtime required to manage Codex.")
      }

      validateSettings(settings)

      const response = await invoke<CodexRpcRequestResult>("codex_rpc_request", {
        input: {
          method,
          params,
        },
        settings,
      })

      return response.result
    },
    [canManageHost, settings]
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
      const targetSettings = settingsOverride ?? settings
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
    [canManageHost, settings]
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

        setSettings(loadedSettings)
        saveSettings(loadedSettings)
        setIsLoaded(true)
        return connect(loadedSettings)
      })
      .catch((error) => {
        if (!isCurrent) {
          return
        }

        setStatus("error")
        setLastError(getErrorMessage(error))
        setIsLoaded(true)
      })
    return () => {
      isCurrent = false
    }
  }, [canManageHost, connect])

  React.useEffect(() => {
    if (!canManageHost || status !== "connected") {
      return undefined
    }

    const interval = window.setInterval(() => {
      void runCommand("codex_host_health")
    }, 5000)

    return () => window.clearInterval(interval)
  }, [canManageHost, runCommand, status])

  const value = React.useMemo<CodexConnectionContextValue>(
    () => ({
      activeThreadId,
      canManageHost,
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
