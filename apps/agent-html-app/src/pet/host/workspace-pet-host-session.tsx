import * as React from "react"

import { WorkspaceGhostPet } from "@/app/pet/ghost"
import {
  getWorkspacePetHostSnapshot,
  subscribeWorkspacePetHost,
  type WorkspacePetHostSnapshot,
} from "@/app/pet/host/pet-host-store"
import { PetMessageComposer } from "@/app/pet/host/pet-message-composer"
import { PetPanel } from "@/app/pet/host/pet-panel"
import { PetSettingsContent } from "@/app/pet/host/pet-settings-content"

export function WorkspacePetHostSessionRoot() {
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
  const transcriptContent =
    snapshot.renderTranscriptContent?.({
      onClose: () => setIsTranscriptOpen(false),
    }) ?? snapshot.transcriptContent

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
          draft={snapshot.messageDraft}
          onDraftChange={snapshot.onMessageDraftChange}
          onPromptSubmit={snapshot.onPromptSubmit}
          onSent={() => setIsMessageOpen(false)}
          surface="floating"
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
      settingsContent={
        <PetPanel size="auto">
          <div className="w-[30rem] p-3">
            <PetSettingsContent />
          </div>
        </PetPanel>
      }
      speechBubbles={snapshot.speechBubbles}
      threadPickerContent={
        snapshot.threadPickerContent ? (
          <PetPanel size="compact">
            <div className="p-3">{snapshot.threadPickerContent}</div>
          </PetPanel>
        ) : undefined
      }
      transcriptContent={transcriptContent}
    />
  )
}
