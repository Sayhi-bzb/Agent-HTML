import * as React from "react"

import {
  appThemePresets,
  type AppColorTokenName,
  type AppColorTokenValue,
  type AppThemePresetId,
} from "@/app/shared/app-theme/tokens"
import { GalleryEditorPanel } from "@/app/gallery/editor"
import { GalleryPanel } from "@/app/gallery/panel"
import {
  GalleryMarketSidebar,
  GalleryThemeSidebarFooter,
  GalleryThemeSidebarHeader,
} from "@/app/gallery/sidebar"
import type { GalleryThemeEditorSectionId } from "@/app/gallery/theme-editor-sections"
import {
  galleryViews,
  isGalleryViewId,
  type GalleryViewId,
} from "@/app/gallery/views"
import { AppThemeScope } from "@/app/shared/app-theme/scope"
import {
  areAppThemeDraftsEqual,
  applyAppTheme,
  createDefaultAppThemeDraft,
  createAppPresetThemeDraft,
  loadAppliedAppTheme,
  resolveAppThemeColorTokenValues,
  resolveAppThemeCssVariables,
  saveAppliedAppTheme,
  updateAppThemeDraftColorTokenValue,
  updateAppThemeDraftCssVariable,
  updateAppThemeDraftCssVariables,
} from "@/app/shared/app-theme/theme"
import type { AppThemeEditableVariableName } from "@/app/shared/app-theme/variables"
import { AppSidebar } from "@/app/shell/app-sidebar"
import { ConfirmationDialog } from "@/app/shell/confirmation-dialog"
import { SiteHeader, type HeaderTab } from "@/app/shell/site-header"
import { useTheme } from "@/app/shared/theme-provider"
import { closeWindow } from "@/app/shared/lib/window-controls"
import { SidebarInset, SidebarProvider } from "@/app/shared/ui/sidebar"
import { createWorkspaceRepository } from "@/app/workspace/repository"
import {
  WorkspaceLoadErrorState,
  WorkspaceSurface,
} from "@/app/workspace/surface"
import type {
  AgentHtmlColorCssVariables,
  AgentHtmlColorTokenValues,
} from "@/agent-html"
import type {
  WorkspaceSection,
  WorkspaceProjectView,
} from "@/app/workspace/types"

type WorkspaceTab = {
  id: string
  label: string
  projectId: string
  sectionId: string
}

type SurfaceMode = "gallery" | "workspace"

const workspaceRepository = createWorkspaceRepository()
const workspaceCanWrite = workspaceRepository.canWrite

function getInitialAppliedAppTheme() {
  if (typeof window === "undefined") {
    return createDefaultAppThemeDraft()
  }

  return loadAppliedAppTheme() ?? createDefaultAppThemeDraft()
}

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

export function App() {
  const { resolvedTheme } = useTheme()
  const [projects, setProjects] = React.useState<WorkspaceProjectView[]>([])
  const [workspaceLoadError, setWorkspaceLoadError] = React.useState<
    string | null
  >(null)
  const [openTabs, setOpenTabs] = React.useState<WorkspaceTab[]>([])
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null)
  const [workspaceActionError, setWorkspaceActionError] = React.useState<
    string | null
  >(null)
  const [workspaceSaveAttentionToken, setWorkspaceSaveAttentionToken] =
    React.useState(0)
  const [workspaceHasUnsavedChanges, setWorkspaceHasUnsavedChanges] =
    React.useState(false)
  const [surfaceMode, setSurfaceMode] = React.useState<SurfaceMode>("workspace")
  const [appliedAppThemeDraft, setAppliedAppThemeDraft] =
    React.useState(getInitialAppliedAppTheme)
  const [appThemeDraft, setAppThemeDraft] = React.useState(
    () => appliedAppThemeDraft
  )
  const [isGalleryExitDialogOpen, setIsGalleryExitDialogOpen] =
    React.useState(false)
  const [activeGalleryViewId, setActiveGalleryViewId] =
    React.useState<GalleryViewId>("theme")
  const [activeGalleryThemeEditorSectionId, setActiveGalleryThemeEditorSectionId] =
    React.useState<GalleryThemeEditorSectionId>("color")
  const [pendingGalleryViewId, setPendingGalleryViewId] =
    React.useState<GalleryViewId | null>(null)

  React.useEffect(() => {
    applyAppTheme(appliedAppThemeDraft)
  }, [appliedAppThemeDraft])

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

            return [
              firstTab,
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
      !areAppThemeDraftsEqual(
        appThemeDraft,
        appliedAppThemeDraft
      ),
    [appliedAppThemeDraft, appThemeDraft]
  )

  const appColorTokenValues = React.useMemo(
    () =>
      resolveAppThemeColorTokenValues(
        appThemeDraft,
        resolvedTheme
      ) as AgentHtmlColorTokenValues,
    [appThemeDraft, resolvedTheme]
  )
  const appliedAppThemeCssVariables = React.useMemo(
    () =>
      resolveAppThemeCssVariables(
        appliedAppThemeDraft,
        resolvedTheme
      ) as AgentHtmlColorCssVariables,
    [appliedAppThemeDraft, resolvedTheme]
  )
  const appThemeCssVariables = React.useMemo(
    () => resolveAppThemeCssVariables(appThemeDraft, resolvedTheme),
    [appThemeDraft, resolvedTheme]
  )

  const activeGalleryThemePresetId =
    appThemeDraft.kind === "preset" ? appThemeDraft.id : "default"

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
    () =>
      activeProject?.sections.find(
        (section) => section.id === activeTab?.sectionId
      ) ?? null,
    [activeProject, activeTab?.sectionId]
  )

  const headerTabs = React.useMemo<HeaderTab[]>(() => {
    if (surfaceMode === "gallery") {
      return galleryViews.map((view) => ({
        id: view.id,
        isClosable: false,
        label: view.label,
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
      const firstSection = project.sections[0]
      const tab = firstSection
        ? createWorkspaceSectionTab({ project, section: firstSection })
        : null

      setProjects((currentProjects) => [...currentProjects, project])
      if (tab) {
        setOpenTabs((currentTabs) => [...currentTabs, tab])
        setActiveTabId(tab.id)
      }
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

  const handleOpenWorkspaceSection = React.useCallback(
    ({ projectId, sectionId }: { projectId: string; sectionId: string }) => {
      const tabId = getSectionTabId(sectionId)
      if (tabId !== activeTabId && guardWorkspaceDocumentNavigation()) {
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

        return [
          ...currentTabs,
          tab,
        ]
      })
      setActiveTabId(tabId)
      setSurfaceMode("workspace")
    },
    [activeTabId, guardWorkspaceDocumentNavigation, projects]
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

      setProjects((currentProjects) =>
        currentProjects.map((project) =>
          project.id === projectId ? renamedProject : project
        )
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
      setSurfaceMode("workspace")
      setWorkspaceActionError(null)
    },
    [guardWorkspaceStructureEdit]
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
      setOpenTabs((currentTabs) =>
        currentTabs.map((tab) =>
          tab.sectionId === sectionId
            ? { ...tab, label: renamedSection.title }
            : tab
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
      setWorkspaceActionError(null)
    },
    [guardWorkspaceStructureEdit]
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
      setSurfaceMode("workspace")
      setWorkspaceActionError(null)
    },
    [guardWorkspaceStructureEdit]
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
        if (!isGalleryViewId(tabId) || tabId === activeGalleryViewId) {
          return
        }

        if (activeGalleryViewId === "theme" && isGalleryThemeDirty) {
          setPendingGalleryViewId(tabId)
          setIsGalleryExitDialogOpen(true)
          return
        }

        setActiveGalleryViewId(tabId)
        return
      }

      setActiveTabId(tabId)
    },
    [
      activeGalleryViewId,
      activeTabId,
      guardWorkspaceDocumentNavigation,
      isGalleryThemeDirty,
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

  const handleReorderWorkspaceTabs = React.useCallback(
    (orderedTabIds: string[]) => {
      if (surfaceMode !== "workspace") {
        return
      }

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
    },
    [surfaceMode]
  )

  const handleEnterGalleryMode = React.useCallback(() => {
    if (guardWorkspaceDocumentNavigation()) {
      return
    }

    setAppThemeDraft(appliedAppThemeDraft)
    setIsGalleryExitDialogOpen(false)
    setPendingGalleryViewId(null)
    setActiveGalleryViewId("theme")
    setSurfaceMode("gallery")
  }, [appliedAppThemeDraft, guardWorkspaceDocumentNavigation])

  const handleExitGalleryMode = React.useCallback(() => {
    if (activeGalleryViewId === "theme" && isGalleryThemeDirty) {
      setPendingGalleryViewId(null)
      setIsGalleryExitDialogOpen(true)
      return
    }

    setAppThemeDraft(appliedAppThemeDraft)
    setSurfaceMode("workspace")
  }, [activeGalleryViewId, appliedAppThemeDraft, isGalleryThemeDirty])

  const handleCloseWindow = React.useCallback(() => {
    if (guardWorkspaceDocumentNavigation()) {
      return
    }

    void closeWindow()
  }, [guardWorkspaceDocumentNavigation])

  const handleApplyGalleryTheme = React.useCallback(() => {
    saveAppliedAppTheme(appThemeDraft)
    setAppliedAppThemeDraft(appThemeDraft)
  }, [appThemeDraft])

  const handleSaveAndExitGalleryMode = React.useCallback(() => {
    saveAppliedAppTheme(appThemeDraft)
    setAppliedAppThemeDraft(appThemeDraft)
    setIsGalleryExitDialogOpen(false)
    if (pendingGalleryViewId) {
      setActiveGalleryViewId(pendingGalleryViewId)
      setPendingGalleryViewId(null)
      return
    }

    setSurfaceMode("workspace")
  }, [appThemeDraft, pendingGalleryViewId])

  const handleDiscardAndExitGalleryMode = React.useCallback(() => {
    setAppThemeDraft(appliedAppThemeDraft)
    setIsGalleryExitDialogOpen(false)
    if (pendingGalleryViewId) {
      setActiveGalleryViewId(pendingGalleryViewId)
      setPendingGalleryViewId(null)
      return
    }

    setSurfaceMode("workspace")
  }, [appliedAppThemeDraft, pendingGalleryViewId])

  const handleSelectGalleryThemePreset = React.useCallback(
    (presetId: AppThemePresetId) => {
      const draft = createAppPresetThemeDraft(presetId)
      if (!draft) {
        return
      }

      setAppThemeDraft(draft)
    },
    []
  )

  const gallerySidebarHeaderContent =
    activeGalleryViewId === "theme" ? (
      <GalleryThemeSidebarHeader
        activePresetId={activeGalleryThemePresetId}
        activeSectionId={activeGalleryThemeEditorSectionId}
        onSelectSection={setActiveGalleryThemeEditorSectionId}
        onSelectPreset={handleSelectGalleryThemePreset}
        presets={appThemePresets}
      />
    ) : null

  const gallerySidebarContent =
    activeGalleryViewId === "theme" ? (
      <GalleryEditorPanel
        colorTokenValues={appColorTokenValues}
        cssVariables={appThemeCssVariables}
        onColorTokenValueChange={(
          token: AppColorTokenName,
          value: AppColorTokenValue
        ) =>
          setAppThemeDraft((current) =>
            updateAppThemeDraftColorTokenValue({
              draft: current,
              resolvedMode: resolvedTheme,
              token,
              value,
            })
          )
        }
        onCssVariableChange={(
          name: AppThemeEditableVariableName,
          value: string
        ) =>
          setAppThemeDraft((current) =>
            updateAppThemeDraftCssVariable({
              draft: current,
              name,
              resolvedMode: resolvedTheme,
              value,
            })
          )
        }
        onCssVariablesChange={(values) =>
          setAppThemeDraft((current) =>
            updateAppThemeDraftCssVariables({
              draft: current,
              resolvedMode: resolvedTheme,
              values,
            })
          )
        }
        sectionId={activeGalleryThemeEditorSectionId}
      />
    ) : (
      <GalleryMarketSidebar viewId={activeGalleryViewId} />
    )

  const gallerySidebarFooterContent =
    activeGalleryViewId === "theme" ? (
      <GalleryThemeSidebarFooter
        isDirty={isGalleryThemeDirty}
        onApply={handleApplyGalleryTheme}
      />
    ) : null

  const sidebar = (
    <AppSidebar
      activeProjectId={activeProject?.id ?? null}
      activeWorkspaceSectionId={activeWorkspaceSection?.id ?? ""}
      canCreateProject={workspaceCanWrite}
      galleryContent={gallerySidebarContent}
      galleryFooterContent={gallerySidebarFooterContent}
      galleryHeaderContent={gallerySidebarHeaderContent}
      mode={surfaceMode}
      onCreateProject={handleCreateProject}
      onCreateProjectSection={handleCreateProjectSection}
      onDeleteProject={handleDeleteProject}
      onDeleteProjectSection={handleDeleteProjectSection}
      onDuplicateProjectSection={handleDuplicateProjectSection}
      onEnterGalleryMode={handleEnterGalleryMode}
      onExitGalleryMode={handleExitGalleryMode}
      onOpenWorkspaceSection={handleOpenWorkspaceSection}
      onRenameProject={handleRenameProject}
      onRenameProjectSection={handleRenameProjectSection}
      projects={projects}
      workspaceActionError={workspaceActionError}
      workspaceCanEditStructure={workspaceCanWrite}
      workspaceHasUnsavedChanges={workspaceHasUnsavedChanges}
      variant="inset"
    />
  )

  const header = (
    <SiteHeader
      activeTabId={surfaceMode === "gallery" ? activeGalleryViewId : activeTabId}
      onCloseWindow={handleCloseWindow}
      onCloseTab={handleCloseTab}
      onReorderTabs={
        surfaceMode === "workspace" ? handleReorderWorkspaceTabs : undefined
      }
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
            <GalleryPanel activeViewId={activeGalleryViewId} />
          ) : workspaceLoadError ? (
            <WorkspaceLoadErrorState detail={workspaceLoadError} />
          ) : (
            <WorkspaceSurface
              activeProject={activeProject}
              activeSection={activeWorkspaceSection}
              canEditStructure={workspaceCanWrite}
              canSave={workspaceCanWrite}
              colorCssVariables={appliedAppThemeCssVariables}
              onCreateSection={handleCreateProjectSection}
              onDirtyChange={setWorkspaceHasUnsavedChanges}
              saveAttentionToken={workspaceSaveAttentionToken}
              workspaceActionError={workspaceActionError}
            />
          )}
        </SidebarInset>
      </main>
      <ConfirmationDialog
        open={isGalleryExitDialogOpen}
        onOpenChange={(open) => {
          setIsGalleryExitDialogOpen(open)
          if (!open) {
            setPendingGalleryViewId(null)
          }
        }}
        title="Save theme changes?"
        description="Your Gallery theme changes are only a draft until you save them."
        cancelLabel="Cancel"
        secondaryAction={{
          label: "Discard",
          onClick: handleDiscardAndExitGalleryMode,
          variant: "outline",
        }}
        primaryAction={{
          label: "Save",
          onClick: handleSaveAndExitGalleryMode,
        }}
      />
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
    <AppThemeScope themeDraft={appThemeDraft}>
      {framedAppSurface}
    </AppThemeScope>
  ) : (
    framedAppSurface
  )
}

export default App
