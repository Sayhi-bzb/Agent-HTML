import type {
  CodexConnectionPhase,
  CodexConnectionStatus,
  CodexHostHealth,
} from "./types"

export function normalizeStatus(
  status: CodexConnectionStatus,
  health: CodexHostHealth | null
): CodexConnectionStatus {
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

export function statusFromPhase(
  phase: CodexConnectionPhase
): CodexConnectionStatus {
  if (phase === "connected") return "connected"
  if (phase === "connecting" || phase === "loadingSettings") return "starting"
  if (phase === "error") return "error"
  return "stopped"
}

export function statusToPhase(
  status: CodexConnectionStatus
): CodexConnectionPhase {
  if (status === "connected") return "connected"
  if (status === "starting") return "connecting"
  if (status === "error") return "error"
  return "stopped"
}
