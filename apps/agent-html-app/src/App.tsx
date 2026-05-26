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
import { SidebarInset, SidebarProvider } from "@/app/shared/ui/sidebar"
import { createWorkspaceRepository } from "@/app/workspace/repository"
import { defaultWorkspaceSectionId } from "@/app/workspace/seed"
import {
  WorkspaceLoadErrorState,
  WorkspaceSurface,
} from "@/app/workspace/surface"
import type {
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

  const handleOpenProject = React.useCallback(
    (projectId: string) => {
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
    [projects]
  )

  const handleSelectWorkspaceSection = React.useCallback(
    (sectionId: string) => {
      setActiveWorkspaceSectionId(sectionId)
    },
    []
  )

  const handleSelectTab = React.useCallback(
    (tabId: string) => {
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
    [openTabs, projects, surfaceMode]
  )

  const handleCloseTab = React.useCallback((tabId: string) => {
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
  }, [])

  const handleEnterGalleryMode = React.useCallback(() => {
    setSurfaceMode("gallery")
  }, [])

  const handleExitGalleryMode = React.useCallback(() => {
    setSurfaceMode("workspace")
  }, [])

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
      onEnterGalleryMode={handleEnterGalleryMode}
      onExitGalleryMode={handleExitGalleryMode}
      onOpenProject={handleOpenProject}
      onSelectGalleryThemePreset={handleSelectGalleryThemePreset}
      onWorkspaceSectionSelect={handleSelectWorkspaceSection}
      projects={projects}
      variant="inset"
    />
  )

  const header = (
    <SiteHeader
      activeTabId={surfaceMode === "gallery" ? activeGallerySceneId : activeTabId}
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
