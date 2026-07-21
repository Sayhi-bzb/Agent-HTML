import { describe, expect, it } from "vitest"

import type { HostTranslator } from "../i18n/host-i18n"
import type { CanvasCreateArtifactJob } from "../preferences/canvas-host-preferences"
import {
  createArtifactStatusMessage,
  createInitialCreateArtifactWorkflowState,
  reduceCreateArtifactWorkflow,
} from "./use-create-artifact-workflow"

function createJob(
  phase: CanvasCreateArtifactJob["phase"],
  filePath = "agent-html/artifacts/report.artifact.tsx"
): CanvasCreateArtifactJob {
  return {
    error: phase === "failed" ? "Generation failed" : undefined,
    filePath,
    phase,
    request: "Create a report",
    startedAt: 1_000,
  }
}

describe("create artifact workflow state", () => {
  it("restores only active jobs into create mode", () => {
    expect(createInitialCreateArtifactWorkflowState(null)).toMatchObject({
      job: null,
      mode: "artifact",
      status: { kind: "idle" },
    })
    expect(
      createInitialCreateArtifactWorkflowState(createJob("starting"))
    ).toMatchObject({ mode: "create-artifact", status: { kind: "creating" } })
    expect(
      createInitialCreateArtifactWorkflowState(
        createJob("waiting-for-artifact")
      )
    ).toMatchObject({ mode: "create-artifact", status: { kind: "waiting" } })
    expect(
      createInitialCreateArtifactWorkflowState(createJob("failed"))
    ).toMatchObject({
      mode: "artifact",
      status: { kind: "failed", message: "Generation failed" },
    })
  })

  it("does not equate a submitted request with a ready artifact", () => {
    const initial = createInitialCreateArtifactWorkflowState(null)
    const startedJob = createJob("starting")
    const waitingJob = createJob("waiting-for-artifact")
    const started = reduceCreateArtifactWorkflow(initial, {
      job: startedJob,
      type: "started",
    })
    const waiting = reduceCreateArtifactWorkflow(started, {
      job: waitingJob,
      type: "waiting",
    })

    expect(waiting).toMatchObject({
      job: waitingJob,
      mode: "create-artifact",
      status: { kind: "waiting" },
    })

    expect(
      reduceCreateArtifactWorkflow(waiting, { type: "ready" })
    ).toMatchObject({
      draft: "",
      job: null,
      mode: "artifact",
      status: { kind: "ready" },
    })
  })

  it("keeps failure terminal against a late ready event", () => {
    const waiting = createInitialCreateArtifactWorkflowState(
      createJob("waiting-for-artifact")
    )
    const failed = reduceCreateArtifactWorkflow(waiting, {
      message: "Timed out",
      type: "failed",
    })

    expect(failed).toMatchObject({
      job: { error: "Timed out", phase: "failed" },
      status: { kind: "failed", message: "Timed out" },
    })
    expect(
      reduceCreateArtifactWorkflow(failed, { type: "ready" })
    ).toBe(failed)
  })

  it("translates semantic status at render time", () => {
    const status = createInitialCreateArtifactWorkflowState(
      createJob("starting")
    ).status
    const english = ((key: string) => `en:${key}`) as HostTranslator
    const chinese = ((key: string) => `zh:${key}`) as HostTranslator

    expect(createArtifactStatusMessage(status, english)).toBe(
      "en:app.creatingArtifact"
    )
    expect(createArtifactStatusMessage(status, chinese)).toBe(
      "zh:app.creatingArtifact"
    )
  })
})
