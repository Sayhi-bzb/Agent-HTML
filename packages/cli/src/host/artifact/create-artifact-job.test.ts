import { describe, expect, it } from "vitest"

import type { CanvasCreateArtifactJob } from "../preferences/canvas-host-preferences"
import {
  createArtifactPendingTimeoutMs,
  failCreateArtifactJob,
  shouldFailCreateArtifactJob,
} from "./create-artifact-job"

const pendingJob: CanvasCreateArtifactJob = {
  filePath: "agent-html/artifacts/new-demo.artifact.tsx",
  phase: "waiting-for-artifact",
  request: "New demo",
  startedAt: 1_000,
}

describe("create artifact job decisions", () => {
  it("fails pending jobs once the create artifact timeout elapses", () => {
    expect(
      shouldFailCreateArtifactJob({
        job: pendingJob,
        now: pendingJob.startedAt + createArtifactPendingTimeoutMs - 1,
      })
    ).toBe(false)
    expect(
      shouldFailCreateArtifactJob({
        job: pendingJob,
        now: pendingJob.startedAt + createArtifactPendingTimeoutMs,
      })
    ).toBe(true)
    expect(
      shouldFailCreateArtifactJob({
        job: {
          ...pendingJob,
          phase: "failed",
        },
        now: pendingJob.startedAt + createArtifactPendingTimeoutMs,
      })
    ).toBe(false)
  })

  it("preserves create artifact job context when marking failure", () => {
    expect(
      failCreateArtifactJob({
        error: "Timed out",
        job: pendingJob,
      })
    ).toEqual({
      ...pendingJob,
      error: "Timed out",
      phase: "failed",
    })
  })
})
