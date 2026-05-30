export type CodexConnectionStatus =
  | "connected"
  | "disconnected"
  | "error"
  | "starting"
  | "stopped"

export type CodexConnectionSettings = {
  codexCommand: string
}

export type WorkspaceRootSettings = {
  rootPath: string
}

export type WorkspaceRootStatus = {
  defaultRootPath: string
  pendingRootPath: string
  rootPath: string
  settings: WorkspaceRootSettings
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

export type CodexRuntimeCapabilityItem = {
  id?: string
  name: string
  source?: string
  status?: string
}

export type CodexRuntimeCapabilityStatus = {
  count?: number
  error?: string
  items?: CodexRuntimeCapabilityItem[]
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

export type CodexHostProcessStatus = {
  health: CodexHostHealth
  pid?: number | null
  status: CodexConnectionStatus
}

export type CodexRpcRequestResult = {
  result: unknown
}

export type CodexTurnStartResult = {
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

export type CodexTurnInterruptInput = {
  threadId: string
  turnId?: string | null
}

export type CodexRuntimeReadSpec = {
  capability: CodexRuntimeCapability
  method: string
  params: (input: { cwd?: string | null }) => unknown
}

export type CodexConnectionPhase =
  | "connected"
  | "connecting"
  | "error"
  | "loadingSettings"
  | "stopped"

export type ApplyProcessStatusOptions = {
  allowConnectingPhase?: boolean
}

export type ConnectionTracePayload = Record<string, unknown>

export type ScheduledCodexAutoConnect = {
  cancel: () => void
}

export type CodexConnectionContextValue = {
  activeThreadId: string | null
  canManageHost: boolean
  phase: CodexConnectionPhase
  health: CodexHostHealth | null
  isLoaded: boolean
  isBusy: boolean
  lastError: string | null
  interruptTurn: (input: CodexTurnInterruptInput) => Promise<void>
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
  updateWorkspaceRootSettings: (
    settings: WorkspaceRootSettings
  ) => Promise<WorkspaceRootStatus>
  workspaceRootStatus: WorkspaceRootStatus | null
}
