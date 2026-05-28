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
}

export type CodexHostHealth = {
  appServerRunning: boolean
  codexCommand?: string | null
  connected: boolean
  cwd?: string | null
  error?: string | null
  ok: boolean
  stderr?: string | null
  status: CodexConnectionStatus
}

export type CodexRuntimeCapability =
  | "apps"
  | "collaborationModes"
  | "config"
  | "mcpServers"
  | "models"
  | "plugins"
  | "skills"

export type CodexRuntimeCapabilityStatus = {
  count?: number
  error?: string
  ok: boolean
}

export type CodexRuntimeStatus = {
  capabilities: Record<CodexRuntimeCapability, CodexRuntimeCapabilityStatus>
  config: {
    approvalPolicy?: string
    model?: string
    modelProvider?: string
    sandboxMode?: string
  }
  error?: string | null
  loadedAt?: string
  status: "idle" | "loading" | "ready" | "error"
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

export type CodexThreadSummary = {
  createdAt?: string
  id: string
  name?: string | null
  status?: string | null
  updatedAt?: string
}

export type CodexThreadListState = {
  error?: string | null
  isLoading: boolean
  items: CodexThreadSummary[]
  loadedAt?: string
}

type CodexRuntimeReadSpec = {
  capability: CodexRuntimeCapability
  method: string
  params: (input: { cwd?: string | null }) => unknown
}

type CodexConnectionContextValue = {
  activeThreadId: string | null
  canManageHost: boolean
  phase: CodexConnectionPhase
  health: CodexHostHealth | null
  isLoaded: boolean
  isBusy: boolean
  lastError: string | null
  refreshRuntimeStatus: () => Promise<void>
  refreshThreads: () => Promise<void>
  request: (method: string, params: unknown) => Promise<unknown>
  resumeThread: (threadId: string) => Promise<void>
  runtimeStatus: CodexRuntimeStatus
  settings: CodexConnectionSettings
  status: CodexConnectionStatus
  start: (settingsOverride?: CodexConnectionSettings) => Promise<void>
  startNewThread: () => Promise<string>
  startTurn: (input: {
    promptText: string
    threadId: string
  }) => Promise<CodexTurnStartResult>
  stop: (settingsOverride?: CodexConnectionSettings) => Promise<void>
  threadList: CodexThreadListState
  restart: (settingsOverride?: CodexConnectionSettings) => Promise<void>
  test: (settingsOverride?: CodexConnectionSettings) => Promise<void>
  updateSettings: (settings: CodexConnectionSettings) => Promise<void>
}

const TRACE_STORAGE_KEY = "agent-html.codex-connection-trace"
const ACTIVE_THREAD_STORAGE_KEY = "agent-html.codex-active-thread-id"
const CONNECTION_TIMEOUT_MS = 30000
const THREAD_LIST_LIMIT = 50
const TRACE_TEXT_LIMIT = 240

export type CodexConnectionPhase =
  | "connected"
  | "connecting"
  | "error"
  | "loadingSettings"
  | "stopped"

type ApplyProcessStatusOptions = {
  allowConnectingPhase?: boolean
}

type ConnectionTracePayload = Record<string, unknown>

const CODEX_RUNTIME_READS: CodexRuntimeReadSpec[] = [
  {
    capability: "config",
    method: "config/read",
    params: () => ({}),
  },
  {
    capability: "models",
    method: "model/list",
    params: () => ({ includeHidden: false }),
  },
  {
    capability: "collaborationModes",
    method: "collaborationMode/list",
    params: () => ({}),
  },
  {
    capability: "skills",
    method: "skills/list",
    params: ({ cwd }) => (cwd ? { cwds: [cwd] } : { cwds: [] }),
  },
  {
    capability: "plugins",
    method: "plugin/list",
    params: () => ({ limit: 100 }),
  },
  {
    capability: "apps",
    method: "app/list",
    params: () => ({ limit: 100 }),
  },
  {
    capability: "mcpServers",
    method: "mcpServerStatus/list",
    params: () => ({ detail: "toolsAndAuthOnly", limit: 100 }),
  },
]

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
  }
}

function loadSettings(): CodexConnectionSettings {
  return getDefaultSettings()
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

function readString(value: unknown, keys: string[]) {
  let current = value
  for (const key of keys) {
    const object = readObject(current)
    if (!object) {
      return undefined
    }
    current = object[key]
  }

  return typeof current === "string" ? current : undefined
}

function readScalarAsString(value: unknown, keys: string[]) {
  let current = value
  for (const key of keys) {
    const object = readObject(current)
    if (!object) {
      return undefined
    }
    current = object[key]
  }

  if (typeof current === "string") {
    return current
  }

  if (typeof current === "number") {
    return String(current)
  }

  return undefined
}

export function readThreadId(value: unknown) {
  const result = readObject(value)
  const thread = readObject(result?.thread)
  return (
    (typeof thread?.id === "string" && thread.id) ||
    (typeof result?.threadId === "string" && result.threadId) ||
    (typeof result?.id === "string" && result.id) ||
    null
  )
}

function readTurnId(value: unknown) {
  const result = readObject(value)
  const turn = readObject(result?.turn)
  return typeof turn?.id === "string" ? turn.id : null
}

export function readThreads(value: unknown): CodexThreadSummary[] {
  const result = readObject(value)
  const rawThreads =
    (Array.isArray(result?.data) && result.data) ||
    (Array.isArray(result?.threads) && result.threads) ||
    (Array.isArray(result?.items) && result.items) ||
    (Array.isArray(value) && value) ||
    []

  return rawThreads
    .map((rawThread) => {
      const thread = readObject(rawThread)
      const id = typeof thread?.id === "string" ? thread.id : null
      if (!id) {
        return null
      }

      return {
        createdAt:
          readScalarAsString(thread, ["createdAt"]) ??
          readScalarAsString(thread, ["created_at"]) ??
          readScalarAsString(thread, ["created"]),
        id,
        name:
          readString(thread, ["name"]) ??
          readString(thread, ["title"]) ??
          null,
        status: readString(thread, ["status"]) ?? null,
        updatedAt:
          readScalarAsString(thread, ["updatedAt"]) ??
          readScalarAsString(thread, ["updated_at"]) ??
          readScalarAsString(thread, ["lastUpdatedAt"]),
      }
    })
    .filter((thread): thread is CodexThreadSummary => thread !== null)
}

function createThreadListParams(cwd?: string | null) {
  return {
    ...(cwd ? { cwd } : {}),
    limit: THREAD_LIST_LIMIT,
    sortKey: "updated_at",
    sourceKinds: ["appServer", "vscode", "cli"],
  }
}

function createIdleThreadList(): CodexThreadListState {
  return {
    error: null,
    isLoading: false,
    items: [],
  }
}

function createIdleRuntimeStatus(): CodexRuntimeStatus {
  return {
    capabilities: {
      apps: { ok: false },
      collaborationModes: { ok: false },
      config: { ok: false },
      mcpServers: { ok: false },
      models: { ok: false },
      plugins: { ok: false },
      skills: { ok: false },
    },
    config: {},
    error: null,
    status: "idle",
  }
}

function countItems(value: unknown): number | undefined {
  if (Array.isArray(value)) {
    return value.length
  }

  const object = readObject(value)
  if (!object) {
    return undefined
  }

  for (const key of [
    "apps",
    "collaborationModes",
    "items",
    "models",
    "plugins",
    "servers",
    "skills",
  ]) {
    const child = object[key]
    if (Array.isArray(child)) {
      return child.length
    }
  }

  return undefined
}

function readEffectiveConfig(value: unknown): CodexRuntimeStatus["config"] {
  const config = readObject(value)?.config ?? value

  return {
    approvalPolicy:
      readString(config, ["approval_policy"]) ??
      readString(config, ["approvalPolicy"]),
    model: readString(config, ["model"]),
    modelProvider:
      readString(config, ["model_provider"]) ??
      readString(config, ["modelProvider"]),
    sandboxMode:
      readString(config, ["sandbox_mode"]) ??
      readString(config, ["sandboxMode"]),
  }
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
  return left.codexCommand === right.codexCommand
}

function isConnectionTraceEnabled() {
  return (
    typeof localStorage !== "undefined" &&
    localStorage.getItem(TRACE_STORAGE_KEY) === "1"
  )
}

function truncateTraceText(value: string) {
  return value.length > TRACE_TEXT_LIMIT
    ? `${value.slice(0, TRACE_TEXT_LIMIT)}...`
    : value
}

function summarizeTraceValue(value: unknown): unknown {
  if (typeof value === "string") {
    return truncateTraceText(value)
  }

  if (Array.isArray(value)) {
    return value.slice(0, 5).map(summarizeTraceValue)
  }

  const object = readObject(value)
  if (!object) {
    return value
  }

  const summary: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(object)) {
    if (key === "text" || key === "promptText") {
      summary[key] = typeof child === "string" ? `<text:${child.length}>` : child
      continue
    }
    summary[key] = summarizeTraceValue(child)
  }
  return summary
}

function summarizeRpcResult(value: unknown) {
  const object = readObject(value)
  if (!object) {
    return summarizeTraceValue(value)
  }

  const threadId = readThreadId(value)
  const turnId = readTurnId(value)
  const threads = readThreads(value)
  return {
    keys: Object.keys(object),
    threadCount: threads.length || undefined,
    threadId: threadId ?? undefined,
    turnId: turnId ?? undefined,
  }
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
  const [health, setHealth] = React.useState<CodexHostHealth | null>(null)
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [phase, setPhase] = React.useState<CodexConnectionPhase>(
    isTauri() ? "loadingSettings" : "stopped"
  )
  const [lastError, setLastError] = React.useState<string | null>(null)
  const [isBusy, setIsBusy] = React.useState(false)
  const [runtimeStatus, setRuntimeStatus] =
    React.useState<CodexRuntimeStatus>(createIdleRuntimeStatus)
  const [threadList, setThreadList] =
    React.useState<CodexThreadListState>(createIdleThreadList)
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
        result: summarizeRpcResult(response.result),
      })
      return response.result
    },
    [canManageHost]
  )

  const refreshRuntimeStatus = React.useCallback(async () => {
    if (!canManageHost || phaseRef.current !== "connected") {
      setRuntimeStatus(createIdleRuntimeStatus())
      return
    }

    setRuntimeStatus((currentStatus) => ({
      ...currentStatus,
      error: null,
      status: "loading",
    }))

    const entries = await Promise.all(
      CODEX_RUNTIME_READS.map(async (spec) => {
        try {
          const result = await request(spec.method, spec.params({ cwd: health?.cwd }))
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

    const capabilities = createIdleRuntimeStatus().capabilities
    let config: CodexRuntimeStatus["config"] = {}
    for (const entry of entries) {
      capabilities[entry.capability] = entry.status
      if (entry.capability === "config" && entry.status.ok) {
        config = readEffectiveConfig(entry.result)
      }
    }

    const hasSuccess = entries.some((entry) => entry.status.ok)
    const hasFailure = entries.some((entry) => !entry.status.ok)
    setRuntimeStatus({
      capabilities,
      config,
      error: hasSuccess || !hasFailure ? null : "Unable to read Codex status.",
      loadedAt: new Date().toISOString(),
      status: hasSuccess ? "ready" : "error",
    })
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
      const primaryResult = await request(
        "thread/list",
        createThreadListParams(health?.cwd)
      )
      let items = readThreads(primaryResult)
      if (items.length === 0 && health?.cwd) {
        writeConnectionTrace("thread:list:fallback-without-cwd", {
          cwd: health.cwd,
        })
        items = readThreads(await request("thread/list", createThreadListParams()))
      }
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
      await request("thread/resume", { threadId })
      setActiveThreadId(threadId)
      storeActiveThreadId(threadId)
    },
    [request]
  )

  const startNewThread = React.useCallback(async () => {
    const threadId = readThreadId(
      await request("thread/start", {
        persistExtendedHistory: false,
        serviceName: "agent_html",
      })
    )

    if (!threadId) {
      throw new Error("Codex did not return a thread id.")
    }

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
      if (!threadId) {
        throw new Error("Choose a Codex thread before sending a request.")
      }

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
  }, [phase, refreshThreads])

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
    }),
    [
      activeThreadId,
      canManageHost,
      phase,
      health,
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
