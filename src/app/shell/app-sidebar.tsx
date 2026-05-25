import * as React from "react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/shared/ui/popover"
import { FooterMenuStack } from "@/app/shell/footer-menu-stack"
import { NavProjects } from "@/app/shell/nav-projects"
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
import { ArrowLeftIcon, ChevronRightIcon, SparklesIcon } from "lucide-react"

type ProjectNavItem = {
  id: string
  name: string
  slug: string
}

export function AppSidebar({
  activeProjectId,
  activeWorkspaceSectionId,
  galleryContent,
  mode = "workspace",
  onEnterGalleryMode,
  onExitGalleryMode,
  onOpenProject,
  onWorkspaceSectionSelect,
  projects,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  activeProjectId: string | null
  activeWorkspaceSectionId: string
  galleryContent: React.ReactNode
  mode?: "gallery" | "workspace"
  onEnterGalleryMode?: () => void
  onExitGalleryMode?: () => void
  onOpenProject: (projectId: string) => void
  onWorkspaceSectionSelect: (sectionId: string) => void
  projects: ProjectNavItem[]
}) {
  const isGalleryMode = mode === "gallery"
  const [isEditorPopoverOpen, setIsEditorPopoverOpen] = React.useState(false)

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
                <Popover
                  onOpenChange={setIsEditorPopoverOpen}
                  open={isEditorPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <SidebarMenuButton
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      type="button"
                    >
                      <span>color</span>
                      <ChevronRightIcon
                        className={
                          "ml-auto transition-transform " +
                          (isEditorPopoverOpen ? "rotate-90" : "")
                        }
                      />
                    </SidebarMenuButton>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    className="w-[var(--radix-popover-trigger-width)] min-w-0"
                    side="bottom"
                    sideOffset={6}
                  >
                    <SidebarMenu className="gap-0">
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
                          isActive
                          onClick={() => setIsEditorPopoverOpen(false)}
                          size="sm"
                          type="button"
                        >
                          <span>color</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </PopoverContent>
                </Popover>
              </SidebarMenuItem>
            </SidebarMenu>
          </>
        ) : (
          <SearchCommand onOpenProject={onOpenProject} projects={projects} />
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
        {isGalleryMode ? null : (
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
