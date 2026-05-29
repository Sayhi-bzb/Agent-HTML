import * as React from "react"

import type {
  PendingDocumentState,
  RuntimeState,
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
  Exclude<PendingDocumentState, { status: "idle" }>

const workspaceStatusPillTransitionMs = 200
const workspaceStatusPillTimingMs = {
  loadingDelay: workspaceStatusPillTransitionMs,
  loadingMinVisible: workspaceStatusPillTransitionMs * 2,
} as const

export function WorkspaceSurfaceFrame({
  colorCssVariables,
  onDropIntent,
  onPromptSubmit,
  pendingDocumentState,
  runtime,
}: {
  colorCssVariables: AgentHtmlColorCssVariables
  onDropIntent: (input: {
    intent: AgentHtmlDropIntent
    sourcePath: string
  }) => void
  onPromptSubmit: (submit: AgentHtmlAgentPromptSubmitInput) => void
  pendingDocumentState: PendingDocumentState
  runtime: Extract<RuntimeState, { status: "ready" }>
}) {
  const statusState = React.useMemo<WorkspaceStatusPillState | null>(() => {
    if (pendingDocumentState.status !== "idle") {
      return pendingDocumentState
    }

    return null
  }, [pendingDocumentState])
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
        <WorkspaceStatus statusState={visibleStatusState} />
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

  const showStatusState = React.useCallback(
    (nextStatusState: WorkspaceStatusPillState | null) => {
      if (visibleStatusStateRef.current === nextStatusState) {
        return
      }

      visibleStatusStateRef.current = nextStatusState
      setVisibleStatusState(nextStatusState)
    },
    []
  )

  React.useEffect(() => {
    visibleStatusStateRef.current = visibleStatusState
  }, [visibleStatusState])

  React.useEffect(() => {
    if (hideTimeoutRef.current !== null) {
      window.clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }

    if (
      statusState?.status === "loading"
    ) {
      const delayTimeout = window.setTimeout(() => {
        visibleSinceRef.current = window.performance.now()
        showStatusState(statusState)
      }, workspaceStatusPillTimingMs.loadingDelay)

      return () => window.clearTimeout(delayTimeout)
    }

    const visibleState = visibleStatusStateRef.current
    const isVisibleDocumentLoading =
      visibleState?.status === "loading"

    if (isVisibleDocumentLoading && statusState === null) {
      const visibleSince = visibleSinceRef.current ?? window.performance.now()
      const remaining =
        workspaceStatusPillTimingMs.loadingMinVisible -
        (window.performance.now() - visibleSince)

      if (remaining > 0) {
        hideTimeoutRef.current = window.setTimeout(() => {
          visibleSinceRef.current = null
          showStatusState(null)
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
    showStatusState(statusState)

    return undefined
  }, [showStatusState, statusState])

  return visibleStatusState
}

function WorkspaceStatus({
  statusState,
}: {
  statusState: WorkspaceStatusPillState
}) {
  const status = statusState.status

  return (
    <div
      className="fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg border border-border/60 bg-background/90 px-3 py-2 text-xs text-foreground shadow-sm transition-[box-shadow,border-color,background-color]"
      role="status"
      style={{ transitionDuration: `${workspaceStatusPillTransitionMs}ms` }}
    >
      <span>
        {status === "loading" ? "Loading section..." : statusState.detail}
      </span>
    </div>
  )
}
