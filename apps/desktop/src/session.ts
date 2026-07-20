export const runtimeProtocolVersion = 1

export type AgentPipeline = "codex" | "example"

export type WorkspaceErrorCode =
  | "cancelled"
  | "inaccessible"
  | "missing-workspace"
  | "runtime-crashed"
  | "runtime-start"
  | "incompatible-runtime"
  | "unknown"

export interface WorkspaceError {
  code: WorkspaceErrorCode
  message: string
  recoverable: boolean
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
        message: `Runtime protocol ${runtime.protocolVersion} is not supported.`,
        recoverable: false,
      },
    }
  }

  return { status: "ready", ...runtime }
}

export function workspaceError(error: unknown): WorkspaceError {
  const message = error instanceof Error ? error.message : String(error)
  const normalized = message.toLowerCase()
  const code: WorkspaceErrorCode = normalized.includes("agent-html")
    ? "missing-workspace"
    : normalized.includes("incompatible")
      ? "incompatible-runtime"
      : normalized.includes("inaccessible") ||
          normalized.includes("permission denied") ||
          normalized.includes("access is denied")
        ? "inaccessible"
        : "runtime-start"
  return {
    code,
    message,
    recoverable: code !== "incompatible-runtime",
  }
}
