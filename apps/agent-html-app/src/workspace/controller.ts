import * as React from "react"

import { markCodexStartupEvent } from "@/app/codex/connection"
import { createWorkspaceRepository } from "@/app/workspace/repository"
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

const workspaceRepository = createWorkspaceRepository()

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
  const [saveAttentionToken, setSaveAttentionToken] = React.useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)

  React.useEffect(() => {
    let isCurrent = true

    async function loadWorkspace() {
      try {
        markCodexStartupEvent("workspace-load-start")
        const nextProjects = await workspaceRepository.listProjects()
        const projectViews = await Promise.all(
          nextProjects.map(async (project) => ({
            ...project,
            sections: await workspaceRepository.listProjectSections(project.id),
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

  const guardStructureEdit = React.useCallback(() => {
    if (!hasUnsavedChanges) {
      setActionError(null)
      return false
    }

    setActionError("Save current section before editing workspace structure.")
    setSaveAttentionToken((current) => current + 1)
    return true
  }, [hasUnsavedChanges])

  const guardDocumentNavigation = React.useCallback(() => {
    if (!hasUnsavedChanges) {
      setActionError(null)
      return false
    }

    setActionError("Save current section before leaving this document.")
    setSaveAttentionToken((current) => current + 1)
    return true
  }, [hasUnsavedChanges])

  const createProject = React.useCallback(
    async ({ name }: { name: string }) => {
      const project = await workspaceRepository.createProject({ name })
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
      if (tabId !== activeTabId && guardDocumentNavigation()) {
        return
      }

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
    [activeTabId, guardDocumentNavigation, onActivateWorkspace, projects]
  )

  const renameProject = React.useCallback(
    async ({ name, projectId }: { name: string; projectId: string }) => {
      if (guardStructureEdit()) {
        return
      }

      const renamedProject = await workspaceRepository.renameProject({
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
    [guardStructureEdit]
  )

  const deleteProject = React.useCallback(
    async ({ projectId }: { projectId: string }) => {
      if (guardStructureEdit()) {
        return
      }

      await workspaceRepository.deleteProject({ projectId })

      setProjects((currentProjects) =>
        currentProjects.filter((project) => project.id !== projectId)
      )
      setOpenTabs((currentTabs) => {
        const removedTabIds = new Set(
          currentTabs
            .filter((tab) => tab.projectId === projectId)
            .map((tab) => tab.id)
        )
        const nextTabs = currentTabs.filter((tab) => tab.projectId !== projectId)

        setActiveTabId((currentActiveTabId) =>
          getNextActiveTabId(currentTabs, removedTabIds, currentActiveTabId)
        )

        return nextTabs
      })
      setActionError(null)
    },
    [guardStructureEdit]
  )

  const createProjectSection = React.useCallback(
    async ({ projectId, title }: { projectId: string; title: string }) => {
      if (guardStructureEdit()) {
        return
      }

      const section = await workspaceRepository.createProjectSection({
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
    [guardStructureEdit, onActivateWorkspace]
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
      if (guardStructureEdit()) {
        return
      }

      const renamedSection = await workspaceRepository.renameProjectSection({
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
    [guardStructureEdit]
  )

  const deleteProjectSection = React.useCallback(
    async ({
      projectId,
      sectionId,
    }: {
      projectId: string
      sectionId: string
    }) => {
      if (guardStructureEdit()) {
        return
      }

      await workspaceRepository.deleteProjectSection({ projectId, sectionId })
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
      setOpenTabs((currentTabs) => {
        if (!currentTabs.some((tab) => tab.id === removedTabId)) {
          return currentTabs
        }

        const removedTabIds = new Set([removedTabId])
        const nextTabs = currentTabs.filter((tab) => tab.id !== removedTabId)

        setActiveTabId((currentActiveTabId) =>
          getNextActiveTabId(currentTabs, removedTabIds, currentActiveTabId)
        )

        return nextTabs
      })
      setActionError(null)
    },
    [guardStructureEdit]
  )

  const duplicateProjectSection = React.useCallback(
    async ({
      projectId,
      sectionId,
    }: {
      projectId: string
      sectionId: string
    }) => {
      if (guardStructureEdit()) {
        return
      }

      const section = await workspaceRepository.duplicateProjectSection({
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
    [guardStructureEdit, onActivateWorkspace]
  )

  const selectTab = React.useCallback((tabId: string) => {
    setActiveTabId(tabId)
  }, [])

  const closeTab = React.useCallback(
    (tabId: string) => {
      if (tabId === activeTabId && guardDocumentNavigation()) {
        return
      }

      setOpenTabs((currentTabs) => {
        if (!currentTabs.some((tab) => tab.id === tabId)) {
          return currentTabs
        }

        const removedTabIds = new Set([tabId])
        const nextTabs = currentTabs.filter((tab) => tab.id !== tabId)

        setActiveTabId((currentActiveTabId) => {
          return getNextActiveTabId(
            currentTabs,
            removedTabIds,
            currentActiveTabId
          )
        })

        return nextTabs
      })
    },
    [activeTabId, guardDocumentNavigation]
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

  return {
    activeProject,
    activeSection,
    activeTabId,
    canWrite: workspaceRepository.canWrite,
    closeTab,
    createProject,
    createProjectSection,
    deleteProject,
    deleteProjectSection,
    duplicateProjectSection,
    guardDocumentNavigation,
    hasUnsavedChanges,
    loadError,
    openSection,
    openTabs,
    projects,
    renameProject,
    renameProjectSection,
    reorderTabs,
    saveAttentionToken,
    selectTab,
    setHasUnsavedChanges,
    actionError,
  }
}
