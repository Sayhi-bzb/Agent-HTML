import * as React from "react"

import { WorkspacePetHost } from "@/app/pet/host/workspace-pet-host"
import { AppThemeScope } from "@/app/shared/app-theme/scope"
import { SidebarInset, SidebarProvider } from "@/app/shared/ui/sidebar"
import { AppSidebar } from "@/app/shell/app-sidebar"
import { ConfirmationDialog } from "@/app/shell/confirmation-dialog"
import { SiteHeader, type HeaderTab } from "@/app/shell/site-header"
import {
  WorkspaceLoadErrorState,
  WorkspaceSurface,
} from "@/app/workspace/surface"
import type { useGalleryController } from "@/app/gallery/controller"
import type { useWorkspaceController } from "@/app/workspace/controller"

type SurfaceMode = "gallery" | "workspace"

type AppFrameProps = {
  gallery: ReturnType<typeof useGalleryController>
  headerTabs: HeaderTab[]
  onCloseWindow: () => void
  onEnterGalleryMode: () => void
  onReorderWorkspaceTabs: ((orderedTabIds: string[]) => void) | undefined
  onSelectTab: (tabId: string) => void
  surfaceMode: SurfaceMode
  workspace: ReturnType<typeof useWorkspaceController>
}

export function AppFrame({
  gallery,
  headerTabs,
  onCloseWindow,
  onEnterGalleryMode,
  onReorderWorkspaceTabs,
  onSelectTab,
  surfaceMode,
  workspace,
}: AppFrameProps) {
  const header = (
    <SiteHeader
      activeTabId={
        surfaceMode === "gallery" ? gallery.activeViewId : workspace.activeTabId
      }
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
      mode={surfaceMode}
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
          {surfaceMode === "gallery" ? (
            gallery.panel
          ) : workspace.loadError ? (
            <WorkspaceLoadErrorState detail={workspace.loadError} />
          ) : (
            <WorkspaceSurface
              activeProject={workspace.activeProject}
              activeSection={workspace.activeSection}
              activeTabDraft={workspace.activeTabDraft}
              activeTabId={workspace.activeTabId}
              canEditStructure={workspace.canWrite}
              canSave={workspace.canWrite}
              colorCssVariables={gallery.appliedThemeCssVariables}
              onCreateSection={workspace.createProjectSection}
              onDraftChange={workspace.setDocumentDraft}
              onDirtyChange={workspace.setTabDirty}
              workspaceActionError={workspace.actionError}
            />
          )}
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
      {surface}
    </SidebarProvider>
  )

  return surfaceMode === "gallery" ? (
    <AppThemeScope themeDraft={gallery.themeDraft}>
      {framedSurface}
    </AppThemeScope>
  ) : (
    framedSurface
  )
}
