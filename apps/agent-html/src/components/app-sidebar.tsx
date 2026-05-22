import * as React from "react"

import { GallerySidebarPanels } from "@/components/gallery-view"
import type { GallerySection } from "@/components/gallery-view"
import { NavProjects } from "@/components/nav-projects"
import { SearchCommand } from "@/components/search-command"
import { FooterMenuStack } from "@/components/footer-menu-stack"
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
import { ArrowLeftIcon, BookImageIcon, PanelsTopLeftIcon, SparklesIcon, SwatchBookIcon } from "lucide-react"

type ProjectNavItem = {
  id: string
  name: string
  slug: string
}

const gallerySections: Array<{
  icon: React.ComponentType<React.ComponentProps<"svg">>
  id: GallerySection
  label: string
}> = [
  { id: "editor", label: "Editor", icon: SwatchBookIcon },
  { id: "notes", label: "Notes", icon: BookImageIcon },
  { id: "inspect", label: "Inspect", icon: PanelsTopLeftIcon },
]

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

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        {isGalleryMode ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onExitGalleryMode} type="button">
                <ArrowLeftIcon className="size-4" />
                <span>Back</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <SearchCommand onOpenProject={onOpenProject} projects={projects} />
        )}
      </SidebarHeader>
      <SidebarContent>
        {isGalleryMode ? (
          <div className="flex flex-1 flex-col gap-2">
            <SidebarMenu className="px-2 py-2">
            {gallerySections.map((section) => {
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
