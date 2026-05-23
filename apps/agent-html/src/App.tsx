import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import {
  AgentHtmlRuntimeTheme,
  parseAgentHtml,
  renderAgentHtml,
  validateAgentHtml,
} from "@/agent-html"
import {
  galleryColorTokenDefaults,
  type GalleryColorTokenName,
  type GalleryColorTokenValue,
} from "@/gallery/editor-panels"
import { galleryScenes } from "@/gallery/scenes"
import { GalleryPanel } from "@/gallery/panel"
import { galleryWorkspacePreviewBaseSceneId } from "@/gallery/preview-content"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  createWorkspaceProject,
  deleteWorkspaceProject,
  duplicateWorkspaceProject,
  getCurrentWorkspaceName,
  isFileSystemAccessSupported,
  loadWorkspaceProjects,
  openWorkspaceDirectory,
  readWorkspaceProjectDocument,
  renameWorkspaceProject,
} from "@/workspace/file-system-access-store"
import type {
  AgentHtmlProjectDocument,
  WorkspaceProject,
} from "@/workspace/types"

type ProjectTab = {
  id: string
  projectId: string
  label: string
  slug: string
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

type SurfaceMode = "gallery" | "workspace"
type HeaderTab = {
  id: string
  isClosable: boolean
  label: string
}
type WorkspaceStatus = "idle" | "loading" | "ready" | "unsupported" | "error"

function WorkspacePanel({
  activeDocument,
  activeProject,
  error,
  onCreateProject,
  onOpenWorkspace,
  status,
  workspaceName,
}: {
  activeDocument: AgentHtmlProjectDocument | null
  activeProject: WorkspaceProject | null
  error: string | null
  onCreateProject: () => void
  onOpenWorkspace: () => void
  status: WorkspaceStatus
  workspaceName: string | null
}) {
  const runtime = React.useMemo(() => {
    if (!activeDocument) {
      return null
    }

    const document = parseAgentHtml(activeDocument.source)
    const validation = validateAgentHtml(document)
    const renderedContent = validation.ok ? renderAgentHtml(document) : null

    return {
      htmlSource: renderedContent
        ? renderToStaticMarkup(renderedContent)
        : "",
      renderedContent,
      validation,
    }
  }, [activeDocument])

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex min-h-full flex-col p-4 md:p-6">
          {status === "unsupported" ? (
            <WorkspaceEmptyState
              actionLabel="Use a supported browser"
              description="This workspace needs the File System Access API to open local project folders."
              title="Local folders are not available"
            />
          ) : !workspaceName ? (
            <WorkspaceEmptyState
              actionLabel="Open Workspace"
              description="Choose a local folder. The app will manage agent-html projects under projects/*."
              onAction={onOpenWorkspace}
              title="Open an agent-html workspace"
            />
          ) : !activeProject ? (
            <WorkspaceEmptyState
              actionLabel="Create Project"
              description={`Workspace: ${workspaceName}`}
              onAction={onCreateProject}
              title="No project selected"
            />
          ) : error ? (
            <WorkspaceEmptyState
              actionLabel="Reload Workspace"
              description={error}
              onAction={onOpenWorkspace}
              title="Workspace error"
            />
          ) : runtime ? (
            <div className="grid min-h-full gap-4 xl:grid-cols-[1fr_24rem]">
              <section className="min-h-[32rem] overflow-hidden rounded-xl border bg-background shadow-sm">
                <AgentHtmlRuntimeTheme>
                  <div className="h-full overflow-auto p-5">
                    {runtime.renderedContent ? (
                      runtime.renderedContent
                    ) : (
                      <div className="flex flex-col gap-3">
                        {runtime.validation.errors.map((validationError) => (
                          <article
                            key={`${validationError.code}:${validationError.path}`}
                            className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive"
                          >
                            <p className="text-sm font-medium">
                              {validationError.code}
                            </p>
                            <p className="mt-1 text-sm">
                              {validationError.path} -{" "}
                              {validationError.message}
                            </p>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </AgentHtmlRuntimeTheme>
              </section>
              <aside className="rounded-xl border bg-background p-4 text-foreground shadow-sm">
                <p className="text-sm font-medium">{activeProject.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeProject.slug}/index.agent-html
                </p>
                <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Source
                  </p>
                  <pre className="mt-2 max-h-[26rem] overflow-auto text-xs leading-5 whitespace-pre-wrap">
                    {activeDocument?.source}
                  </pre>
                </div>
                {runtime.htmlSource ? (
                  <div className="mt-4 rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Rendered HTML
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {runtime.htmlSource.length.toLocaleString()} chars
                    </p>
                  </div>
                ) : null}
              </aside>
            </div>
          ) : (
            <WorkspaceEmptyState
              actionLabel="Reload Project"
              description="The active project is open, but its index.agent-html has not loaded yet."
              onAction={onOpenWorkspace}
              title="Loading project"
            />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function WorkspaceEmptyState({
  actionLabel,
  description,
  onAction,
  title,
}: {
  actionLabel: string
  description: string
  onAction?: () => void
  title: string
}) {
  return (
    <div className="flex min-h-[24rem] flex-1 items-center justify-center">
      <div className="w-full max-w-md rounded-xl border bg-background p-5 text-foreground shadow-sm">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        {onAction ? (
          <button
            className="mt-4 inline-flex h-8 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
            onClick={onAction}
            type="button"
          >
            {actionLabel}
          </button>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">{actionLabel}</p>
        )}
      </div>
    </div>
  )
}

export function App() {
  const [projects, setProjects] = React.useState<WorkspaceProject[]>([])
  const [openTabs, setOpenTabs] = React.useState<ProjectTab[]>([])
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null)
  const [surfaceMode, setSurfaceMode] = React.useState<SurfaceMode>("workspace")
  const [workspaceName, setWorkspaceName] = React.useState<string | null>(null)
  const [workspaceStatus, setWorkspaceStatus] =
    React.useState<WorkspaceStatus>("idle")
  const [workspaceError, setWorkspaceError] = React.useState<string | null>(null)
  const [activeDocument, setActiveDocument] =
    React.useState<AgentHtmlProjectDocument | null>(null)
  const [galleryColorTokenValues, setGalleryColorTokenValues] = React.useState(
    galleryColorTokenDefaults
  )
  const [activeGallerySceneId, setActiveGallerySceneId] = React.useState<string>(
    galleryScenes[0].id
  )

  const activeTab = React.useMemo(
    () => openTabs.find((tab) => tab.id === activeTabId) ?? null,
    [activeTabId, openTabs]
  )

  const activeProject = React.useMemo(
    () =>
      activeTab
        ? projects.find((project) => project.id === activeTab.projectId) ?? null
        : null,
    [activeTab]
  )

  React.useEffect(() => {
    if (!isFileSystemAccessSupported()) {
      setWorkspaceStatus("unsupported")
    }
  }, [])

  React.useEffect(() => {
    let isCurrent = true

    if (!activeProject) {
      setActiveDocument(null)
      return
    }

    setWorkspaceError(null)
    void readWorkspaceProjectDocument(activeProject)
      .then((document) => {
        if (isCurrent) {
          setActiveDocument(document)
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setActiveDocument(null)
          setWorkspaceError(
            error instanceof Error ? error.message : "Unable to load project."
          )
        }
      })

    return () => {
      isCurrent = false
    }
  }, [activeProject])

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
            projectId: project.id,
            label: project.name,
            slug: project.slug,
          },
        ]
      })
      setActiveTabId(tabId)
    },
    [projects]
  )

  const refreshProjects = React.useCallback(async () => {
    const nextProjects = await loadWorkspaceProjects()
    setProjects(nextProjects)
    setWorkspaceName(getCurrentWorkspaceName())
    setWorkspaceStatus("ready")
    return nextProjects
  }, [])

  const handleOpenWorkspace = React.useCallback(async () => {
    if (!isFileSystemAccessSupported()) {
      setWorkspaceStatus("unsupported")
      return
    }

    setWorkspaceStatus("loading")
    setWorkspaceError(null)

    try {
      const nextProjects = await openWorkspaceDirectory()
      setProjects(nextProjects)
      setWorkspaceName(getCurrentWorkspaceName())
      setWorkspaceStatus("ready")
      setOpenTabs([])
      setActiveTabId(null)
      setActiveDocument(null)
    } catch (error) {
      setWorkspaceStatus("error")
      setWorkspaceError(
        error instanceof Error ? error.message : "Unable to open workspace."
      )
    }
  }, [])

  const handleCreateProject = React.useCallback(async () => {
    const projectName = `Project ${projects.length + 1}`

    try {
      const project = await createWorkspaceProject(projectName)
      const nextProjects = await refreshProjects()
      setProjects(nextProjects)
      handleOpenProject(project.id)
    } catch (error) {
      setWorkspaceError(
        error instanceof Error ? error.message : "Unable to create project."
      )
    }
  }, [handleOpenProject, projects.length, refreshProjects])

  const handleRenameProject = React.useCallback(async (projectId: string, name: string) => {
    const nextName = name.trim()
    if (!nextName) {
      return
    }

    try {
      const project = await renameWorkspaceProject(projectId, nextName)
      setProjects((currentProjects) =>
        currentProjects.map((currentProject) =>
          currentProject.id === projectId ? project : currentProject
        )
      )
      setOpenTabs((currentTabs) =>
        currentTabs.map((tab) =>
          tab.projectId === projectId ? { ...tab, label: project.name } : tab
        )
      )
    } catch (error) {
      setWorkspaceError(
        error instanceof Error ? error.message : "Unable to rename project."
      )
    }
  }, [])

  const handleDuplicateProject = React.useCallback(
    async (projectId: string) => {
      try {
        const duplicateProject = await duplicateWorkspaceProject(projectId)
      const duplicateTabId = `project:${duplicateProject.id}`

        await refreshProjects()
      setOpenTabs((currentTabs) => [
        ...currentTabs,
        {
          id: duplicateTabId,
          projectId: duplicateProject.id,
          label: duplicateProject.name,
          slug: duplicateProject.slug,
        },
      ])
      setActiveTabId(duplicateTabId)
      } catch (error) {
        setWorkspaceError(
          error instanceof Error ? error.message : "Unable to duplicate project."
        )
      }
    },
    [refreshProjects]
  )

  const handleDeleteProject = React.useCallback(async (projectId: string) => {
    try {
      await deleteWorkspaceProject(projectId)
      await refreshProjects()
    setOpenTabs((currentTabs) => {
      const removedTabIds = new Set(
        currentTabs
          .filter((tab) => tab.projectId === projectId)
          .map((tab) => tab.id)
      )

      if (removedTabIds.size === 0) {
        return currentTabs
      }

      const nextTabs = currentTabs.filter((tab) => tab.projectId !== projectId)

      setActiveTabId((currentActiveTabId) =>
        getNextActiveTabId(currentTabs, removedTabIds, currentActiveTabId)
      )

      return nextTabs
    })
    } catch (error) {
      setWorkspaceError(
        error instanceof Error ? error.message : "Unable to delete project."
      )
    }
  }, [refreshProjects])

  const handleSelectTab = React.useCallback(
    (tabId: string) => {
      if (surfaceMode === "gallery") {
        const nextSceneId = galleryScenes.some((scene) => scene.id === tabId)
          ? tabId
          : galleryWorkspacePreviewBaseSceneId

        setActiveGallerySceneId(nextSceneId)
        return
      }

      setActiveTabId(tabId)
    },
    [surfaceMode]
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

  return (
    <SidebarProvider
      className="h-svh min-h-svh flex-col overflow-hidden"
      style={
        {
          "--header-height": "2.5rem",
        } as React.CSSProperties
      }
    >
      <SiteHeader
        activeTabId={surfaceMode === "gallery" ? activeGallerySceneId : activeTabId}
        onCloseTab={handleCloseTab}
        onSelectTab={handleSelectTab}
        tabs={headerTabs}
      />
      <main className="flex min-h-0 flex-1 overflow-hidden">
        <AppSidebar
          galleryColorTokenValues={galleryColorTokenValues}
          mode={surfaceMode}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onDuplicateProject={handleDuplicateProject}
          onEnterGalleryMode={handleEnterGalleryMode}
          onExitGalleryMode={handleExitGalleryMode}
          onGalleryColorTokenValueChange={(
            token: GalleryColorTokenName,
            value: GalleryColorTokenValue
          ) =>
            setGalleryColorTokenValues((current) => ({
              ...current,
              [token]: value,
            }))
          }
          onOpenProject={handleOpenProject}
          onOpenWorkspace={handleOpenWorkspace}
          onRenameProject={handleRenameProject}
          projects={projects}
          variant="inset"
          workspaceName={workspaceName}
        />
        <SidebarInset className="min-h-0 overflow-hidden border-0 shadow-sm md:mr-2 md:mb-2">
          {surfaceMode === "gallery" ? (
            <GalleryPanel
              colorTokenValues={galleryColorTokenValues}
              scene={galleryDisplayScene}
            />
          ) : (
            <WorkspacePanel
              activeDocument={activeDocument}
              activeProject={activeProject}
              error={workspaceError}
              onCreateProject={handleCreateProject}
              onOpenWorkspace={handleOpenWorkspace}
              status={workspaceStatus}
              workspaceName={workspaceName}
            />
          )}
        </SidebarInset>
      </main>
    </SidebarProvider>
  )
}

export default App
