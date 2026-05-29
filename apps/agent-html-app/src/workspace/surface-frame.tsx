import * as React from "react"

import { WorkspaceGhostPet } from "@/app/pet/ghost"
import type { PetPresence } from "@/app/workspace/agent-presence"
import type { RuntimeState, SaveState } from "./document-controller"
import {
  AgentHtmlBlockRuntimeProvider,
  type AgentHtmlColorCssVariables,
  AgentHtmlPromptComposer,
  AgentHtmlRuntimeTheme,
  AgentHtmlRuntimeViewport,
  type AgentHtmlAgentPromptSubmitInput,
  type AgentHtmlDropIntent,
} from "@/agent-html"

export function WorkspaceSurfaceFrame({
  canSave,
  colorCssVariables,
  isSaveAttentionActive,
  isMessageOpen,
  isThreadPickerOpen,
  messageDraft,
  onDropIntent,
  onMessageDraftChange,
  onPromptSubmit,
  onSaveDocument,
  onMessageOpenChange,
  onThreadPickerOpenChange,
  petPresence,
  runtime,
  saveState,
  threadPickerContent,
}: {
  canSave: boolean
  colorCssVariables: AgentHtmlColorCssVariables
  isSaveAttentionActive: boolean
  isMessageOpen: boolean
  isThreadPickerOpen: boolean
  messageDraft: string
  onDropIntent: (input: {
    intent: AgentHtmlDropIntent
    sourcePath: string
  }) => void
  onMessageDraftChange: (draft: string) => void
  onPromptSubmit: (submit: AgentHtmlAgentPromptSubmitInput) => void
  onSaveDocument: () => void
  onMessageOpenChange: (isOpen: boolean) => void
  onThreadPickerOpenChange: (isOpen: boolean) => void
  petPresence?: PetPresence
  runtime: Extract<RuntimeState, { status: "ready" }>
  saveState: SaveState
  threadPickerContent: React.ReactNode
}) {
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
      {saveState.status !== "clean" ? (
        <SaveStatus
          canSave={canSave}
          isSaveAttentionActive={isSaveAttentionActive}
          onSaveDocument={onSaveDocument}
          saveState={saveState}
        />
      ) : null}
      <WorkspaceGhostPet
        isMessageOpen={isMessageOpen}
        isThreadPickerOpen={isThreadPickerOpen}
        messageContent={
          <AgentHtmlPromptComposer
            onPointerDown={(event) => event.stopPropagation()}
            onSend={(prompt) => {
              onMessageDraftChange("")
              onPromptSubmit({
                prompt,
                target: {
                  kind: "document",
                },
              })
              onMessageOpenChange(false)
            }}
            onValueChange={onMessageDraftChange}
            value={messageDraft}
          />
        }
        onMessageOpenChange={onMessageOpenChange}
        onThreadPickerOpenChange={onThreadPickerOpenChange}
        presence={petPresence}
        threadPickerContent={threadPickerContent}
      />
    </AgentHtmlRuntimeTheme>
  )
}

function SaveStatus({
  canSave,
  isSaveAttentionActive,
  onSaveDocument,
  saveState,
}: {
  canSave: boolean
  isSaveAttentionActive: boolean
  onSaveDocument: () => void
  saveState: Exclude<SaveState, { status: "clean" }>
}) {
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
        {saveState.status === "dirty"
          ? "Unsaved changes"
          : saveState.status === "saving"
            ? "Saving..."
            : saveState.status === "saved"
              ? "Saved"
              : saveState.detail}
      </span>
      {saveState.status === "dirty" || saveState.status === "error" ? (
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
