import type { CanvasCreateArtifactJob } from "../preferences/canvas-host-preferences"

export const createArtifactPendingTimeoutMs = 120_000

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
