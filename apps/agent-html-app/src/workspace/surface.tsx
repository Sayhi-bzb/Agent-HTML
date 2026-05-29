import { useEffect, useMemo } from "react"

import {
  clearWorkspacePetHost,
  publishWorkspacePetHost,
} from "@/app/pet/host/pet-host-store"
import { useWorkspaceAgentController } from "@/app/workspace/agent-controller"
import {
  useWorkspaceDocumentController,
  type WorkspaceDocumentDraft,
} from "@/app/workspace/document-controller"
import { useWorkspaceSectionCreation } from "@/app/workspace/section-creation-controller"
import { ProjectThreadPickerContent } from "@/app/workspace/thread-picker"
import { buildProjectThreadPickerItems } from "@/app/workspace/thread-picker-model"
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
  sortProjectThreadLinksByRecent,
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
  const threadController = useWorkspaceThreadController({ activeProject })
  const displayedSection =
    activeProject && documentState.status === "ready"
      ? activeProject.sections.find(
          (section) => section.id === documentState.document.sectionId
        ) ?? activeSection
      : activeSection
  const { handlePromptSubmit, petPresence } = useWorkspaceAgentController({
    activeProject,
    activeSection: displayedSection,
    documentState,
    runtime,
    threadController,
  })
  const threadPickerContent = (
    <ProjectThreadPickerContent {...threadController.threadPickerProps} />
  )
  const petThreads = useMemo(
    () => ({
      canSelectThread: threadController.threadPickerProps.canSelectThread,
      error:
        threadController.threadPickerProps.codexThreadError ??
        threadController.threadPickerProps.projectThreadError ??
        threadController.threadPickerProps.threadSelectionError ??
        threadController.threadPickerProps.renameError ??
        null,
      isLoading: threadController.threadPickerProps.isLoading,
      isSelectingThread: threadController.threadPickerProps.isSelectingThread,
      items: buildProjectThreadPickerItems({
        optimisticThreadNames:
          threadController.threadPickerProps.optimisticThreadNames,
        projectThreadLinks:
          threadController.threadPickerProps.projectThreadLinks,
        selectedProjectThreadId:
          threadController.threadPickerProps.selectedProjectThreadId,
        threadRequestPreviews:
          threadController.threadPickerProps.threadRequestPreviews,
        threadSummaries: threadController.threadPickerProps.threadSummaries,
      }),
    }),
    [
      threadController.threadPickerProps.canSelectThread,
      threadController.threadPickerProps.codexThreadError,
      threadController.threadPickerProps.isLoading,
      threadController.threadPickerProps.isSelectingThread,
      threadController.threadPickerProps.optimisticThreadNames,
      threadController.threadPickerProps.projectThreadError,
      threadController.threadPickerProps.projectThreadLinks,
      threadController.threadPickerProps.renameError,
      threadController.threadPickerProps.selectedProjectThreadId,
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
      onNewThread: threadController.threadPickerProps.onNewThread,
      onPromptSubmit: handlePromptSubmit,
      onRenameThread: threadController.threadPickerProps.onRenameThread,
      onResumeThread: threadController.threadPickerProps.onResumeThread,
      presence: petPresence,
      threadPickerContent,
      threads: petThreads,
    })

    return () => clearWorkspacePetHost()
  }, [
    canPublishPetHost,
    handlePromptSubmit,
    petDraftScope,
    petPresence,
    petThreads,
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
