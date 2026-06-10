import type { CodexThread } from "../api/api"
import type { CanvasCreateArtifactJob } from "../preferences/canvas-host-preferences"

export const createArtifactPendingTimeoutMs = 120_000

export function resolveCreateArtifactThreadId({
  activeThreadId,
  threads,
}: {
  activeThreadId: string | null
  threads: Pick<CodexThread, "id">[]
}) {
  if (!activeThreadId) {
    return null
  }

  return threads.some((thread) => thread.id === activeThreadId)
    ? activeThreadId
    : null
}

export function shouldFailCreateArtifactJob({
  job,
  now,
  timeoutMs = createArtifactPendingTimeoutMs,
}: {
  job: CanvasCreateArtifactJob | null
  now: number
  timeoutMs?: number
}) {
  return Boolean(
    job &&
      job.phase !== "failed" &&
      now - job.startedAt >= timeoutMs
  )
}

export function failCreateArtifactJob({
  error,
  job,
}: {
  error: string
  job: CanvasCreateArtifactJob
}): CanvasCreateArtifactJob {
  return {
    ...job,
    error,
    phase: "failed",
  }
}
