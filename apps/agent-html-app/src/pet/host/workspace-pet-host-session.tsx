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
import { PetThreadPanelContent } from "@/app/pet/host/pet-thread-panel-content"
import { PetThreadTranscriptContent } from "@/app/pet/host/pet-thread-transcript-content"

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
  const [isThreadPanelOpen, setIsThreadPanelOpen] = React.useState(false)
  const threadPanel = snapshot.threadPanel
  const threadPanelComposer = (
    <PetMessageComposer
      draft={snapshot.messageDraft}
      onDraftChange={snapshot.onMessageDraftChange}
      onPromptSubmit={snapshot.onPromptSubmit}
      surface="floating"
    />
  )

  return (
    <WorkspaceGhostPet
      approval={snapshot.approval}
      approvalError={snapshot.approvalError}
      isMessageOpen={isMessageOpen}
      isSettingsOpen={isSettingsOpen}
      isThreadPanelOpen={isThreadPanelOpen}
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
      onThreadPanelOpenChange={setIsThreadPanelOpen}
      presence={snapshot.presence}
      settingsContent={
        <PetPanel size="auto">
          <div className="w-[30rem] p-3">
            <PetSettingsContent />
          </div>
        </PetPanel>
      }
      speechBubbles={snapshot.speechBubbles}
      threadPanelContent={
        threadPanel ? (
          <PetThreadPanelContent
            activeThreadId={threadPanel.activeThreadId}
            canSelectThread={threadPanel.canSelectThread}
            chat={({ onSearchOpenChange, searchOpen }) => (
              <PetThreadTranscriptContent
                composer={threadPanelComposer}
                error={threadPanel.transcript.error}
                hideHeader
                isLoading={threadPanel.transcript.isLoading}
                onSearchOpenChange={onSearchOpenChange}
                searchOpen={searchOpen}
                threadId={threadPanel.transcript.threadId}
                turns={threadPanel.transcript.turns}
              />
            )}
            codexThreadError={threadPanel.codexThreadError}
            companyAgentError={threadPanel.companyAgentError}
            isLoading={threadPanel.isLoading}
            isSelectingThread={threadPanel.isSelectingThread}
            items={threadPanel.items}
            onClose={() => setIsThreadPanelOpen(false)}
            onNewThread={snapshot.onNewThread ?? noop}
            onRenameThread={snapshot.onRenameThread ?? noopRenameThread}
            onResumeThread={snapshot.onResumeThread ?? noop}
            optimisticThreadNames={threadPanel.optimisticThreadNames}
            renameError={threadPanel.renameError}
            renamingThreadId={threadPanel.renamingThreadId}
            threadRequestPreviews={threadPanel.threadRequestPreviews}
            threadSelectionError={threadPanel.threadSelectionError}
            threadSummaries={threadPanel.threadSummaries}
          />
        ) : undefined
      }
    />
  )
}

function noop() {}

async function noopRenameThread() {}
