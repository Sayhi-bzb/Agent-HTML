import * as React from "react"

import { galleryEditorSections } from "@/gallery/editor-panels"
import type { GallerySection } from "@/gallery/types"
import { GallerySidebarPanels } from "@/components/gallery-view"
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
  "spacing",
  "radius",
  "shadows",
] as const

export function AppSidebar({
  mode = "workspace",
  onEnterGalleryMode,
  onExitGalleryMode,
  onDeleteProject,
  onDuplicateProject,
  onSelectGallerySection,
  onOpenProject,
  onRenameProject,
  projects,
  gallerySection = "editor",
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  mode?: "gallery" | "workspace"
  onEnterGalleryMode?: () => void
  onExitGalleryMode?: () => void
  onDeleteProject: (projectId: string) => void
  onDuplicateProject: (projectId: string) => void
  onSelectGallerySection?: (section: GallerySection) => void
  onOpenProject: (projectId: string) => void
  onRenameProject: (projectId: string, name: string) => void
  projects: ProjectNavItem[]
  gallerySection?: GallerySection
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
                      <span>Editor</span>
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
                          <button
                            className="flex h-8 w-full items-center rounded-lg px-2 text-left text-sm text-muted-foreground outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                            type="button"
                          >
                            <span className="capitalize">{item}</span>
                          </button>
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
          <div className="flex flex-1 flex-col gap-2">
            <SidebarMenu className="px-2 py-2">
            {galleryEditorSections.map((section) => {
              const Icon = section.icon

              return (
                <SidebarMenuItem key={section.id}>
                  <SidebarMenuButton
                    isActive={gallerySection === section.id}
                    onClick={() => onSelectGallerySection?.(section.id)}
                    type="button"
                  >
                    <Icon className="size-4" />
                    <span>{section.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
            </SidebarMenu>
            <GallerySidebarPanels section={gallerySection} />
          </div>
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
        {isGalleryMode ? (
          <div className="rounded-lg border border-dashed px-3 py-2 text-sm text-sidebar-foreground/70">
            Gallery editor shell
          </div>
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
