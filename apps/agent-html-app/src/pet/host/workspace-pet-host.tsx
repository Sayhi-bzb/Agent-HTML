import * as React from "react"

import { WorkspaceGhostPet } from "@/app/pet/ghost"
import {
  getWorkspacePetHostSnapshot,
  subscribeWorkspacePetHost,
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
  const [isMessageOpen, setIsMessageOpen] = React.useState(false)
  const [isThreadPickerOpen, setIsThreadPickerOpen] = React.useState(false)
  const [messageDraft, setMessageDraft] = React.useState("")

  React.useEffect(() => {
    setMessageDraft("")
    setIsMessageOpen(false)
    setIsThreadPickerOpen(false)
  }, [snapshot.draftScope])

  if (!snapshot.enabled) {
    return null
  }

  return (
    <WorkspaceGhostPet
      isMessageOpen={isMessageOpen}
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
      onThreadPickerOpenChange={setIsThreadPickerOpen}
      presence={snapshot.presence}
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
