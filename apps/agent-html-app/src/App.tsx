import * as React from "react"

import {
  galleryThemePresets,
  type GalleryColorTokenName,
  type GalleryColorTokenValue,
  type GalleryThemePresetId,
} from "@/app/gallery/editor-panels"
import { GalleryEditorPanel } from "@/app/gallery/editor"
import { galleryScenes } from "@/app/gallery/scenes"
import { GalleryPanel } from "@/app/gallery/panel"
import { galleryWorkspacePreviewBaseSceneId } from "@/app/gallery/preview-content"
import { GalleryThemeScope } from "@/app/gallery/theme-scope"
import {
  areGalleryThemeDraftsEqual,
  applyGalleryTheme,
  createDefaultGalleryThemeDraft,
  createGalleryPresetThemeDraft,
  loadAppliedGalleryTheme,
  resolveGalleryThemeColorTokenValues,
  saveAppliedGalleryTheme,
  updateGalleryThemeDraftColorTokenValue,
} from "@/app/gallery/theme-apply"
import { AppSidebar } from "@/app/shell/app-sidebar"
import { SiteHeader } from "@/app/shell/site-header"
import { useTheme } from "@/app/shared/theme-provider"
import { closeWindow } from "@/app/shared/lib/window-controls"
import { SidebarInset, SidebarProvider } from "@/app/shared/ui/sidebar"
import { createWorkspaceRepository } from "@/app/workspace/repository"
import { defaultWorkspaceSectionId } from "@/app/workspace/seed"
import {
  WorkspaceLoadErrorState,
  WorkspaceSurface,
} from "@/app/workspace/surface"
import type {
  WorkspaceSection,
  WorkspaceProjectView,
} from "@/app/workspace/types"

type ProjectTab = {
  id: string
  label: string
  projectId: string
  slug: string
}

type SurfaceMode = "gallery" | "workspace"

type HeaderTab = {
  id: string
  isClosable: boolean
  label: string
}

const workspaceRepository = createWorkspaceRepository()
const workspaceCanWrite = workspaceRepository.canWrite

function getInitialAppliedGalleryTheme() {
  if (typeof window === "undefined") {
    return createDefaultGalleryThemeDraft()
  }

  return loadAppliedGalleryTheme() ?? createDefaultGalleryThemeDraft()
}

function getNextActiveTabId(
  currentTabs: ProjectTab[],
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

function getDefaultSectionId(project: WorkspaceProjectView | null) {
  return project?.sections[0]?.id ?? defaultWorkspaceSectionId
}

function getActiveSection(
  activeProject: WorkspaceProjectView | null,
  activeSectionId: string
) {
  return (
    activeProject?.sections.find((section) => section.id === activeSectionId) ??
    activeProject?.sections[0] ??
    null
  )
}

function getNextSectionId(
  sections: WorkspaceSection[],
  removedSectionId: string,
  currentActiveSectionId: string
) {
  if (removedSectionId !== currentActiveSectionId) {
    return currentActiveSectionId
  }

  const removedIndex = sections.findIndex(
    (section) => section.id === removedSectionId
  )
  if (removedIndex === -1) {
    return sections[0]?.id ?? ""
  }

  return (
    sections[removedIndex - 1]?.id ??
    sections[removedIndex + 1]?.id ??
    ""
  )
}

export function App() {
  const { resolvedTheme } = useTheme()
  const [projects, setProjects] = React.useState<WorkspaceProjectView[]>([])
  const [workspaceLoadError, setWorkspaceLoadError] = React.useState<
    string | null
  >(null)
  const [openTabs, setOpenTabs] = React.useState<ProjectTab[]>([])
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null)
  const [activeWorkspaceSectionId, setActiveWorkspaceSectionId] =
    React.useState(defaultWorkspaceSectionId)
  const [workspaceActionError, setWorkspaceActionError] = React.useState<
    string | null
  >(null)
  const [workspaceSaveAttentionToken, setWorkspaceSaveAttentionToken] =
    React.useState(0)
  const [workspaceHasUnsavedChanges, setWorkspaceHasUnsavedChanges] =
    React.useState(false)
  const [surfaceMode, setSurfaceMode] = React.useState<SurfaceMode>("workspace")
  const [appliedGalleryThemeDraft, setAppliedGalleryThemeDraft] =
    React.useState(getInitialAppliedGalleryTheme)
  const [galleryThemeDraft, setGalleryThemeDraft] = React.useState(
    () => appliedGalleryThemeDraft
  )
  const [activeGallerySceneId, setActiveGallerySceneId] = React.useState<string>(
    galleryScenes[0].id
  )

  React.useEffect(() => {
    applyGalleryTheme(appliedGalleryThemeDraft)
  }, [appliedGalleryThemeDraft])

  React.useEffect(() => {
    let isCurrent = true

    async function loadWorkspace() {
      try {
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
        setWorkspaceLoadError(null)

        const firstProject = projectViews[0]
        if (firstProject) {
          const firstSectionId = getDefaultSectionId(firstProject)
          setActiveWorkspaceSectionId(firstSectionId)
          setActiveTabId((currentActiveTabId) => {
            return currentActiveTabId ?? `project:${firstProject.id}`
          })
          setOpenTabs((currentTabs) => {
            if (currentTabs.length > 0) {
              return currentTabs
            }

            return [
              {
                id: `project:${firstProject.id}`,
                label: firstProject.name,
                projectId: firstProject.id,
                slug: firstProject.slug,
              },
            ]
          })
        }
      } catch (error) {
        if (isCurrent) {
          setWorkspaceLoadError(
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

  const isGalleryThemeDirty = React.useMemo(
    () =>
      !areGalleryThemeDraftsEqual(
        galleryThemeDraft,
        appliedGalleryThemeDraft
      ),
    [appliedGalleryThemeDraft, galleryThemeDraft]
  )

  const galleryColorTokenValues = React.useMemo(
    () => resolveGalleryThemeColorTokenValues(galleryThemeDraft, resolvedTheme),
    [galleryThemeDraft, resolvedTheme]
  )

  const activeGalleryThemePresetId =
    galleryThemeDraft.kind === "preset" ? galleryThemeDraft.id : "default"

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

  const activeWorkspaceSection = React.useMemo(
    () => getActiveSection(activeProject, activeWorkspaceSectionId),
    [activeProject, activeWorkspaceSectionId]
  )

  const galleryDisplayScene = React.useMemo(
    () =>
      galleryScenes.find(
        (scene) => scene.id === galleryWorkspacePreviewBaseSceneId
      ) ?? galleryScenes[0],
    []
  )

  const headerTabs = React.useMemo<HeaderTab[]>(() => {
    if (surfaceMode === "gallery") {
      return galleryScenes.map((scene) => ({
        id: scene.id,
        isClosable: false,
        label: scene.label,
      }))
    }

    return openTabs.map((tab) => ({
      id: tab.id,
      isClosable: true,
      label: tab.label,
    }))
  }, [openTabs, surfaceMode])

  const handleCreateProject = React.useCallback(
    async ({ name }: { name: string }) => {
      const project = await workspaceRepository.createProject({ name })
      const tabId = `project:${project.id}`

      setProjects((currentProjects) => [...currentProjects, project])
      setOpenTabs((currentTabs) => [
        ...currentTabs,
        {
          id: tabId,
          label: project.name,
          projectId: project.id,
          slug: project.slug,
        },
      ])
      setActiveTabId(tabId)
      setActiveWorkspaceSectionId(project.sections[0]?.id ?? defaultWorkspaceSectionId)
      setSurfaceMode("workspace")
    },
    []
  )

  const guardWorkspaceStructureEdit = React.useCallback(() => {
    if (!workspaceHasUnsavedChanges) {
      setWorkspaceActionError(null)
      return false
    }

    setWorkspaceActionError(
      "Save current section before editing workspace structure."
    )
    setWorkspaceSaveAttentionToken((current) => current + 1)
    return true
  }, [workspaceHasUnsavedChanges])

  const guardWorkspaceDocumentNavigation = React.useCallback(() => {
    if (!workspaceHasUnsavedChanges) {
      setWorkspaceActionError(null)
      return false
    }

    setWorkspaceActionError("Save current section before leaving this document.")
    setWorkspaceSaveAttentionToken((current) => current + 1)
    return true
  }, [workspaceHasUnsavedChanges])

  const handleOpenProject = React.useCallback(
    (projectId: string) => {
      if (projectId !== activeProject?.id && guardWorkspaceDocumentNavigation()) {
        return
      }

      const project = projects.find((item) => item.id === projectId)
      if (!project) {
        return
      }

      const tabId = `project:${project.id}`

      setOpenTabs((currentTabs) => {
        if (currentTabs.some((tab) => tab.id === tabId)) {
          return currentTabs
        }

        return [
          ...currentTabs,
          {
            id: tabId,
            label: project.name,
            projectId: project.id,
            slug: project.slug,
          },
        ]
      })
      setActiveTabId(tabId)
    },
    [activeProject?.id, guardWorkspaceDocumentNavigation, projects]
  )

  const handleRenameProject = React.useCallback(
    async ({ name, projectId }: { name: string; projectId: string }) => {
      if (guardWorkspaceStructureEdit()) {
        return
      }

      const renamedProject = await workspaceRepository.renameProject({
        name,
        projectId,
      })
      const oldTabId = `project:${projectId}`
      const newTabId = `project:${renamedProject.id}`

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === projectId ? renamedProject : project
        )
      )
      setOpenTabs((currentTabs) =>
        currentTabs.map((tab) =>
          tab.projectId === projectId
            ? {
                id: newTabId,
                label: renamedProject.name,
                projectId: renamedProject.id,
                slug: renamedProject.slug,
              }
            : tab
        )
      )
      setActiveTabId((currentActiveTabId) =>
        currentActiveTabId === oldTabId ? newTabId : currentActiveTabId
      )
      setWorkspaceActionError(null)
    },
    [guardWorkspaceStructureEdit]
  )

  const handleDeleteProject = React.useCallback(
    async ({ projectId }: { projectId: string }) => {
      if (guardWorkspaceStructureEdit()) {
        return
      }

      await workspaceRepository.deleteProject({ projectId })
      const removedTabId = `project:${projectId}`

      setProjects((currentProjects) =>
        currentProjects.filter((project) => project.id !== projectId)
      )
      setOpenTabs((currentTabs) => {
        const removedTabIds = new Set([removedTabId])
        const nextTabs = currentTabs.filter((tab) => tab.id !== removedTabId)

        setActiveTabId((currentActiveTabId) =>
          getNextActiveTabId(currentTabs, removedTabIds, currentActiveTabId)
        )

        if (nextTabs.length === 0) {
          setActiveWorkspaceSectionId("")
        }

        return nextTabs
      })
      setWorkspaceActionError(null)
    },
    [guardWorkspaceStructureEdit]
  )

  const handleCreateProjectSection = React.useCallback(
    async ({ projectId, title }: { projectId: string; title: string }) => {
      if (guardWorkspaceStructureEdit()) {
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
      handleOpenProject(projectId)
      setActiveWorkspaceSectionId(section.id)
      setSurfaceMode("workspace")
      setWorkspaceActionError(null)
    },
    [guardWorkspaceStructureEdit, handleOpenProject]
  )

  const handleRenameProjectSection = React.useCallback(
    async ({
      projectId,
      sectionId,
      title,
    }: {
      projectId: string
      sectionId: string
      title: string
    }) => {
      if (guardWorkspaceStructureEdit()) {
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
      setWorkspaceActionError(null)
    },
    [guardWorkspaceStructureEdit]
  )

  const handleDeleteProjectSection = React.useCallback(
    async ({
      projectId,
      sectionId,
    }: {
      projectId: string
      sectionId: string
    }) => {
      if (guardWorkspaceStructureEdit()) {
        return
      }

      await workspaceRepository.deleteProjectSection({ projectId, sectionId })

      setProjects((currentProjects) =>
        currentProjects.map((project) => {
          if (project.id !== projectId) {
            return project
          }

          const nextSectionId = getNextSectionId(
            project.sections,
            sectionId,
            activeWorkspaceSectionId
          )
          const nextSections = project.sections.filter(
            (section) => section.id !== sectionId
          )

          if (activeProject?.id === projectId) {
            setActiveWorkspaceSectionId(
              nextSections.some((section) => section.id === nextSectionId)
                ? nextSectionId
                : nextSections[0]?.id ?? ""
            )
          }

          return { ...project, sections: nextSections }
        })
      )
      setWorkspaceActionError(null)
    },
    [
      activeProject?.id,
      activeWorkspaceSectionId,
      guardWorkspaceStructureEdit,
    ]
  )

  const handleDuplicateProjectSection = React.useCallback(
    async ({
      projectId,
      sectionId,
    }: {
      projectId: string
      sectionId: string
    }) => {
      if (guardWorkspaceStructureEdit()) {
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
      handleOpenProject(projectId)
      setActiveWorkspaceSectionId(section.id)
      setSurfaceMode("workspace")
      setWorkspaceActionError(null)
    },
    [guardWorkspaceStructureEdit, handleOpenProject]
  )

  const handleSelectWorkspaceSection = React.useCallback(
    (sectionId: string) => {
      if (sectionId === activeWorkspaceSectionId) {
        return
      }

      if (guardWorkspaceDocumentNavigation()) {
        return
      }

      setActiveWorkspaceSectionId(sectionId)
    },
    [activeWorkspaceSectionId, guardWorkspaceDocumentNavigation]
  )

  const handleSelectTab = React.useCallback(
    (tabId: string) => {
      if (tabId === activeTabId && surfaceMode !== "gallery") {
        return
      }

      if (surfaceMode !== "gallery" && guardWorkspaceDocumentNavigation()) {
        return
      }

      if (surfaceMode === "gallery") {
        const nextSceneId = galleryScenes.some((scene) => scene.id === tabId)
          ? tabId
          : galleryWorkspacePreviewBaseSceneId

        setActiveGallerySceneId(nextSceneId)
        return
      }

      const nextTab = openTabs.find((tab) => tab.id === tabId)
      const nextProject = nextTab
        ? projects.find((project) => project.id === nextTab.projectId)
        : null

      setActiveTabId(tabId)
      setActiveWorkspaceSectionId(getDefaultSectionId(nextProject ?? null))
    },
    [
      activeTabId,
      guardWorkspaceDocumentNavigation,
      openTabs,
      projects,
      surfaceMode,
    ]
  )

  const handleCloseTab = React.useCallback((tabId: string) => {
    if (tabId === activeTabId && guardWorkspaceDocumentNavigation()) {
      return
    }

    setOpenTabs((currentTabs) => {
      if (!currentTabs.some((tab) => tab.id === tabId)) {
        return currentTabs
      }

      const removedTabIds = new Set([tabId])
      const nextTabs = currentTabs.filter((tab) => tab.id !== tabId)

      setActiveTabId((currentActiveTabId) => {
        return getNextActiveTabId(currentTabs, removedTabIds, currentActiveTabId)
      })

      return nextTabs
    })
  }, [activeTabId, guardWorkspaceDocumentNavigation])

  const handleEnterGalleryMode = React.useCallback(() => {
    if (guardWorkspaceDocumentNavigation()) {
      return
    }

    setSurfaceMode("gallery")
  }, [guardWorkspaceDocumentNavigation])

  const handleExitGalleryMode = React.useCallback(() => {
    setSurfaceMode("workspace")
  }, [])

  const handleCloseWindow = React.useCallback(() => {
    if (guardWorkspaceDocumentNavigation()) {
      return
    }

    void closeWindow()
  }, [guardWorkspaceDocumentNavigation])

  const handleApplyGalleryTheme = React.useCallback(() => {
    saveAppliedGalleryTheme(galleryThemeDraft)
    setAppliedGalleryThemeDraft(galleryThemeDraft)
  }, [galleryThemeDraft])

  const handleSelectGalleryThemePreset = React.useCallback(
    (presetId: GalleryThemePresetId) => {
      const draft = createGalleryPresetThemeDraft(presetId)
      if (!draft) {
        return
      }

      setGalleryThemeDraft(draft)
    },
    []
  )

  const sidebar = (
    <AppSidebar
      activeProjectId={activeProject?.id ?? null}
      activeWorkspaceSectionId={activeWorkspaceSection?.id ?? ""}
      canCreateProject={workspaceCanWrite}
      galleryContent={
        <GalleryEditorPanel
          colorTokenValues={galleryColorTokenValues}
          onColorTokenValueChange={(
            token: GalleryColorTokenName,
            value: GalleryColorTokenValue
          ) =>
            setGalleryThemeDraft((current) =>
              updateGalleryThemeDraftColorTokenValue({
                draft: current,
                resolvedMode: resolvedTheme,
                token,
                value,
              })
            )
          }
        />
      }
      activeGalleryThemePresetId={activeGalleryThemePresetId}
      galleryThemePresets={galleryThemePresets}
      isGalleryThemeDirty={isGalleryThemeDirty}
      mode={surfaceMode}
      onApplyGalleryTheme={handleApplyGalleryTheme}
      onCreateProject={handleCreateProject}
      onCreateProjectSection={handleCreateProjectSection}
      onDeleteProject={handleDeleteProject}
      onDeleteProjectSection={handleDeleteProjectSection}
      onDuplicateProjectSection={handleDuplicateProjectSection}
      onEnterGalleryMode={handleEnterGalleryMode}
      onExitGalleryMode={handleExitGalleryMode}
      onOpenProject={handleOpenProject}
      onRenameProject={handleRenameProject}
      onRenameProjectSection={handleRenameProjectSection}
      onSelectGalleryThemePreset={handleSelectGalleryThemePreset}
      onWorkspaceSectionSelect={handleSelectWorkspaceSection}
      projects={projects}
      workspaceActionError={workspaceActionError}
      workspaceCanEditStructure={workspaceCanWrite}
      workspaceHasUnsavedChanges={workspaceHasUnsavedChanges}
      variant="inset"
    />
  )

  const header = (
    <SiteHeader
      activeTabId={surfaceMode === "gallery" ? activeGallerySceneId : activeTabId}
      onCloseWindow={handleCloseWindow}
      onCloseTab={handleCloseTab}
      onSelectTab={handleSelectTab}
      tabs={headerTabs}
    />
  )

  const appSurface = (
    <>
      {header}
      <main className="flex min-h-0 flex-1 overflow-hidden">
        {sidebar}
        <SidebarInset className="min-h-0 overflow-hidden border-0 shadow-none md:mr-2 md:mb-2 md:peer-data-[variant=inset]:shadow-none">
          {surfaceMode === "gallery" ? (
            <GalleryPanel scene={galleryDisplayScene} />
          ) : workspaceLoadError ? (
            <WorkspaceLoadErrorState detail={workspaceLoadError} />
          ) : (
            <WorkspaceSurface
              activeProject={activeProject}
              activeSection={activeWorkspaceSection}
              canEditStructure={workspaceCanWrite}
              canSave={workspaceCanWrite}
              onCreateSection={handleCreateProjectSection}
              onDirtyChange={setWorkspaceHasUnsavedChanges}
              saveAttentionToken={workspaceSaveAttentionToken}
              workspaceActionError={workspaceActionError}
            />
          )}
        </SidebarInset>
      </main>
    </>
  )

  const framedAppSurface = (
    <SidebarProvider
      className={
        surfaceMode === "gallery"
          ? "min-h-0 flex-1 flex-col overflow-hidden"
          : "h-svh min-h-svh flex-col overflow-hidden"
      }
      style={
        {
          "--header-height": "2.5rem",
          "--sidebar": "var(--background)",
          "--sidebar-foreground": "var(--foreground)",
          "--sidebar-accent": "var(--muted)",
          "--sidebar-accent-foreground": "var(--foreground)",
          "--sidebar-border": "var(--border)",
          "--sidebar-ring": "var(--ring)",
        } as React.CSSProperties
      }
    >
      {appSurface}
    </SidebarProvider>
  )

  return surfaceMode === "gallery" ? (
    <GalleryThemeScope themeDraft={galleryThemeDraft}>
      {framedAppSurface}
    </GalleryThemeScope>
  ) : (
    framedAppSurface
  )
}

export default App
