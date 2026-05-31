import * as React from "react"

import { markCodexStartupEvent } from "@/app/codex/connection"
import { createWorkspaceStore } from "@/app/workspace/store"
import type { WorkspaceDocumentDraft } from "@/app/workspace/document-controller"
import type {
  WorkspaceProjectView,
  WorkspaceSection,
} from "@/app/workspace/types"

export type WorkspaceTab = {
  id: string
  label: string
  projectId: string
  sectionId: string
}

type PendingUnsavedWorkspaceAction =
  | { tabId: string; type: "close-tab" }
  | { type: "leave-workspace" }

type PendingUnsavedContinuation = (() => void) | null

const workspaceStore = createWorkspaceStore()

function getNextActiveTabId(
  currentTabs: WorkspaceTab[],
  removedTabIds: Set<string>,
  currentActiveTabId: string | null
) {
  if (!currentActiveTabId || !removedTabIds.has(currentActiveTabId)) {
    return currentActiveTabId
  }

  const closingIndex = currentTabs.findIndex(
    (tab) => tab.id === currentActiveTabId
  )
  if (closingIndex === -1) {
    return null
  }

  for (let index = closingIndex - 1; index >= 0; index -= 1) {
    if (!removedTabIds.has(currentTabs[index].id)) {
      return currentTabs[index].id
    }
  }

  for (let index = closingIndex + 1; index < currentTabs.length; index += 1) {
    if (!removedTabIds.has(currentTabs[index].id)) {
      return currentTabs[index].id
    }
  }

  return null
}

function getSectionTabId(sectionId: string) {
  return `section:${sectionId}`
}

function createWorkspaceSectionTab({
  project,
  section,
}: {
  project: WorkspaceProjectView
  section: WorkspaceSection
}): WorkspaceTab {
  return {
    id: getSectionTabId(section.id),
    label: section.title,
    projectId: project.id,
    sectionId: section.id,
  }
}

function getFirstWorkspaceSection(projects: WorkspaceProjectView[]) {
  for (const project of projects) {
    const section = project.sections[0]
    if (section) {
      return { project, section }
    }
  }

  return null
}

export function useWorkspaceController({
  onActivateWorkspace,
}: {
  onActivateWorkspace: () => void
}) {
  const [projects, setProjects] = React.useState<WorkspaceProjectView[]>([])
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [openTabs, setOpenTabs] = React.useState<WorkspaceTab[]>([])
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null)
  const [actionError, setActionError] = React.useState<string | null>(null)
  const [dirtyTabIds, setDirtyTabIds] = React.useState<Set<string>>(
    () => new Set()
  )
  const [draftsByTabId, setDraftsByTabId] = React.useState(
    () => new Map<string, WorkspaceDocumentDraft>()
  )
  const [pendingUnsavedAction, setPendingUnsavedAction] =
    React.useState<PendingUnsavedWorkspaceAction | null>(null)
  const pendingUnsavedContinuationRef =
    React.useRef<PendingUnsavedContinuation>(null)
  const bypassNextUnsavedGuardRef = React.useRef(false)
  const hasUnsavedChanges = dirtyTabIds.size > 0

  React.useEffect(() => {
    let isCurrent = true

    async function loadWorkspace() {
      try {
        markCodexStartupEvent("workspace-load-start")
        const nextProjects = await workspaceStore.listProjects()
        const projectViews = await Promise.all(
          nextProjects.map(async (project) => ({
            ...project,
            sections: await workspaceStore.listProjectSections(project.id),
          }))
        )

        if (!isCurrent) {
          return
        }

        setProjects(projectViews)
        setLoadError(null)
        markCodexStartupEvent("workspace-load-ready", {
          projectCount: projectViews.length,
          sectionCount: projectViews.reduce(
            (count, project) => count + project.sections.length,
            0
          ),
        })

        const firstWorkspaceSection = getFirstWorkspaceSection(projectViews)
        if (firstWorkspaceSection) {
          const firstTab = createWorkspaceSectionTab(firstWorkspaceSection)
          setActiveTabId((currentActiveTabId) => {
            return currentActiveTabId ?? firstTab.id
          })
          setOpenTabs((currentTabs) => {
            if (currentTabs.length > 0) {
              return currentTabs
            }

            return [firstTab]
          })
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(
            error instanceof Error ? error.message : "Unable to load workspace."
          )
        }
      }
    }

    loadWorkspace()

    return () => {
      isCurrent = false
    }
  }, [])

  const activeTab = React.useMemo(
    () => openTabs.find((tab) => tab.id === activeTabId) ?? null,
    [activeTabId, openTabs]
  )

  const activeProject = React.useMemo(
    () =>
      activeTab
        ? projects.find((project) => project.id === activeTab.projectId) ?? null
        : null,
    [activeTab, projects]
  )

  const activeSection = React.useMemo(
    () =>
      activeProject?.sections.find(
        (section) => section.id === activeTab?.sectionId
      ) ?? null,
    [activeProject, activeTab?.sectionId]
  )

  const guardStructureEdit = React.useCallback((continuation?: () => void) => {
    if (bypassNextUnsavedGuardRef.current) {
      bypassNextUnsavedGuardRef.current = false
      setActionError(null)
      return false
    }

    if (!hasUnsavedChanges) {
      setActionError(null)
      return false
    }

    pendingUnsavedContinuationRef.current = continuation ?? null
    setPendingUnsavedAction({ type: "leave-workspace" })
    return true
  }, [hasUnsavedChanges])

  const guardDocumentNavigation = React.useCallback((continuation?: () => void) => {
    if (bypassNextUnsavedGuardRef.current) {
      bypassNextUnsavedGuardRef.current = false
      setActionError(null)
      return false
    }

    if (!hasUnsavedChanges) {
      setActionError(null)
      return false
    }

    pendingUnsavedContinuationRef.current = continuation ?? null
    setPendingUnsavedAction({ type: "leave-workspace" })
    return true
  }, [hasUnsavedChanges])

  const setDocumentDraft = React.useCallback(
    (tabId: string, draft: WorkspaceDocumentDraft | null) => {
      setDraftsByTabId((currentDrafts) => {
        const currentDraft = currentDrafts.get(tabId) ?? null
        if (
          currentDraft?.document === draft?.document &&
          currentDraft?.saveState === draft?.saveState
        ) {
          return currentDrafts
        }

        if (!currentDraft && !draft) {
          return currentDrafts
        }

        const nextDrafts = new Map(currentDrafts)
        if (draft) {
          nextDrafts.set(tabId, draft)
        } else {
          nextDrafts.delete(tabId)
        }

        return nextDrafts
      })
    },
    []
  )

  const setTabDirty = React.useCallback(
    (tabId: string | null, isDirty: boolean) => {
      if (!tabId) {
        return
      }

      setDirtyTabIds((currentTabIds) => {
        if (currentTabIds.has(tabId) === isDirty) {
          return currentTabIds
        }

        const nextTabIds = new Set(currentTabIds)
        if (isDirty) {
          nextTabIds.add(tabId)
        } else {
          nextTabIds.delete(tabId)
        }

        return nextTabIds
      })
    },
    []
  )

  const removeTabs = React.useCallback(
    (tabIds: Set<string>) => {
      setOpenTabs((currentTabs) => {
        const nextTabs = currentTabs.filter((tab) => !tabIds.has(tab.id))

        setActiveTabId((currentActiveTabId) =>
          getNextActiveTabId(currentTabs, tabIds, currentActiveTabId)
        )

        return nextTabs
      })
      setDirtyTabIds((currentTabIds) => {
        const nextTabIds = new Set(currentTabIds)
        for (const tabId of tabIds) {
          nextTabIds.delete(tabId)
        }
        return nextTabIds
      })
      setDraftsByTabId((currentDrafts) => {
        const nextDrafts = new Map(currentDrafts)
        for (const tabId of tabIds) {
          nextDrafts.delete(tabId)
        }
        return nextDrafts
      })
    },
    []
  )

  const discardPendingUnsavedAction = React.useCallback(() => {
    const action = pendingUnsavedAction
    if (!action) {
      return
    }

    if (action.type === "close-tab") {
      removeTabs(new Set([action.tabId]))
    }

    if (action.type === "leave-workspace") {
      setDirtyTabIds(new Set())
      setDraftsByTabId(new Map())
      bypassNextUnsavedGuardRef.current = true
      pendingUnsavedContinuationRef.current?.()
      pendingUnsavedContinuationRef.current = null
    }

    setPendingUnsavedAction(null)
    setActionError(null)
  }, [pendingUnsavedAction, removeTabs])

  const cancelPendingUnsavedAction = React.useCallback(() => {
    pendingUnsavedContinuationRef.current = null
    setPendingUnsavedAction(null)
  }, [])

  const savePendingUnsavedAction = React.useCallback(async () => {
    const action = pendingUnsavedAction
    if (!action) {
      return
    }

    const tabIds =
      action.type === "close-tab" ? [action.tabId] : Array.from(dirtyTabIds)
    const drafts = tabIds.flatMap((tabId) => {
      const draft = draftsByTabId.get(tabId)
      return draft ? [{ draft, tabId }] : []
    })

    try {
      await Promise.all(
        drafts.map(({ draft }) =>
          workspaceStore.updateProjectSectionDocument({
            projectId: draft.document.projectId,
            sectionId: draft.document.sectionId,
            source: draft.document.source,
          })
        )
      )
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to save workspace changes."
      )
      return
    }

    if (action.type === "close-tab") {
      removeTabs(new Set([action.tabId]))
    } else {
      setDirtyTabIds(new Set())
      setDraftsByTabId(new Map())
      bypassNextUnsavedGuardRef.current = true
      pendingUnsavedContinuationRef.current?.()
      pendingUnsavedContinuationRef.current = null
    }

    setPendingUnsavedAction(null)
    setActionError(null)
  }, [dirtyTabIds, draftsByTabId, pendingUnsavedAction, removeTabs])

  const createProject = React.useCallback(
    async ({ name }: { name: string }) => {
      const project = await workspaceStore.createProject({ name })
      const firstSection = project.sections[0]
      const tab = firstSection
        ? createWorkspaceSectionTab({ project, section: firstSection })
        : null

      setProjects((currentProjects) => [...currentProjects, project])
      if (tab) {
        setOpenTabs((currentTabs) => [...currentTabs, tab])
        setActiveTabId(tab.id)
      }
      onActivateWorkspace()
    },
    [onActivateWorkspace]
  )

  const openSection = React.useCallback(
    ({ projectId, sectionId }: { projectId: string; sectionId: string }) => {
      const tabId = getSectionTabId(sectionId)

      const project = projects.find((item) => item.id === projectId)
      if (!project) {
        return
      }

      const section = project.sections.find((item) => item.id === sectionId)
      if (!section) {
        return
      }

      const tab = createWorkspaceSectionTab({ project, section })

      setOpenTabs((currentTabs) => {
        if (currentTabs.some((tab) => tab.id === tabId)) {
          return currentTabs
        }

        return [...currentTabs, tab]
      })
      setActiveTabId(tabId)
      onActivateWorkspace()
    },
    [onActivateWorkspace, projects]
  )

  const renameProjectAction = React.useCallback(
    async ({ name, projectId }: { name: string; projectId: string }) => {
      const renamedProject = await workspaceStore.renameProject({
        name,
        projectId,
      })

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === projectId ? renamedProject : project
        )
      )
      setActionError(null)
    },
    []
  )

  const renameProject = React.useCallback(
    async ({ name, projectId }: { name: string; projectId: string }) => {
      if (
        guardStructureEdit(() =>
          void renameProjectAction({ name, projectId })
        )
      ) {
        return
      }

      await renameProjectAction({ name, projectId })
    },
    [guardStructureEdit, renameProjectAction]
  )

  const deleteProjectAction = React.useCallback(
    async ({ projectId }: { projectId: string }) => {
      await workspaceStore.deleteProject({ projectId })

      const removedTabIds = new Set(
        openTabs
          .filter((tab) => tab.projectId === projectId)
          .map((tab) => tab.id)
      )
      setProjects((currentProjects) =>
        currentProjects.filter((project) => project.id !== projectId)
      )
      removeTabs(removedTabIds)
      setActionError(null)
    },
    [openTabs, removeTabs]
  )

  const deleteProject = React.useCallback(
    async ({ projectId }: { projectId: string }) => {
      if (guardStructureEdit(() => void deleteProjectAction({ projectId }))) {
        return
      }

      await deleteProjectAction({ projectId })
    },
    [deleteProjectAction, guardStructureEdit]
  )

  const createProjectSectionAction = React.useCallback(
    async ({ projectId, title }: { projectId: string; title: string }) => {
      const section = await workspaceStore.createProjectSection({
        projectId,
        title,
      })

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === projectId
            ? { ...project, sections: [...project.sections, section] }
            : project
        )
      )
      setOpenTabs((currentTabs) => [
        ...currentTabs,
        {
          id: getSectionTabId(section.id),
          label: section.title,
          projectId,
          sectionId: section.id,
        },
      ])
      setActiveTabId(getSectionTabId(section.id))
      onActivateWorkspace()
      setActionError(null)
    },
    [onActivateWorkspace]
  )

  const createProjectSection = React.useCallback(
    async ({ projectId, title }: { projectId: string; title: string }) => {
      if (
        guardStructureEdit(() =>
          void createProjectSectionAction({ projectId, title })
        )
      ) {
        return
      }

      await createProjectSectionAction({ projectId, title })
    },
    [createProjectSectionAction, guardStructureEdit]
  )

  const renameProjectSectionAction = React.useCallback(
    async ({
      projectId,
      sectionId,
      title,
    }: {
      projectId: string
      sectionId: string
      title: string
    }) => {
      const renamedSection = await workspaceStore.renameProjectSection({
        projectId,
        sectionId,
        title,
      })

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                sections: project.sections.map((section) =>
                  section.id === sectionId ? renamedSection : section
                ),
              }
            : project
        )
      )
      setOpenTabs((currentTabs) =>
        currentTabs.map((tab) =>
          tab.sectionId === sectionId
            ? { ...tab, label: renamedSection.title }
            : tab
        )
      )
      setActionError(null)
    },
    []
  )

  const renameProjectSection = React.useCallback(
    async ({
      projectId,
      sectionId,
      title,
    }: {
      projectId: string
      sectionId: string
      title: string
    }) => {
      if (
        guardStructureEdit(
          () => void renameProjectSectionAction({ projectId, sectionId, title })
        )
      ) {
        return
      }

      await renameProjectSectionAction({ projectId, sectionId, title })
    },
    [guardStructureEdit, renameProjectSectionAction]
  )

  const deleteProjectSectionAction = React.useCallback(
    async ({
      projectId,
      sectionId,
    }: {
      projectId: string
      sectionId: string
    }) => {
      await workspaceStore.deleteProjectSection({ projectId, sectionId })
      const removedTabId = getSectionTabId(sectionId)

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === projectId
            ? {
                ...project,
                sections: project.sections.filter(
                  (section) => section.id !== sectionId
                ),
              }
            : project
        )
      )
      removeTabs(new Set([removedTabId]))
      setActionError(null)
    },
    [removeTabs]
  )

  const deleteProjectSection = React.useCallback(
    async ({
      projectId,
      sectionId,
    }: {
      projectId: string
      sectionId: string
    }) => {
      if (
        guardStructureEdit(
          () => void deleteProjectSectionAction({ projectId, sectionId })
        )
      ) {
        return
      }

      await deleteProjectSectionAction({ projectId, sectionId })
    },
    [deleteProjectSectionAction, guardStructureEdit]
  )

  const duplicateProjectSectionAction = React.useCallback(
    async ({
      projectId,
      sectionId,
    }: {
      projectId: string
      sectionId: string
    }) => {
      const section = await workspaceStore.duplicateProjectSection({
        projectId,
        sectionId,
      })

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === projectId
            ? { ...project, sections: [...project.sections, section] }
            : project
        )
      )
      setOpenTabs((currentTabs) => [
        ...currentTabs,
        {
          id: getSectionTabId(section.id),
          label: section.title,
          projectId,
          sectionId: section.id,
        },
      ])
      setActiveTabId(getSectionTabId(section.id))
      onActivateWorkspace()
      setActionError(null)
    },
    [onActivateWorkspace]
  )

  const duplicateProjectSection = React.useCallback(
    async ({
      projectId,
      sectionId,
    }: {
      projectId: string
      sectionId: string
    }) => {
      if (
        guardStructureEdit(
          () => void duplicateProjectSectionAction({ projectId, sectionId })
        )
      ) {
        return
      }

      await duplicateProjectSectionAction({ projectId, sectionId })
    },
    [duplicateProjectSectionAction, guardStructureEdit]
  )

  const selectTab = React.useCallback((tabId: string) => {
    setActiveTabId(tabId)
  }, [])

  const closeTab = React.useCallback(
    (tabId: string) => {
      if (dirtyTabIds.has(tabId)) {
        setPendingUnsavedAction({ tabId, type: "close-tab" })
        return
      }

      removeTabs(new Set([tabId]))
    },
    [dirtyTabIds, removeTabs]
  )

  const reorderTabs = React.useCallback((orderedTabIds: string[]) => {
    setOpenTabs((currentTabs) => {
      const tabsById = new Map(currentTabs.map((tab) => [tab.id, tab]))
      const nextTabs = orderedTabIds.flatMap((tabId) => {
        const tab = tabsById.get(tabId)
        return tab ? [tab] : []
      })

      if (nextTabs.length !== currentTabs.length) {
        return currentTabs
      }

      return nextTabs
    })
  }, [])

  const isTabDirty = React.useCallback(
    (tabId: string) => dirtyTabIds.has(tabId),
    [dirtyTabIds]
  )

  return {
    activeProject,
    activeSection,
    activeTabId,
    activeTabDraft: activeTabId ? draftsByTabId.get(activeTabId) ?? null : null,
    canWrite: workspaceStore.canWrite,
    closeTab,
    createProject,
    createProjectSection,
    deleteProject,
    deleteProjectSection,
    duplicateProjectSection,
    guardDocumentNavigation,
    hasUnsavedChanges,
    isTabDirty,
    loadError,
    openSection,
    openTabs,
    projects,
    renameProject,
    renameProjectSection,
    reorderTabs,
    pendingUnsavedAction,
    cancelPendingUnsavedAction,
    savePendingUnsavedAction,
    selectTab,
    setDocumentDraft,
    setTabDirty,
    discardPendingUnsavedAction,
    actionError,
  }
}
