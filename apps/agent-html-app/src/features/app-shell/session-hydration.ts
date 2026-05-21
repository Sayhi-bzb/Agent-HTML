import { openSession, readLogs, readPreviewHtml } from "@/lib/tauri"
import type {
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
  const [previewHtml, logs] = await Promise.all([
    safeReadPreviewHtml(session.id),
    safeReadLogs(session.id),
  ])

  return {
    session,
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

export function deriveBuildSummary(session: SessionDetail): BuildRunSummary {
  return (
    session.lastBuild ?? {
      runId: "idle",
      sessionId: session.id,
      startedAt: session.updatedAt,
      status: "idle",
    }
  )
}

export function deriveInspectSnapshot(session: SessionDetail): InspectSnapshot {
  return {
    sessionId: session.id,
    generatedAt: session.updatedAt,
    diagnostics: [],
    structureSummary: "No inspect data",
    lastBuild: session.lastBuild,
  }
}
