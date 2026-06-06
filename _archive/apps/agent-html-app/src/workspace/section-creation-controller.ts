import * as React from "react"

import type { WorkspaceProjectView } from "@/app/workspace/types"

export function useWorkspaceSectionCreation({
  activeProject,
  onCreateSection,
}: {
  activeProject: WorkspaceProjectView | null
  onCreateSection: (input: { projectId: string; title: string }) => Promise<void>
}) {
  const [isCreatingSection, setIsCreatingSection] = React.useState(false)
  const [createSectionError, setCreateSectionError] = React.useState<
    string | null
  >(null)

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

  return {
    create: handleCreateSection,
    error: createSectionError,
    isCreating: isCreatingSection,
  }
}
