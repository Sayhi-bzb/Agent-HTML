import * as React from "react"

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

type Project = {
  id: string
  name: string
  slug: string
}

type ProjectTab = {
  id: string
  projectId: string
  label: string
  slug: string
}

const initialProjects: Project[] = [
  {
    id: "design-engineering",
    name: "Design Engineering",
    slug: "design-engineering",
  },
  {
    id: "sales-marketing",
    name: "Sales & Marketing",
    slug: "sales-marketing",
  },
  {
    id: "travel",
    name: "Travel",
    slug: "travel",
  },
]

function slugifyProjectName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function createDuplicateProject(source: Project, projects: Project[]): Project {
  const baseName = `${source.name} Copy`
  let nextName = baseName
  let nextSlug = slugifyProjectName(nextName)
  let suffix = 2

  while (
    projects.some(
      (project) => project.id === nextSlug || project.slug === nextSlug
    )
  ) {
    nextName = `${baseName} ${suffix}`
    nextSlug = slugifyProjectName(nextName)
    suffix += 1
  }

  return {
    id: nextSlug,
    name: nextName,
    slug: nextSlug,
  }
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

const stats = [
  { label: "Active agents", value: "12", detail: "+2 this week" },
  { label: "Artifacts built", value: "48", detail: "7 pending review" },
  { label: "Failed checks", value: "03", detail: "Needs triage" },
]

const activity = [
  {
    title: "Sidebar template attached",
    summary: "Main shell now uses the shadcn sidebar provider and header.",
    time: "Just now",
  },
  {
    title: "Workspace status",
    summary: "Template components are wired and ready for page-specific content.",
    time: "Ready",
  },
  {
    title: "Next step",
    summary: "Replace placeholder cards with real module data or routes.",
    time: "Open",
  },
]

type SurfaceMode = "gallery" | "workspace"
type HeaderTab = {
  id: string
  isClosable: boolean
  label: string
}

function WorkspacePanel({ activeProject: _activeProject }: { activeProject: Project | null }) {
  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex min-h-full flex-col gap-6 p-4 md:p-6">
          <section className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-xl border bg-background p-5 text-foreground shadow-sm"
              >
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.detail}
                </p>
              </article>
            ))}
          </section>

          <section className="grid flex-1 gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            <article className="rounded-xl border bg-background text-foreground shadow-sm">
              <div className="grid gap-4 p-5 md:grid-cols-2">
                <div className="rounded-lg border border-dashed p-4">
                  <p className="text-sm font-medium">Primary content area</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Put your routed page, dashboard widgets, or editor here.
                  </p>
                </div>
                <div className="rounded-lg border border-dashed p-4">
                  <p className="text-sm font-medium">Responsive behavior</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    On mobile, the sidebar switches to a sheet automatically.
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-xl border bg-background text-foreground shadow-sm">
              <div className="border-b px-5 py-4">
                <p className="text-sm font-medium">Recent activity</p>
              </div>
              <div className="flex flex-col gap-3 p-5">
                {activity.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-lg border border-dashed p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{item.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {item.time}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.summary}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
      </ScrollArea>
    </div>
  )
}

export function App() {
  const [projects, setProjects] = React.useState<Project[]>(initialProjects)
  const [openTabs, setOpenTabs] = React.useState<ProjectTab[]>([])
  const [activeTabId, setActiveTabId] = React.useState<string | null>(null)
  const [surfaceMode, setSurfaceMode] = React.useState<SurfaceMode>("workspace")
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

  const handleRenameProject = React.useCallback((projectId: string, name: string) => {
    const nextName = name.trim()
    if (!nextName) {
      return
    }

    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === projectId ? { ...project, name: nextName } : project
      )
    )
    setOpenTabs((currentTabs) =>
      currentTabs.map((tab) =>
        tab.projectId === projectId ? { ...tab, label: nextName } : tab
      )
    )
  }, [])

  const handleDuplicateProject = React.useCallback(
    (projectId: string) => {
      const sourceProject = projects.find((project) => project.id === projectId)
      if (!sourceProject) {
        return
      }

      const duplicateProject = createDuplicateProject(sourceProject, projects)
      const duplicateTabId = `project:${duplicateProject.id}`

      setProjects((currentProjects) => [...currentProjects, duplicateProject])
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
    },
    [projects]
  )

  const handleDeleteProject = React.useCallback((projectId: string) => {
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== projectId)
    )
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
  }, [])

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
          onRenameProject={handleRenameProject}
          projects={projects}
          variant="inset"
        />
        <SidebarInset className="min-h-0 overflow-hidden border-0 shadow-sm md:mr-2 md:mb-2">
          {surfaceMode === "gallery" ? (
            <GalleryPanel
              colorTokenValues={galleryColorTokenValues}
              scene={galleryDisplayScene}
            />
          ) : (
            <WorkspacePanel activeProject={activeProject} />
          )}
        </SidebarInset>
      </main>
    </SidebarProvider>
  )
}

export default App
