export type SessionStatus = "draft" | "dirty" | "building" | "error" | "ready"

export type WorkbenchView = "preview" | "source" | "inspect"

export type SessionSummary = {
  id: string
  name: string
  directory: string
  status: SessionStatus
  updatedAt: string
  lastBuildAt?: string
  hasPreview: boolean
}

export type SessionDetail = {
  id: string
  name: string
  directory: string
  status: SessionStatus
  updatedAt: string
  lastBuildAt?: string
  hasPreview: boolean
  sourcePath: string
  previewPath?: string
  lastBuild?: BuildRunSummary
  logDirectory: string
  currentView: WorkbenchView
  source: string
}

export type DiagnosticSeverity = "info" | "warning" | "error"

export type DiagnosticItem = {
  id: string
  severity: DiagnosticSeverity
  message: string
  source: string
  line?: number
  column?: number
  code?: string
}

export type BuildRunSummary = {
  runId: string
  sessionId: string
  startedAt: string
  finishedAt?: string
  status: "idle" | "running" | "failed" | "succeeded"
  exitCode?: number
  stdoutPath?: string
  stderrPath?: string
  previewPath?: string
}

export type InspectSnapshot = {
  sessionId: string
  generatedAt: string
  diagnostics: DiagnosticItem[]
  structureSummary: string
  lastBuild?: BuildRunSummary
}

export type SourceValidationSnapshot = {
  sessionId: string
  validatedAt: string
  status: "valid" | "invalid"
  diagnostics: DiagnosticItem[]
  structureSummary: string
}

type SourceValidationState = {
  status: "idle" | "running" | "valid" | "invalid"
  validatedAt?: string
  diagnostics: DiagnosticItem[]
  structureSummary?: string
}

export type LogSnapshot = {
  stdout?: string
  stderr?: string
}

type AppErrorCode =
  | "ui-validation"
  | "session-io"
  | "cli-launch"
  | "build-failed"
  | "inspect-failed"
  | "preview-missing"

type AppError = {
  code: AppErrorCode
  message: string
  details?: string
  sessionId?: string
  runId?: string
}

export type AppState = {
  sessions: SessionSummary[]
  currentSession: SessionDetail
  currentInspect: InspectSnapshot
  currentBuild: BuildRunSummary
  currentLogs: LogSnapshot
}
