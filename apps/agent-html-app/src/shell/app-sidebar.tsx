import * as React from "react"

import { FooterMenuStack } from "@/app/shell/footer-menu-stack"
import { NavProjects } from "@/app/shell/nav-projects"
import { NewProjectDialog } from "@/app/shell/new-project-dialog"
import { SearchCommand } from "@/app/shell/search-command"
import { SettingsMenu } from "@/app/shell/settings-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/shared/ui/sidebar"
import type { WorkspaceSection } from "@/app/workspace/types"
import { ArrowLeftIcon, SparklesIcon } from "lucide-react"

type ProjectNavItem = {
  id: string
  name: string
  sections: WorkspaceSection[]
  slug: string
}

export function AppSidebar({
  activeProjectId,
  activeWorkspaceSectionId,
  canCreateProject,
  galleryContent,
  galleryFooterContent,
  galleryHeaderContent,
  mode = "workspace",
  onCreateProject,
  onCreateProjectSection,
  onDeleteProject,
  onDeleteProjectSection,
  onDuplicateProjectSection,
  onEnterGalleryMode,
  onExitGalleryMode,
  onOpenWorkspaceSection,
  onRenameProject,
  onRenameProjectSection,
  projects,
  workspaceActionError,
  workspaceCanEditStructure,
  workspaceHasUnsavedChanges,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activeProjectId: string | null
  activeWorkspaceSectionId: string
  canCreateProject: boolean
  galleryContent: React.ReactNode
  galleryFooterContent?: React.ReactNode
  galleryHeaderContent?: React.ReactNode
  mode?: "gallery" | "workspace"
  onCreateProject: (input: { name: string }) => Promise<void>
  onCreateProjectSection: (input: {
    projectId: string
    title: string
  }) => Promise<void>
  onDeleteProject: (input: { projectId: string }) => Promise<void>
  onDeleteProjectSection: (input: {
    projectId: string
    sectionId: string
  }) => Promise<void>
  onDuplicateProjectSection: (input: {
    projectId: string
    sectionId: string
  }) => Promise<void>
  onEnterGalleryMode?: () => void
  onExitGalleryMode?: () => void
  onOpenWorkspaceSection: (input: {
    projectId: string
    sectionId: string
  }) => void
  onRenameProject: (input: {
    name: string
    projectId: string
  }) => Promise<void>
  onRenameProjectSection: (input: {
    projectId: string
    sectionId: string
    title: string
  }) => Promise<void>
  projects: ProjectNavItem[]
  workspaceActionError: string | null
  workspaceCanEditStructure: boolean
  workspaceHasUnsavedChanges: boolean
}) {
  const isGalleryMode = mode === "gallery"

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        {isGalleryMode ? (
          <>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onExitGalleryMode} type="button">
                  <ArrowLeftIcon className="size-4" />
                  <span>Back</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            {galleryHeaderContent}
          </>
        ) : (
          <>
            <SearchCommand
              onOpenWorkspaceSection={onOpenWorkspaceSection}
              projects={projects}
            />
            <NewProjectDialog
              canCreate={canCreateProject}
              onCreateProject={onCreateProject}
            />
          </>
        )}
      </SidebarHeader>
      <SidebarContent>
        {isGalleryMode ? (
          galleryContent
        ) : (
          <NavProjects
            activeProjectId={activeProjectId}
            activeSectionId={activeWorkspaceSectionId}
            canEditStructure={workspaceCanEditStructure}
            hasUnsavedChanges={workspaceHasUnsavedChanges}
            onCreateProjectSection={onCreateProjectSection}
            onDeleteProject={onDeleteProject}
            onDeleteProjectSection={onDeleteProjectSection}
            onDuplicateProjectSection={onDuplicateProjectSection}
            onOpenWorkspaceSection={onOpenWorkspaceSection}
            onRenameProject={onRenameProject}
            onRenameProjectSection={onRenameProjectSection}
            projects={projects}
            workspaceActionError={workspaceActionError}
          />
        )}
      </SidebarContent>
      <SidebarFooter>
        {isGalleryMode ? (
          galleryFooterContent
        ) : (
          <FooterMenuStack>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onEnterGalleryMode} type="button">
                <SparklesIcon className="size-4" />
                <span>Gallery</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SettingsMenu />
          </FooterMenuStack>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
