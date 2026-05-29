import { useEffect, useState } from "react"

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
  const [isMessageOpen, setIsMessageOpen] = useState(false)
  const [messageDraft, setMessageDraft] = useState("")
  const threadController = useWorkspaceThreadController({ activeProject })
  const { handlePromptSubmit, petPresence } = useWorkspaceAgentController({
    activeProject,
    activeSection,
    documentState,
    runtime,
    threadController,
  })
  const messageDraftScope =
    activeProject && activeSection ? `${activeProject.id}:${activeSection.id}` : null

  useEffect(() => {
    setMessageDraft("")
  }, [messageDraftScope])

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

  const threadPickerContent = (
    <ProjectThreadPickerContent {...threadController.threadPickerProps} />
  )

  return (
    <WorkspaceSurfaceFrame
      canSave={canSave}
      colorCssVariables={colorCssVariables}
      isSaveAttentionActive={isSaveAttentionActive}
      isMessageOpen={isMessageOpen}
      isThreadPickerOpen={threadController.isThreadPickerOpen}
      messageDraft={messageDraft}
      onDropIntent={handleDropIntent}
      onMessageDraftChange={setMessageDraft}
      onMessageOpenChange={setIsMessageOpen}
      onPromptSubmit={handlePromptSubmit}
      onSaveDocument={handleSaveDocument}
      onThreadPickerOpenChange={threadController.setIsThreadPickerOpen}
      petPresence={petPresence}
      runtime={runtime}
      saveState={saveState}
      threadPickerContent={threadPickerContent}
    />
  )
}

export { WorkspaceLoadErrorState }
