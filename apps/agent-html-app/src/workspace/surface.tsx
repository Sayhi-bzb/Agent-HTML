/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useState } from "react"

import {
  clearWorkspacePetHost,
  publishWorkspacePetHost,
} from "@/app/pet/host/pet-host-store"
import { PetMessageComposer } from "@/app/pet/host/pet-message-composer"
import { PetThreadTranscriptContent } from "@/app/pet/host/pet-thread-transcript-content"
import { useWorkspaceAgentController } from "@/app/workspace/agent-controller"
import {
  useWorkspaceDocumentController,
  type WorkspaceDocumentDraft,
} from "@/app/workspace/document-controller"
import { useAgentDocumentRefresh } from "@/app/workspace/agent-document-refresh"
import { useWorkspaceSectionCreation } from "@/app/workspace/section-creation-controller"
import { CodexThreadPickerContent } from "@/app/workspace/thread-picker"
import { buildCodexThreadPickerItems } from "@/app/workspace/thread-picker-model"
import { useThreadTranscript } from "@/app/workspace/thread-transcript"
import { useWorkspaceThreadController } from "@/app/workspace/thread-controller"
import { WorkspaceSurfaceFrame } from "@/app/workspace/surface-frame"
import {
  RuntimeValidationErrors,
  WorkspaceDocumentErrorState,
  WorkspaceLoadErrorState,
  WorkspaceLoadingDocumentState,
  WorkspaceNoProjectState,
  WorkspaceNoSectionState,
  WorkspaceRuntimeErrorState,
} from "@/app/workspace/workspace-states"
import type {
  WorkspaceProjectView,
  WorkspaceSection,
} from "@/app/workspace/types"
import { type AgentHtmlColorCssVariables } from "@/agent-html"

export {
  formatThreadRelativeTime,
  readFirstThreadRequestText,
  sortThreadSummariesByRecent,
} from "@/app/workspace/thread-picker"

export function WorkspaceSurface({
  activeProject,
  activeSection,
  activeTabDraft,
  activeTabId,
  canEditStructure,
  canSave,
  colorCssVariables,
  onCreateSection,
  onDraftChange,
  onDirtyChange,
  workspaceActionError,
}: {
  activeProject: WorkspaceProjectView | null
  activeSection: WorkspaceSection | null
  activeTabDraft: WorkspaceDocumentDraft | null
  activeTabId: string | null
  canEditStructure: boolean
  canSave: boolean
  colorCssVariables: AgentHtmlColorCssVariables
  onCreateSection: (input: { projectId: string; title: string }) => Promise<void>
  onDraftChange: (tabId: string, draft: WorkspaceDocumentDraft | null) => void
  onDirtyChange: (tabId: string | null, isDirty: boolean) => void
  workspaceActionError: string | null
}) {
  const {
    documentState,
    handleDropIntent,
    pendingDocumentState,
    reloadDocumentFromDisk,
    runtime,
  } = useWorkspaceDocumentController({
    activeProject,
    activeSection,
    activeTabDraft,
    activeTabId,
    canSave,
    onDraftChange,
    onDirtyChange,
  })
  const sectionCreation = useWorkspaceSectionCreation({
    activeProject,
    onCreateSection,
  })
  const [messageDraft, setMessageDraft] = useState("")
  const threadController = useWorkspaceThreadController({ activeProject })
  const displayedSection =
    activeProject && documentState.status === "ready"
      ? activeProject.sections.find(
          (section) => section.id === documentState.document.sectionId
        ) ?? activeSection
      : activeSection
  const {
    activeTurnContext,
    canInterruptTurn,
    handleInterruptTurn,
    handlePromptSubmit,
    isInterruptingTurn,
    petApproval,
    petApprovalError,
    petPresence,
    petSpeechBubbles,
    respondToPetApproval,
  } = useWorkspaceAgentController({
    activeProject,
    activeSection: displayedSection,
    documentState,
    runtime,
    threadController,
  })
  useAgentDocumentRefresh({
    context: activeTurnContext,
    reloadDocumentFromDisk,
  })
  const threadPickerContent = useMemo(
    () => <CodexThreadPickerContent {...threadController.threadPickerProps} />,
    [threadController.threadPickerProps]
  )
  const threadTranscript = useThreadTranscript({
    codexConnection: threadController.codexConnection,
    threadId: threadController.threadPickerProps.activeThreadId,
  })
  const transcriptComposer = useMemo(
    () => (
      <PetMessageComposer
        draft={messageDraft}
        onDraftChange={setMessageDraft}
        onPromptSubmit={handlePromptSubmit}
        surface="floating"
      />
    ),
    [handlePromptSubmit, messageDraft]
  )
  const renderTranscriptContent = useMemo(
    () =>
      ({ onClose }: { onClose: () => void }) => (
      <PetThreadTranscriptContent
        composer={transcriptComposer}
        error={threadTranscript.error}
        isLoading={threadTranscript.isLoading}
        onClose={onClose}
        threadId={threadTranscript.threadId}
        turns={threadTranscript.turns}
      />
    ),
    [
      threadTranscript.error,
      threadTranscript.isLoading,
      threadTranscript.threadId,
      threadTranscript.turns,
      transcriptComposer,
    ]
  )
  const petThreads = useMemo(
    () => ({
      canSelectThread: threadController.threadPickerProps.canSelectThread,
      error:
        threadController.threadPickerProps.codexThreadError ??
        threadController.threadPickerProps.companyAgentError ??
        threadController.threadPickerProps.threadSelectionError ??
        threadController.threadPickerProps.renameError ??
        null,
      isLoading: threadController.threadPickerProps.isLoading,
      isSelectingThread: threadController.threadPickerProps.isSelectingThread,
      items: buildCodexThreadPickerItems({
        activeThreadId: threadController.threadPickerProps.activeThreadId,
        optimisticThreadNames:
          threadController.threadPickerProps.optimisticThreadNames,
        threadRequestPreviews:
          threadController.threadPickerProps.threadRequestPreviews,
        threadSummaries: threadController.threadPickerProps.threadSummaries,
      }),
    }),
    [
      threadController.threadPickerProps.canSelectThread,
      threadController.threadPickerProps.codexThreadError,
      threadController.threadPickerProps.companyAgentError,
      threadController.threadPickerProps.isLoading,
      threadController.threadPickerProps.isSelectingThread,
      threadController.threadPickerProps.optimisticThreadNames,
      threadController.threadPickerProps.renameError,
      threadController.threadPickerProps.activeThreadId,
      threadController.threadPickerProps.threadRequestPreviews,
      threadController.threadPickerProps.threadSelectionError,
      threadController.threadPickerProps.threadSummaries,
    ]
  )
  const petDraftScope =
    activeProject && displayedSection
      ? `${activeProject.id}:${displayedSection.id}`
      : null
  const canPublishPetHost =
    Boolean(activeProject && activeSection) && runtime?.status === "ready"

  useEffect(() => {
    if (!canPublishPetHost || !petDraftScope) {
      clearWorkspacePetHost()
      return
    }

    publishWorkspacePetHost({
      draftScope: petDraftScope,
      enabled: true,
      canInterruptTurn,
      isInterruptingTurn,
      messageDraft,
      onInterruptTurn: handleInterruptTurn,
      onMessageDraftChange: setMessageDraft,
      onNewThread: threadController.threadPickerProps.onNewThread,
      onPromptSubmit: handlePromptSubmit,
      onRespondToApproval: respondToPetApproval,
      onRenameThread: threadController.threadPickerProps.onRenameThread,
      onResumeThread: threadController.threadPickerProps.onResumeThread,
      presence: petPresence,
      approval: petApproval,
      approvalError: petApprovalError,
      speechBubbles: petSpeechBubbles,
      threadPickerContent,
      renderTranscriptContent,
      threads: petThreads,
    })

    return () => clearWorkspacePetHost()
  }, [
    canPublishPetHost,
    canInterruptTurn,
    handleInterruptTurn,
    handlePromptSubmit,
    isInterruptingTurn,
    messageDraft,
    petDraftScope,
    petPresence,
    petSpeechBubbles,
    petThreads,
    renderTranscriptContent,
    threadPickerContent,
    threadController.threadPickerProps.onNewThread,
    threadController.threadPickerProps.onRenameThread,
    threadController.threadPickerProps.onResumeThread,
  ])

  if (!activeProject) {
    return <WorkspaceNoProjectState />
  }

  if (!activeSection) {
    return (
      <WorkspaceNoSectionState
        canEditStructure={canEditStructure}
        error={workspaceActionError ?? sectionCreation.error}
        isCreating={sectionCreation.isCreating}
        onCreateSection={sectionCreation.create}
      />
    )
  }

  if (documentState.status === "idle" || documentState.status === "loading") {
    return (
      <WorkspaceLoadingDocumentState
        detail={`${activeProject.name} / ${activeSection.title}`}
      />
    )
  }

  if (documentState.status === "error") {
    return <WorkspaceDocumentErrorState detail={documentState.message} />
  }

  if (!runtime) {
    return null
  }

  if (runtime.status === "invalid") {
    return <RuntimeValidationErrors errors={runtime.errors} />
  }

  if (runtime.status === "error") {
    return <WorkspaceRuntimeErrorState detail={runtime.message} />
  }

  return (
    <WorkspaceSurfaceFrame
      colorCssVariables={colorCssVariables}
      onDropIntent={handleDropIntent}
      onPromptSubmit={handlePromptSubmit}
      pendingDocumentState={pendingDocumentState}
      runtime={runtime}
    />
  )
}

export { WorkspaceLoadErrorState }
