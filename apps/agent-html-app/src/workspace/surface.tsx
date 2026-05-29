import * as React from "react"
import { useWorkspaceAgentController } from "@/app/workspace/agent-controller"
import { useWorkspaceDocumentController } from "@/app/workspace/document-controller"
import { ProjectThreadPickerContent } from "@/app/workspace/thread-picker"
import { useWorkspaceThreadController } from "@/app/workspace/thread-controller"
import { WorkspaceSurfaceFrame } from "@/app/workspace/surface-frame"
import { Button } from "@/app/shared/ui/button"
import type {
  WorkspaceProjectView,
  WorkspaceSection,
} from "@/app/workspace/types"
import {
  type AgentHtmlColorCssVariables,
  renderInteractiveAgentHtml,
  type AgentHtmlValidationError,
} from "@/agent-html"

export {
  formatThreadRelativeTime,
  readFirstThreadRequestText,
  sortProjectThreadLinksByRecent,
} from "@/app/workspace/thread-picker"

function RuntimeValidationErrors({
  errors,
}: {
  errors: AgentHtmlValidationError[]
}) {
  return (
    <div className="flex flex-col gap-3 p-4 md:p-6">
      {errors.map((error) => (
        <article
          key={`${error.code}:${error.path}:${error.attr ?? ""}`}
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive"
        >
          <p className="text-sm font-medium">{error.code}</p>
          <p className="mt-1 text-xs leading-5">
            {error.path} - {error.message}
          </p>
        </article>
      ))}
    </div>
  )
}

function WorkspaceStatus({
  detail,
  title,
}: {
  detail: string
  title: string
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <section className="max-w-md rounded-xl border bg-background p-5 text-foreground shadow-sm">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
      </section>
    </div>
  )
}

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
  const [isCreatingSection, setIsCreatingSection] = React.useState(false)
  const [createSectionError, setCreateSectionError] = React.useState<
    string | null
  >(null)
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
  const threadController = useWorkspaceThreadController({ activeProject })
  const { handlePromptSubmit, petPresence } = useWorkspaceAgentController({
    activeProject,
    activeSection,
    documentState,
    runtime,
    threadController,
  })

  const handleCreateSection = React.useCallback(() => {
    if (!activeProject || isCreatingSection) {
      return
    }

    setCreateSectionError(null)
    setIsCreatingSection(true)
    onCreateSection({
      projectId: activeProject.id,
      title: "Untitled Section",
    })
      .catch((error: unknown) => {
        setCreateSectionError(
          error instanceof Error ? error.message : "Unable to create section."
        )
      })
      .finally(() => {
        setIsCreatingSection(false)
      })
  }, [activeProject, isCreatingSection, onCreateSection])

  if (!activeProject) {
    return (
      <WorkspaceStatus
        detail="Open a project section from the sidebar to render its current AHTML document."
        title="No workspace section selected"
      />
    )
  }

  if (!activeSection) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <section className="max-w-md rounded-xl border bg-background p-5 text-foreground shadow-sm">
          <p className="text-sm font-medium">No sections in this project</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Create a section to start editing this workspace project.
          </p>
          {workspaceActionError || createSectionError ? (
            <p className="mt-3 text-sm text-destructive">
              {workspaceActionError ?? createSectionError}
            </p>
          ) : null}
          <Button
            className="mt-4"
            disabled={!canEditStructure || isCreatingSection}
            onClick={handleCreateSection}
            title={canEditStructure ? undefined : "Desktop runtime required"}
            type="button"
          >
            {isCreatingSection ? "Creating..." : "New Section"}
          </Button>
        </section>
      </div>
    )
  }

  if (documentState.status === "idle" || documentState.status === "loading") {
    return (
      <WorkspaceStatus
        detail={`${activeProject.name} / ${activeSection.title}`}
        title="Loading workspace document"
      />
    )
  }

  if (documentState.status === "error") {
    return (
      <WorkspaceStatus
        detail={documentState.message}
        title="Unable to load document"
      />
    )
  }

  if (!runtime) {
    return null
  }

  if (runtime.status === "invalid") {
    return <RuntimeValidationErrors errors={runtime.errors} />
  }

  if (runtime.status === "error") {
    return <WorkspaceStatus detail={runtime.message} title="Runtime error" />
  }

  const threadPickerContent = (
    <ProjectThreadPickerContent {...threadController.threadPickerProps} />
  )

  return (
    <WorkspaceSurfaceFrame
      canSave={canSave}
      colorCssVariables={colorCssVariables}
      isSaveAttentionActive={isSaveAttentionActive}
      isThreadPickerOpen={threadController.isThreadPickerOpen}
      onDropIntent={handleDropIntent}
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

export function WorkspaceLoadErrorState({ detail }: { detail: string }) {
  return <WorkspaceStatus detail={detail} title="Unable to load workspace" />
}
