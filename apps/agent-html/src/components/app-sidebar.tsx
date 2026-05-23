import * as React from "react"

import { GalleryEditorPanel } from "@/gallery/editor"
import type {
  GalleryColorTokenName,
  GalleryColorTokenValue,
  GalleryColorTokenValues,
} from "@/gallery/editor-panels"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FooterMenuStack } from "@/components/footer-menu-stack"
import { NavProjects } from "@/components/nav-projects"
import { SearchCommand } from "@/components/search-command"
import { SettingsMenu } from "@/components/settings-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ArrowLeftIcon, ChevronRightIcon, SparklesIcon } from "lucide-react"

type ProjectNavItem = {
  id: string
  name: string
  slug: string
}

export function AppSidebar({
  galleryColorTokenValues,
  mode = "workspace",
  onEnterGalleryMode,
  onExitGalleryMode,
  onDeleteProject,
  onDuplicateProject,
  onGalleryColorTokenValueChange,
  onOpenProject,
  onRenameProject,
  projects,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  galleryColorTokenValues: GalleryColorTokenValues
  mode?: "gallery" | "workspace"
  onEnterGalleryMode?: () => void
  onExitGalleryMode?: () => void
  onDeleteProject: (projectId: string) => void
  onDuplicateProject: (projectId: string) => void
  onGalleryColorTokenValueChange: (
    token: GalleryColorTokenName,
    value: GalleryColorTokenValue
  ) => void
  onOpenProject: (projectId: string) => void
  onRenameProject: (projectId: string, name: string) => void
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
          <GalleryEditorPanel
            colorTokenValues={galleryColorTokenValues}
            onColorTokenValueChange={onGalleryColorTokenValueChange}
          />
        ) : (
          <NavProjects
            onDeleteProject={onDeleteProject}
            onDuplicateProject={onDuplicateProject}
            onOpenProject={onOpenProject}
            onRenameProject={onRenameProject}
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
