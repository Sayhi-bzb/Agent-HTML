import { useEffect } from "react"

import {
  clearWorkspacePetHost,
  publishWorkspacePetHost,
} from "@/app/pet/host/pet-host-store"
import { useWorkspaceAgentController } from "@/app/workspace/agent-controller"
import { useWorkspaceDocumentController } from "@/app/workspace/document-controller"
import { useWorkspaceSectionCreation } from "@/app/workspace/section-creation-controller"
import { ProjectThreadPickerContent } from "@/app/workspace/thread-picker"
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
  canEditStructure,
  canSave,
  colorCssVariables,
  onCreateSection,
  onDirtyChange,
  saveAttentionToken,
  workspaceActionError,
}: {
  activeProject: WorkspaceProjectView | null
  activeSection: WorkspaceSection | null
  canEditStructure: boolean
  canSave: boolean
  colorCssVariables: AgentHtmlColorCssVariables
  onCreateSection: (input: { projectId: string; title: string }) => Promise<void>
  onDirtyChange: (isDirty: boolean) => void
  saveAttentionToken: number
  workspaceActionError: string | null
}) {
  const {
    documentState,
    handleDropIntent,
    handleSaveDocument,
    isSaveAttentionActive,
    pendingDocumentState,
    runtime,
    saveState,
  } = useWorkspaceDocumentController({
    activeProject,
    activeSection,
    canSave,
    onDirtyChange,
    saveAttentionToken,
  })
  const sectionCreation = useWorkspaceSectionCreation({
    activeProject,
    onCreateSection,
  })
  const threadController = useWorkspaceThreadController({ activeProject })
  const { handlePromptSubmit, petPresence } = useWorkspaceAgentController({
    activeProject,
    activeSection,
    documentState,
    runtime,
    threadController,
  })
  const threadPickerContent = (
    <ProjectThreadPickerContent {...threadController.threadPickerProps} />
  )
  const petDraftScope =
    activeProject && activeSection ? `${activeProject.id}:${activeSection.id}` : null
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
      onPromptSubmit: handlePromptSubmit,
      presence: petPresence,
      threadPickerContent,
    })

    return () => clearWorkspacePetHost()
  }, [
    canPublishPetHost,
    handlePromptSubmit,
    petDraftScope,
    petPresence,
    threadPickerContent,
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
      canSave={canSave}
      colorCssVariables={colorCssVariables}
      isSaveAttentionActive={isSaveAttentionActive}
      onDropIntent={handleDropIntent}
      onPromptSubmit={handlePromptSubmit}
      onSaveDocument={handleSaveDocument}
      pendingDocumentState={pendingDocumentState}
      runtime={runtime}
      saveState={saveState}
    />
  )
}

export { WorkspaceLoadErrorState }
