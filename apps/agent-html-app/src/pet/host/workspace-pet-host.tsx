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
  const [isTranscriptOpen, setIsTranscriptOpen] = React.useState(false)
  const [messageDraft, setMessageDraft] = React.useState("")

  return (
    <WorkspaceGhostPet
      approval={snapshot.approval}
      approvalError={snapshot.approvalError}
      isMessageOpen={isMessageOpen}
      isSettingsOpen={isSettingsOpen}
      isThreadPickerOpen={isThreadPickerOpen}
      isTranscriptOpen={isTranscriptOpen}
      messageContent={
        <PetMessageComposer
          draft={messageDraft}
          onDraftChange={setMessageDraft}
          onMessageOpenChange={setIsMessageOpen}
          onPromptSubmit={snapshot.onPromptSubmit}
        />
      }
      onMessageOpenChange={setIsMessageOpen}
      canInterruptTurn={snapshot.canInterruptTurn}
      isInterruptingTurn={snapshot.isInterruptingTurn}
      onInterruptTurn={snapshot.onInterruptTurn}
      onSettingsOpenChange={setIsSettingsOpen}
      onRespondToApproval={snapshot.onRespondToApproval}
      onThreadPickerOpenChange={setIsThreadPickerOpen}
      onTranscriptOpenChange={setIsTranscriptOpen}
      presence={snapshot.presence}
      settingsContent={<PetSettingsContent />}
      speechBubbles={snapshot.speechBubbles}
      threadPickerContent={snapshot.threadPickerContent}
      transcriptContent={snapshot.transcriptContent}
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
        })
        onMessageOpenChange(false)
      }}
      onValueChange={onDraftChange}
      value={draft}
    />
  )
}
