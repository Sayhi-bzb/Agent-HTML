import { mockAppState } from "@/lib/mock-data"
import { openSession, readChat, readLogs, readPreviewHtml } from "@/lib/tauri"
import type {
  AgentShellMessage,
  BuildRunSummary,
  InspectSnapshot,
  LogSnapshot,
  SessionDetail,
} from "@/lib/types"

import type { HydratedSessionState } from "./types"

export async function loadSessionState(
  sessionId: string,
): Promise<HydratedSessionState> {
  return hydrateSessionState(await openSession(sessionId))
}

export async function hydrateSessionState(
  session: SessionDetail,
): Promise<HydratedSessionState> {
  const [chat, previewHtml, logs] = await Promise.all([
    safeReadChat(session.summary.id),
    safeReadPreviewHtml(session.summary.id),
    safeReadLogs(session.summary.id),
  ])

  return {
    session,
    chat,
    logs,
    previewHtml,
  }
}

export async function safeReadPreviewHtml(
  sessionId: string,
): Promise<string | undefined> {
  try {
    return await readPreviewHtml(sessionId)
  } catch {
    return undefined
  }
}

export async function safeReadLogs(sessionId: string): Promise<LogSnapshot> {
  try {
    return await readLogs(sessionId)
  } catch {
    return {}
  }
}

export async function safeReadChat(
  sessionId: string,
): Promise<AgentShellMessage[]> {
  try {
    return await readChat(sessionId)
  } catch {
    return mockAppState.chat
  }
}

export function deriveBuildSummary(session: SessionDetail): BuildRunSummary {
  return (
    session.lastBuild ?? {
      runId: "idle",
      sessionId: session.summary.id,
      startedAt: session.summary.updatedAt,
      status: "idle",
    }
  )
}

export function deriveInspectSnapshot(session: SessionDetail): InspectSnapshot {
  return {
    sessionId: session.summary.id,
    generatedAt: session.summary.updatedAt,
    diagnostics: [],
    structureSummary: "No inspect data",
    lastBuild: session.lastBuild,
  }
}
