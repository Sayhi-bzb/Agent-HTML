export const runtimeProtocolVersion = 1

export type AgentPipeline = "codex" | "example"

export type WorkspaceErrorCode =
  | "invalid-selection"
  | "inaccessible"
  | "missing-workspace"
  | "runtime-bundle-invalid"
  | "initialization-failed"
  | "runtime-start-failed"
  | "runtime-exited"
  | "runtime-timeout"
  | "incompatible-runtime"
  | "internal"

export type WorkspaceErrorPhase =
  | "workspace-selection"
  | "workspace-initialization"
  | "runtime-start"
  | "runtime-readiness"
  | "runtime-stop"

export interface WorkspaceError {
  code: WorkspaceErrorCode
  phase: WorkspaceErrorPhase
  message: string
  recoverable: boolean
  logPath?: string
  exitCode?: number
}

export type WorkspaceSession =
  | { status: "idle" }
  | {
      status: "opening" | "initializing" | "starting"
      root: string
    }
  | {
      status: "ready"
      root: string
      runtimeUrl: string
      bootstrapUrl: string
      protocolVersion: number
    }
  | { status: "failed"; root?: string; error: WorkspaceError }
  | { status: "closing"; root: string }

export interface OpenWorkspaceRequest {
  path: string
  initialize: boolean
  pipeline: AgentPipeline
}

export interface RuntimeReady {
  root: string
  runtimeUrl: string
  bootstrapUrl: string
  protocolVersion: number
}

export function readySession(runtime: RuntimeReady): WorkspaceSession {
  if (runtime.protocolVersion !== runtimeProtocolVersion) {
    return {
      status: "failed",
      root: runtime.root,
      error: {
        code: "incompatible-runtime",
        phase: "runtime-readiness",
        message: `Runtime protocol ${runtime.protocolVersion} is not supported.`,
        recoverable: false,
      },
    }
  }

  return { status: "ready", ...runtime }
}

export function workspaceError(error: unknown): WorkspaceError {
  if (isWorkspaceError(error)) return error

  const message = error instanceof Error ? error.message : String(error)
  return {
    code: "internal",
    phase: "runtime-start",
    message,
    recoverable: true,
  }
}

function isWorkspaceError(error: unknown): error is WorkspaceError {
  if (!error || typeof error !== "object") return false
  const candidate = error as Partial<WorkspaceError>
  return (
    typeof candidate.code === "string" &&
    typeof candidate.phase === "string" &&
    typeof candidate.message === "string" &&
    typeof candidate.recoverable === "boolean"
  )
}
