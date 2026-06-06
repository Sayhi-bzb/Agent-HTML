import type {
  CodexRuntimeCapabilityStatus,
  CodexRuntimeStatus,
} from "@/app/codex/connection"

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "Unable to update AGENTS.md."
}

export function isNonBlockingCodexNoise(message: string | null | undefined) {
  if (!message) {
    return false
  }

  return (
    message.includes("rmcp::transport::worker") ||
    (message.includes("Transport channel closed") &&
      message.includes("developers.openai.com/mcp")) ||
    (message.includes("http/request failed") &&
      message.includes("developers.openai.com/mcp"))
  )
}

export function formatCapability(
  capability: CodexRuntimeCapabilityStatus,
  runtimeStatus: CodexRuntimeStatus["status"]
) {
  if (runtimeStatus === "idle") {
    return "Not loaded"
  }

  if (runtimeStatus === "loading") {
    return ""
  }

  if (!capability.ok) {
    return capability.error ?? "Unavailable"
  }

  return typeof capability.count === "number"
    ? `${capability.count} available`
    : "Available"
}