import * as React from "react"

import { GalleryEditorPanel, type GalleryRadiusValue } from "@/gallery/editor"
import type { GalleryEditorMode } from "@/gallery/types"
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

const galleryHeaderEditorItems = [
  "color",
  "typography",
  "other",
] as const

export function AppSidebar({
  mode = "workspace",
  onEnterGalleryMode,
  onExitGalleryMode,
  onDeleteProject,
  onDuplicateProject,
  onGalleryEditorModeChange,
  onOpenProject,
  onRadiusChange,
  onRenameProject,
  projects,
  galleryEditorMode = "color",
  galleryRadiusValue = "0.625rem",
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  galleryEditorMode?: GalleryEditorMode
  galleryRadiusValue?: GalleryRadiusValue
  mode?: "gallery" | "workspace"
  onEnterGalleryMode?: () => void
  onExitGalleryMode?: () => void
  onDeleteProject: (projectId: string) => void
  onDuplicateProject: (projectId: string) => void
  onGalleryEditorModeChange?: (mode: GalleryEditorMode) => void
  onOpenProject: (projectId: string) => void
  onRadiusChange?: (value: GalleryRadiusValue) => void
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
                      <span>{galleryEditorMode}</span>
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
                      {galleryHeaderEditorItems.map((item) => (
                        <SidebarMenuItem key={item}>
                          <SidebarMenuButton
                            className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
                            isActive={galleryEditorMode === item}
                            onClick={() => {
                              onGalleryEditorModeChange?.(item)
                              setIsEditorPopoverOpen(false)
                            }}
                            size="sm"
                            type="button"
                          >
                            <span>{item}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
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
            mode={galleryEditorMode}
            onRadiusChange={(value) => onRadiusChange?.(value)}
            radiusValue={galleryRadiusValue}
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
