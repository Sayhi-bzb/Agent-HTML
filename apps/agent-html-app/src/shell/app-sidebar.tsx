import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/shared/ui/dropdown-menu"
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
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronRightIcon,
  SparklesIcon,
} from "lucide-react"
import type { GalleryThemePresetId } from "@/app/gallery/editor-panels"

type ProjectNavItem = {
  id: string
  name: string
  sections: WorkspaceSection[]
  slug: string
}

type GalleryThemePresetNavItem = {
  id: GalleryThemePresetId
  label: string
}

export function AppSidebar({
  activeGalleryThemePresetId,
  activeProjectId,
  activeWorkspaceSectionId,
  galleryContent,
  galleryThemePresets,
  isGalleryThemeDirty = false,
  mode = "workspace",
  onApplyGalleryTheme,
  onEnterGalleryMode,
  onExitGalleryMode,
  onOpenProject,
  onSelectGalleryThemePreset,
  onWorkspaceSectionSelect,
  projects,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activeGalleryThemePresetId?: GalleryThemePresetId
  activeProjectId: string | null
  activeWorkspaceSectionId: string
  galleryContent: React.ReactNode
  galleryThemePresets?: readonly GalleryThemePresetNavItem[]
  isGalleryThemeDirty?: boolean
  mode?: "gallery" | "workspace"
  onApplyGalleryTheme?: () => void
  onEnterGalleryMode?: () => void
  onExitGalleryMode?: () => void
  onOpenProject: (projectId: string) => void
  onSelectGalleryThemePreset?: (presetId: GalleryThemePresetId) => void
  onWorkspaceSectionSelect: (sectionId: string) => void
  projects: ProjectNavItem[]
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

            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      className="group/trigger data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      type="button"
                    >
                      <span>theme</span>
                      <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/trigger:rotate-90" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0"
                    side="bottom"
                    sideOffset={6}
                  >
                    {(galleryThemePresets ?? []).map((preset) => (
                      <DropdownMenuItem
                        key={preset.id}
                        onSelect={() => onSelectGalleryThemePreset?.(preset.id)}
                      >
                        <span>{preset.label}</span>
                        {preset.id === activeGalleryThemePresetId ? (
                          <CheckIcon className="ml-auto size-4" />
                        ) : null}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      className="group/trigger data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      type="button"
                    >
                      <span>color</span>
                      <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/trigger:rotate-90" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-0"
                    side="bottom"
                    sideOffset={6}
                  >
                    <DropdownMenuItem>
                      <span>color</span>
                      <CheckIcon className="ml-auto size-4" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </>
        ) : (
          <>
            <SearchCommand onOpenProject={onOpenProject} projects={projects} />
            <NewProjectDialog />
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
            onOpenProject={onOpenProject}
            onSectionSelect={onWorkspaceSectionSelect}
            projects={projects}
          />
        )}
      </SidebarContent>
      <SidebarFooter>
        {isGalleryMode ? (
          <FooterMenuStack>
            <SidebarMenuItem>
              <SidebarMenuButton
                disabled={!isGalleryThemeDirty}
                onClick={onApplyGalleryTheme}
                type="button"
              >
                <CheckIcon className="size-4" />
                <span>{isGalleryThemeDirty ? "Apply" : "Applied"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </FooterMenuStack>
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
