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
      {statusState ? (
        <SaveStatus
          canSave={canSave}
          isSaveAttentionActive={isSaveAttentionActive}
          onSaveDocument={onSaveDocument}
          statusState={statusState}
        />
      ) : null}
    </AgentHtmlRuntimeTheme>
  )
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
        "fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-xs text-foreground shadow-lg transition-[box-shadow,border-color,background-color]",
        isSaveAttentionActive
          ? "border-primary/70 bg-primary/5 shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
          : "",
      ].join(" ")}
      role="status"
    >
      <span>
        {status === "dirty"
          ? "Unsaved changes"
          : status === "saving"
            ? "Saving..."
            : status === "saved"
              ? "Saved"
              : status === "loading"
                ? `Loading ${statusState.state.detail}...`
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
