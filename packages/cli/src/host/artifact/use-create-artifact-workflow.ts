import * as React from "react"

import { createArtifact } from "../api/api"
import type { HostTranslator } from "../i18n/host-i18n"
import { createArtifactFilePathForRequest } from "../pipeline"
import type { CanvasCreateArtifactJob } from "../preferences/canvas-host-preferences"
import {
  createArtifactPendingTimeoutMs,
  failCreateArtifactJob,
  shouldFailCreateArtifactJob,
} from "./create-artifact-job"

export type CanvasHostMode = "artifact" | "create-artifact"

type CreateArtifactStatus =
  | { kind: "idle" }
  | { kind: "creating" }
  | { kind: "waiting" }
  | { kind: "ready" }
  | { kind: "failed"; message: string }

export type CreateArtifactWorkflowState = {
  draft: string
  job: CanvasCreateArtifactJob | null
  mode: CanvasHostMode
  status: CreateArtifactStatus
}

type CreateArtifactWorkflowAction =
  | { type: "clear" }
  | { type: "failed"; message: string }
  | { type: "ready" }
  | { type: "select-artifact" }
  | { type: "select-create-artifact" }
  | { draft: string; type: "set-draft" }
  | { job: CanvasCreateArtifactJob; type: "started" }
  | { job: CanvasCreateArtifactJob; type: "waiting" }

export function resolveInitialCanvasHostMode(
  createArtifactJob: CanvasCreateArtifactJob | null
): CanvasHostMode {
  return createArtifactJob && createArtifactJob.phase !== "failed"
    ? "create-artifact"
    : "artifact"
}

export function createInitialCreateArtifactWorkflowState(
  job: CanvasCreateArtifactJob | null
): CreateArtifactWorkflowState {
  const status: CreateArtifactStatus = !job
    ? { kind: "idle" }
    : job.phase === "failed"
      ? { kind: "failed", message: job.error ?? "Artifact creation failed" }
      : job.phase === "starting"
        ? { kind: "creating" }
        : { kind: "waiting" }

  return {
    draft: "",
    job,
    mode: resolveInitialCanvasHostMode(job),
    status,
  }
}

export function reduceCreateArtifactWorkflow(
  state: CreateArtifactWorkflowState,
  action: CreateArtifactWorkflowAction
): CreateArtifactWorkflowState {
  switch (action.type) {
    case "clear":
      return { ...state, job: null, status: { kind: "idle" } }
    case "failed":
      return state.job
        ? {
            ...state,
            job: failCreateArtifactJob({
              error: action.message,
              job: state.job,
            }),
            status: { kind: "failed", message: action.message },
          }
        : state
    case "ready":
      return state.job && state.job.phase !== "failed"
        ? {
            draft: "",
            job: null,
            mode: "artifact",
            status: { kind: "ready" },
          }
        : state
    case "select-artifact":
      return { ...state, mode: "artifact" }
    case "select-create-artifact":
      return { ...state, mode: "create-artifact" }
    case "set-draft":
      return { ...state, draft: action.draft }
    case "started":
      return {
        ...state,
        job: action.job,
        mode: "create-artifact",
        status: { kind: "creating" },
      }
    case "waiting":
      return {
        ...state,
        job: action.job,
        status: { kind: "waiting" },
      }
  }
}

export function createArtifactStatusMessage(
  status: CreateArtifactStatus,
  t: HostTranslator
) {
  switch (status.kind) {
    case "creating":
      return t("app.creatingArtifact")
    case "waiting":
      return t("app.waitingForArtifact")
    case "ready":
      return t("app.artifactReady")
    case "failed":
      return status.message
    case "idle":
      return ""
  }
}

export function useCreateArtifactWorkflow({
  initialJob,
  t,
}: {
  initialJob: CanvasCreateArtifactJob | null
  t: HostTranslator
}) {
  const [state, dispatch] = React.useReducer(
    reduceCreateArtifactWorkflow,
    initialJob,
    createInitialCreateArtifactWorkflowState
  )
  const activeAttemptRef = React.useRef(0)
  const activeJobRef = React.useRef(state.job)

  React.useEffect(() => {
    const job = state.job
    if (!job || job.phase === "failed") {
      return
    }

    const failExpiredJob = () => {
      if (
        !shouldFailCreateArtifactJob({
          job,
          now: Date.now(),
        })
      ) {
        return
      }

      const error = t("app.artifactCreationTimedOut", {
        filePath: job.filePath,
      })
      activeAttemptRef.current += 1
      activeJobRef.current = failCreateArtifactJob({
        error,
        job,
      })
      dispatch({
        message: error,
        type: "failed",
      })
    }
    const remainingMs = Math.max(
      0,
      createArtifactPendingTimeoutMs - (Date.now() - job.startedAt)
    )
    const timeoutId = window.setTimeout(failExpiredJob, remainingMs)

    return () => window.clearTimeout(timeoutId)
  }, [state.job, t])

  const clear = React.useCallback(() => {
    activeAttemptRef.current += 1
    activeJobRef.current = null
    dispatch({ type: "clear" })
  }, [])
  const onPendingArtifactFailure = React.useCallback(
    ({ error, filePath }: { error: string; filePath: string }) => {
      const job = activeJobRef.current
      if (job?.filePath !== filePath || job.phase === "failed") {
        return
      }

      activeAttemptRef.current += 1
      activeJobRef.current = failCreateArtifactJob({
        error,
        job,
      })
      dispatch({ message: error, type: "failed" })
    },
    []
  )
  const onPendingArtifactReady = React.useCallback(
    ({ filePath }: { filePath: string }) => {
      const job = activeJobRef.current
      if (job?.filePath !== filePath || job.phase === "failed") {
        return
      }

      activeAttemptRef.current += 1
      activeJobRef.current = null
      dispatch({ type: "ready" })
    },
    []
  )
  const selectArtifactMode = React.useCallback(() => {
    dispatch({ type: "select-artifact" })
  }, [])
  const selectCreateArtifact = React.useCallback(() => {
    dispatch({ type: "select-create-artifact" })
  }, [])
  const setDraft = React.useCallback((draft: string) => {
    dispatch({ draft, type: "set-draft" })
  }, [])

  const submit = React.useCallback(
    async ({
      existingFilePaths,
      refreshArtifacts,
      request,
    }: {
      existingFilePaths: string[]
      refreshArtifacts: (options: {
        currentFilePath: string
        forceRefresh: true
      }) => Promise<void>
      request: string
    }) => {
      const filePath = createArtifactFilePathForRequest({
        existingFilePaths,
        request,
      })
      const startedJob: CanvasCreateArtifactJob = {
        filePath,
        phase: "starting",
        request,
        startedAt: Date.now(),
      }
      const attempt = activeAttemptRef.current + 1
      activeAttemptRef.current = attempt
      activeJobRef.current = startedJob
      dispatch({ job: startedJob, type: "started" })

      try {
        const createdArtifact = await createArtifact({ filePath, request })
        if (attempt !== activeAttemptRef.current) {
          return
        }

        const waitingJob: CanvasCreateArtifactJob = {
          ...startedJob,
          filePath: createdArtifact.filePath,
          phase: "waiting-for-artifact",
        }
        activeJobRef.current = waitingJob
        dispatch({ job: waitingJob, type: "waiting" })
        await refreshArtifacts({
          currentFilePath: createdArtifact.filePath,
          forceRefresh: true,
        })
        if (attempt !== activeAttemptRef.current) {
          return
        }
      } catch (error: unknown) {
        if (attempt !== activeAttemptRef.current) {
          return
        }

        const message = error instanceof Error ? error.message : String(error)
        activeAttemptRef.current += 1
        activeJobRef.current = failCreateArtifactJob({
          error: message,
          job: activeJobRef.current ?? startedJob,
        })
        dispatch({ message, type: "failed" })
        throw error
      }
    },
    []
  )

  return {
    clear,
    draft: state.draft,
    job: state.job,
    mode: state.mode,
    onPendingArtifactFailure,
    onPendingArtifactReady,
    selectArtifactMode,
    selectCreateArtifact,
    setDraft,
    status: createArtifactStatusMessage(state.status, t),
    submit,
  }
}
