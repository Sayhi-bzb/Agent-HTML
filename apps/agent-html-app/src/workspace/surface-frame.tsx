import * as React from "react"

import type {
  PendingDocumentState,
  RuntimeState,
  SaveState,
} from "./document-controller"
import {
  AgentHtmlBlockRuntimeProvider,
  type AgentHtmlColorCssVariables,
  AgentHtmlRuntimeTheme,
  AgentHtmlRuntimeViewport,
  type AgentHtmlAgentPromptSubmitInput,
  type AgentHtmlDropIntent,
} from "@/agent-html"

type WorkspaceStatusPillState =
  | { kind: "save"; state: Exclude<SaveState, { status: "clean" }> }
  | {
      kind: "document"
      state: Exclude<PendingDocumentState, { status: "idle" }>
    }

const workspaceStatusPillTransitionMs = 200
const workspaceStatusPillTimingMs = {
  loadingDelay: workspaceStatusPillTransitionMs,
  loadingMinVisible: workspaceStatusPillTransitionMs * 2,
} as const

export function WorkspaceSurfaceFrame({
  canSave,
  colorCssVariables,
  isSaveAttentionActive,
  onDropIntent,
  onPromptSubmit,
  onSaveDocument,
  pendingDocumentState,
  runtime,
  saveState,
}: {
  canSave: boolean
  colorCssVariables: AgentHtmlColorCssVariables
  isSaveAttentionActive: boolean
  onDropIntent: (input: {
    intent: AgentHtmlDropIntent
    sourcePath: string
  }) => void
  onPromptSubmit: (submit: AgentHtmlAgentPromptSubmitInput) => void
  onSaveDocument: () => void
  pendingDocumentState: PendingDocumentState
  runtime: Extract<RuntimeState, { status: "ready" }>
  saveState: SaveState
}) {
  const statusState =
    saveState.status !== "clean"
      ? ({ kind: "save", state: saveState } satisfies WorkspaceStatusPillState)
      : pendingDocumentState.status !== "idle"
        ? ({
            kind: "document",
            state: pendingDocumentState,
          } satisfies WorkspaceStatusPillState)
        : null
  const visibleStatusState = useVisibleWorkspaceStatusPillState(statusState)

  return (
    <AgentHtmlRuntimeTheme
      className="h-full w-full"
      colorCssVariables={colorCssVariables}
    >
      <AgentHtmlBlockRuntimeProvider
        onDropIntent={onDropIntent}
        onPromptSubmit={onPromptSubmit}
      >
        <AgentHtmlRuntimeViewport>{runtime.content}</AgentHtmlRuntimeViewport>
      </AgentHtmlBlockRuntimeProvider>
      {visibleStatusState ? (
        <SaveStatus
          canSave={canSave}
          isSaveAttentionActive={isSaveAttentionActive}
          onSaveDocument={onSaveDocument}
          statusState={visibleStatusState}
        />
      ) : null}
    </AgentHtmlRuntimeTheme>
  )
}

function useVisibleWorkspaceStatusPillState(
  statusState: WorkspaceStatusPillState | null
) {
  const [visibleStatusState, setVisibleStatusState] =
    React.useState<WorkspaceStatusPillState | null>(null)
  const visibleStatusStateRef =
    React.useRef<WorkspaceStatusPillState | null>(null)
  const visibleSinceRef = React.useRef<number | null>(null)
  const hideTimeoutRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    visibleStatusStateRef.current = visibleStatusState
  }, [visibleStatusState])

  React.useEffect(() => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }

    if (
      statusState?.kind === "document" &&
      statusState.state.status === "loading"
    ) {
      const delayTimeout = window.setTimeout(() => {
        visibleSinceRef.current = window.performance.now()
        visibleStatusStateRef.current = statusState
        setVisibleStatusState(statusState)
      }, workspaceStatusPillTimingMs.loadingDelay)

      return () => window.clearTimeout(delayTimeout)
    }

    const visibleState = visibleStatusStateRef.current
    const isVisibleDocumentLoading =
      visibleState?.kind === "document" &&
      visibleState.state.status === "loading"

    if (isVisibleDocumentLoading && statusState === null) {
      const visibleSince = visibleSinceRef.current ?? window.performance.now()
      const remaining =
        workspaceStatusPillTimingMs.loadingMinVisible -
        (window.performance.now() - visibleSince)

      if (remaining > 0) {
        hideTimeoutRef.current = window.setTimeout(() => {
          visibleSinceRef.current = null
          visibleStatusStateRef.current = null
          setVisibleStatusState(null)
          hideTimeoutRef.current = null
        }, remaining)

        return () => {
          if (hideTimeoutRef.current !== null) {
            window.clearTimeout(hideTimeoutRef.current)
            hideTimeoutRef.current = null
          }
        }
      }
    }

    visibleSinceRef.current = null
    visibleStatusStateRef.current = statusState
    setVisibleStatusState(statusState)

    return undefined
  }, [statusState])

  return visibleStatusState
}

function SaveStatus({
  canSave,
  isSaveAttentionActive,
  onSaveDocument,
  statusState,
}: {
  canSave: boolean
  isSaveAttentionActive: boolean
  onSaveDocument: () => void
  statusState: WorkspaceStatusPillState
}) {
  const status = statusState.state.status

  return (
    <div
      className={[
        "fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-xs text-foreground transition-[box-shadow,border-color,background-color]",
        statusState.kind === "document"
          ? "border-border/60 bg-background/90 shadow-sm"
          : "shadow-lg",
        isSaveAttentionActive
          ? "border-primary/70 bg-primary/5 shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
          : "",
      ].join(" ")}
      role="status"
      style={{ transitionDuration: `${workspaceStatusPillTransitionMs}ms` }}
    >
      <span>
        {status === "dirty"
          ? "Unsaved changes"
          : status === "saving"
            ? "Saving..."
            : status === "saved"
              ? "Saved"
              : status === "loading"
                ? "Loading section..."
                : statusState.state.detail}
      </span>
      {statusState.kind === "save" &&
      (status === "dirty" || status === "error") ? (
        <button
          className="rounded-md bg-primary px-2 py-1 font-medium text-primary-foreground disabled:opacity-50"
          disabled={!canSave}
          onClick={onSaveDocument}
          type="button"
        >
          Save
        </button>
      ) : null}
    </div>
  )
}
