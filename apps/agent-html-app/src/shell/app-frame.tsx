import * as React from "react"

import { WorkspacePetHost } from "@/app/pet/host/workspace-pet-host"
import { SidebarInset, SidebarProvider } from "@/app/shared/ui/sidebar"
import { WindowChromeFrame } from "@/app/shared/ui/window-chrome"
import { Skeleton } from "@/app/shared/ui/skeleton"
import { AppSidebar } from "@/app/shell/app-sidebar"
import { ConfirmationDialog } from "@/app/shell/confirmation-dialog"
import { SiteHeader, type HeaderTab } from "@/app/shell/site-header"
import type { GalleryController } from "@/app/gallery/controller-types"
import {
  WorkspaceLoadErrorState,
  WorkspaceSurface,
} from "@/app/workspace/surface"
import type { useWorkspaceController } from "@/app/workspace/controller"
import type { AgentHtmlColorCssVariables } from "@/agent-html"

type SurfaceMode = "gallery" | "workspace"

type AppFrameProps = {
  activeThemeCssVariables: AgentHtmlColorCssVariables
  gallery: GalleryController
  headerTabs: HeaderTab[]
  onCloseWindow: () => void
  onEnterGalleryMode: () => void
  onReorderWorkspaceTabs: ((orderedTabIds: string[]) => void) | undefined
  onSelectTab: (tabId: string) => void
  surfaceMode: SurfaceMode
  workspace: ReturnType<typeof useWorkspaceController>
}

export function AppFrame({
  activeThemeCssVariables,
  gallery,
  headerTabs,
  onCloseWindow,
  onEnterGalleryMode,
  onReorderWorkspaceTabs,
  onSelectTab,
  surfaceMode,
  workspace,
}: AppFrameProps) {
  const isGalleryMode = surfaceMode === "gallery"
  const activeThemeStyle = activeThemeCssVariables as React.CSSProperties
  const header = (
    <SiteHeader
      activeTabId={isGalleryMode ? gallery.activeViewId : workspace.activeTabId}
      onCloseWindow={onCloseWindow}
      onCloseTab={workspace.closeTab}
      onReorderTabs={onReorderWorkspaceTabs}
      onSelectTab={onSelectTab}
      tabs={headerTabs}
    />
  )

  const sidebar = (
    <AppSidebar
      activeProjectId={workspace.activeProject?.id ?? null}
      activeWorkspaceSectionId={workspace.activeSection?.id ?? ""}
      canCreateProject={workspace.canWrite}
      galleryContent={gallery.sidebarContent}
      galleryFooterContent={gallery.sidebarFooterContent}
      galleryHeaderContent={gallery.sidebarHeaderContent}
      mode={isGalleryMode ? "gallery" : "workspace"}
      onCreateProject={workspace.createProject}
      onCreateProjectSection={workspace.createProjectSection}
      onDeleteProject={workspace.deleteProject}
      onDeleteProjectSection={workspace.deleteProjectSection}
      onDuplicateProjectSection={workspace.duplicateProjectSection}
      onEnterGalleryMode={onEnterGalleryMode}
      onExitGalleryMode={gallery.requestExitGallery}
      onOpenWorkspaceSection={workspace.openSection}
      onRenameProject={workspace.renameProject}
      onRenameProjectSection={workspace.renameProjectSection}
      projects={workspace.projects}
      workspaceActionError={workspace.actionError}
      workspaceCanEditStructure={workspace.canWrite}
      variant="inset"
    />
  )

  const surface = (
    <>
      {header}
      <main className="flex min-h-0 flex-1 overflow-hidden">
        {sidebar}
        <SidebarInset className="min-h-0 overflow-hidden border-0 shadow-none md:mr-2 md:mb-2 md:peer-data-[variant=inset]:shadow-none">
          <div
            aria-hidden={isGalleryMode ? true : undefined}
            className={isGalleryMode ? "hidden" : "flex min-h-0 flex-1"}
          >
            {workspace.loadError ? (
              <WorkspaceLoadErrorState detail={workspace.loadError} />
            ) : workspace.isLoadingWorkspace ? (
              <AppWorkspaceStartupSkeleton />
            ) : (
              <WorkspaceSurface
                activeProject={workspace.activeProject}
                activeSection={workspace.activeSection}
                activeTabDraft={workspace.activeTabDraft}
                activeTabId={workspace.activeTabId}
                canEditStructure={workspace.canWrite}
                canSave={workspace.canWrite}
                colorCssVariables={activeThemeCssVariables}
                onCreateSection={workspace.createProjectSection}
                onDraftChange={workspace.setDocumentDraft}
                onDirtyChange={workspace.setTabDirty}
                workspaceActionError={workspace.actionError}
              />
            )}
          </div>
          {isGalleryMode ? gallery.panel : null}
        </SidebarInset>
      </main>
      <ConfirmationDialog
        open={gallery.themeExitDialog.isOpen}
        onOpenChange={gallery.themeExitDialog.onOpenChange}
        title="Save theme changes?"
        description="Your Gallery theme changes are only a draft until you save them."
        cancelLabel="Cancel"
        secondaryAction={{
          label: "Discard",
          onClick: gallery.themeExitDialog.onDiscard,
          variant: "outline",
        }}
        primaryAction={{
          label: "Save",
          onClick: gallery.themeExitDialog.onSave,
        }}
      />
      <ConfirmationDialog
        open={workspace.pendingUnsavedAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            workspace.cancelPendingUnsavedAction()
          }
        }}
        title="Save workspace changes?"
        description={
          workspace.actionError ??
          "Your workspace document changes are only stored in this app session until you save them."
        }
        cancelLabel="Cancel"
        secondaryAction={{
          label: "Discard",
          onClick: (event) => {
            event.preventDefault()
            workspace.discardPendingUnsavedAction()
          },
          variant: "outline",
        }}
        primaryAction={{
          label: "Save",
          onClick: (event) => {
            event.preventDefault()
            void workspace.savePendingUnsavedAction()
          },
        }}
      />
      <WorkspacePetHost />
    </>
  )

  const framedSurface = (
    <WindowChromeFrame style={activeThemeStyle}>
      <SidebarProvider
        className="min-h-0 flex-1 flex-col overflow-hidden"
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
        {surface}
      </SidebarProvider>
    </WindowChromeFrame>
  )

  return framedSurface
}

function AppWorkspaceStartupSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-4 md:p-6" data-selection="none">
      <div className="flex min-h-0 flex-1 flex-col rounded-xl border bg-background p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-44 max-w-full" />
            <Skeleton className="h-3 w-72 max-w-full" />
          </div>
          <div className="flex shrink-0 gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="mt-6 grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="space-y-4">
            <Skeleton className="h-28 rounded-lg" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-11/12" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
