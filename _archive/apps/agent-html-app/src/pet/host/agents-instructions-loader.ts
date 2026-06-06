import { withTimeout } from "@/app/codex/connection/timeout"
import { readCodexTextFile } from "@/app/codex/connection/codex-settings-service"

export type AgentsInstructionsSource = "codex" | "workspace"

export type AgentsInstructionsLoadTrace = (
  event: string,
  payload: Record<string, unknown>
) => void

export type AgentsInstructionsLoadResult = {
  source: AgentsInstructionsSource
  text: string
}

export const AGENTS_READ_TIMEOUT_MS = 1500

export async function loadAgentsInstructions({
  codexRequest,
  path,
  readWorkspaceInstructions,
  sequence,
  trace,
  timeoutMs = AGENTS_READ_TIMEOUT_MS,
}: {
  codexRequest: (method: string, params: unknown) => Promise<unknown>
  path: string | null
  readWorkspaceInstructions: () => Promise<string>
  sequence: number
  timeoutMs?: number
  trace?: AgentsInstructionsLoadTrace
}): Promise<AgentsInstructionsLoadResult> {
  trace?.("settings:agents:start", {
    hasPath: Boolean(path),
    path,
    sequence,
  })

  try {
    const text = await withTimeout(
      readWorkspaceInstructions(),
      timeoutMs,
      "Workspace AGENTS.md read timed out."
    )
    trace?.("settings:agents:workspace-read:ok", {
      length: text.length,
      sequence,
    })
    return { source: "workspace", text }
  } catch (workspaceError) {
    trace?.("settings:agents:workspace-read:error", {
      error: getLoadErrorMessage(workspaceError),
      sequence,
    })
    if (!path) {
      throw workspaceError
    }
  }

  try {
    const text = await withTimeout(
      readCodexTextFile(codexRequest, path),
      timeoutMs,
      "Codex AGENTS.md read timed out."
    )
    trace?.("settings:agents:codex-read:ok", {
      length: text.length,
      path,
      sequence,
    })
    return { source: "codex", text }
  } catch (codexError) {
    trace?.("settings:agents:codex-read:error", {
      error: getLoadErrorMessage(codexError),
      path,
      sequence,
    })
    throw codexError
  }
}

function getLoadErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}
