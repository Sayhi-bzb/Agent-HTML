import * as React from "react"
import { invoke, isTauri } from "@tauri-apps/api/core"

export type CodexConnectionStatus =
  | "connected"
  | "disconnected"
  | "error"
  | "starting"
  | "stopped"

export type CodexConnectionSettings = {
  bridgeHost: string
  bridgePort: number
  codexCommand: string
  codexEventLogPath: string
  eventLogEnabled: boolean
  eventLogPath: string
  workspaceCwd: string
}

export type CodexBridgeHealth = {
  appServerRunning: boolean
  codexCommand?: string | null
  connected: boolean
  cwd?: string | null
  error?: string | null
  ok: boolean
  provider?: string | null
  stderr?: string | null
  status: CodexConnectionStatus
  threadId?: string | null
}

export type CodexBridgeOwnership = "external" | "managed"

type CodexBridgeProcessStatus = {
  bridgeUrl: string
  health: CodexBridgeHealth
  ownership: CodexBridgeOwnership
  pid?: number | null
  status: CodexConnectionStatus
}

type CodexConnectionContextValue = {
  bridgeUrl: string | null
  canManageBridge: boolean
  health: CodexBridgeHealth | null
  isBusy: boolean
  lastError: string | null
  ownership: CodexBridgeOwnership | null
  settings: CodexConnectionSettings
  status: CodexConnectionStatus
  start: (settingsOverride?: CodexConnectionSettings) => Promise<void>
  stop: (settingsOverride?: CodexConnectionSettings) => Promise<void>
  restart: (settingsOverride?: CodexConnectionSettings) => Promise<void>
  test: (settingsOverride?: CodexConnectionSettings) => Promise<void>
  updateSettings: (settings: CodexConnectionSettings) => void
}

const STORAGE_KEY = "agent-html.codex-connection"

const CodexConnectionContext = React.createContext<
  CodexConnectionContextValue | undefined
>(undefined)

function getDefaultCodexCommand() {
  return typeof navigator !== "undefined" && navigator.platform.includes("Win")
    ? "codex.cmd"
    : "codex"
}

function getDefaultWorkspaceCwd() {
  return ""
}

function getDefaultSettings(): CodexConnectionSettings {
  return {
    bridgeHost: "127.0.0.1",
    bridgePort: 51279,
    codexCommand: getDefaultCodexCommand(),
    codexEventLogPath: ".tmp\\agent-html-codex-app-server-events.jsonl",
    eventLogEnabled: false,
    eventLogPath: ".tmp\\agent-html-codex-events.jsonl",
    workspaceCwd: getDefaultWorkspaceCwd(),
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
      bridgeHost:
        typeof parsed.bridgeHost === "string"
          ? parsed.bridgeHost
          : defaults.bridgeHost,
      bridgePort:
        typeof parsed.bridgePort === "number"
          ? parsed.bridgePort
          : defaults.bridgePort,
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
      workspaceCwd:
        typeof parsed.workspaceCwd === "string"
          ? parsed.workspaceCwd
          : defaults.workspaceCwd,
    }
  } catch {
    return getDefaultSettings()
  }
}

function saveSettings(settings: CodexConnectionSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

function createBridgeUrl(settings: CodexConnectionSettings) {
  return `http://${settings.bridgeHost}:${settings.bridgePort}/agent-html/events`
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function normalizeStatus(status: CodexConnectionStatus, health: CodexBridgeHealth | null) {
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
  const [health, setHealth] = React.useState<CodexBridgeHealth | null>(null)
  const [status, setStatus] =
    React.useState<CodexConnectionStatus>("disconnected")
  const [lastError, setLastError] = React.useState<string | null>(null)
  const [ownership, setOwnership] =
    React.useState<CodexBridgeOwnership | null>(null)
  const [isBusy, setIsBusy] = React.useState(false)
  const canManageBridge = isTauri()

  const applyProcessStatus = React.useCallback(
    (processStatus: CodexBridgeProcessStatus) => {
      setHealth(processStatus.health)
      setOwnership(processStatus.ownership)
      setStatus(normalizeStatus(processStatus.status, processStatus.health))
      setLastError(processStatus.health.error ?? processStatus.health.stderr ?? null)
    },
    []
  )

  const runCommand = React.useCallback(
    async (command: string, settingsOverride?: CodexConnectionSettings) => {
      if (!canManageBridge) {
        throw new Error("Desktop runtime required to manage Codex.")
      }

      const processStatus = await invoke<CodexBridgeProcessStatus>(command, {
        settings: settingsOverride ?? settings,
      })
      applyProcessStatus(processStatus)
    },
    [applyProcessStatus, canManageBridge, settings]
  )

  const start = React.useCallback(async (settingsOverride?: CodexConnectionSettings) => {
    setIsBusy(true)
    setStatus("starting")
    setLastError(null)

    try {
      await runCommand("codex_bridge_start", settingsOverride)
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
      await runCommand("codex_bridge_stop", settingsOverride)
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

    try {
      await runCommand("codex_bridge_restart", settingsOverride)
    } catch (error) {
      setStatus("error")
      setLastError(getErrorMessage(error))
    } finally {
      setIsBusy(false)
    }
  }, [runCommand])

  const test = React.useCallback(async (settingsOverride?: CodexConnectionSettings) => {
    setIsBusy(true)
    setLastError(null)

    try {
      await runCommand("codex_bridge_health", settingsOverride)
    } catch (error) {
      setStatus("error")
      setLastError(getErrorMessage(error))
    } finally {
      setIsBusy(false)
    }
  }, [runCommand])

  const updateSettings = React.useCallback(
    (nextSettings: CodexConnectionSettings) => {
      setSettings(nextSettings)
      saveSettings(nextSettings)
    },
    []
  )

  React.useEffect(() => {
    if (!canManageBridge || status !== "connected") {
      return undefined
    }

    const interval = window.setInterval(() => {
      void runCommand("codex_bridge_health")
    }, 5000)

    return () => window.clearInterval(interval)
  }, [canManageBridge, runCommand, status])

  const value = React.useMemo<CodexConnectionContextValue>(
    () => ({
      bridgeUrl: status === "connected" ? createBridgeUrl(settings) : null,
      canManageBridge,
      health,
      isBusy,
      lastError,
      ownership,
      restart,
      settings,
      start,
      status,
      stop,
      test,
      updateSettings,
    }),
    [
      canManageBridge,
      health,
      isBusy,
      lastError,
      ownership,
      restart,
      settings,
      start,
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
