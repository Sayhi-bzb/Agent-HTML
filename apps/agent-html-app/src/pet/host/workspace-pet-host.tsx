import * as React from "react"

import { WorkspaceGhostPet } from "@/app/pet/ghost"
import { PetSettingsContent } from "@/app/pet/host/pet-settings-content"
import {
  getWorkspacePetHostSnapshot,
  subscribeWorkspacePetHost,
  type WorkspacePetHostSnapshot,
} from "@/app/pet/host/pet-host-store"
import {
  type AgentHtmlAgentPromptSubmitInput,
  AgentHtmlPromptComposer,
} from "@/agent-html"

export function WorkspacePetHost() {
  const snapshot = React.useSyncExternalStore(
    subscribeWorkspacePetHost,
    getWorkspacePetHostSnapshot,
    getWorkspacePetHostSnapshot
  )
  if (!snapshot.enabled) {
    return null
  }

  return (
    <WorkspacePetHostSession
      key={snapshot.draftScope ?? "workspace"}
      snapshot={snapshot}
    />
  )
}

function WorkspacePetHostSession({
  snapshot,
}: {
  snapshot: WorkspacePetHostSnapshot
}) {
  const [isMessageOpen, setIsMessageOpen] = React.useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isThreadPickerOpen, setIsThreadPickerOpen] = React.useState(false)
  const [messageDraft, setMessageDraft] = React.useState("")

  return (
    <WorkspaceGhostPet
      isMessageOpen={isMessageOpen}
      isSettingsOpen={isSettingsOpen}
      isThreadPickerOpen={isThreadPickerOpen}
      messageContent={
        <PetMessageComposer
          draft={messageDraft}
          onDraftChange={setMessageDraft}
          onMessageOpenChange={setIsMessageOpen}
          onPromptSubmit={snapshot.onPromptSubmit}
        />
      }
      onMessageOpenChange={setIsMessageOpen}
      onSettingsOpenChange={setIsSettingsOpen}
      onThreadPickerOpenChange={setIsThreadPickerOpen}
      presence={snapshot.presence}
      settingsContent={<PetSettingsContent />}
      threadPickerContent={snapshot.threadPickerContent}
    />
  )
}

function PetMessageComposer({
  draft,
  onDraftChange,
  onMessageOpenChange,
  onPromptSubmit,
}: {
  draft: string
  onDraftChange: (draft: string) => void
  onMessageOpenChange: (open: boolean) => void
  onPromptSubmit?: (submit: AgentHtmlAgentPromptSubmitInput) => void
}) {
  return (
    <AgentHtmlPromptComposer
      onPointerDown={(event) => event.stopPropagation()}
      onSend={(prompt) => {
        onDraftChange("")
        onPromptSubmit?.({
          prompt,
          target: {
            kind: "document",
          },
        })
        onMessageOpenChange(false)
      }}
      onValueChange={onDraftChange}
      value={draft}
    />
  )
}
