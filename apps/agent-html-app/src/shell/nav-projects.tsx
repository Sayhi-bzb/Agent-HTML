"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/shared/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/shared/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/shared/ui/sidebar"
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

import type { WorkspaceSection } from "@/app/workspace/types"

type ProjectNavItem = {
  id: string
  name: string
  sections: WorkspaceSection[]
}

function ProjectActionMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Project actions"
          className="absolute top-1.5 right-1 flex size-5 items-center justify-center rounded-md p-0 text-sidebar-foreground opacity-0 outline-hidden transition-opacity after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring group-focus-within/project-row:opacity-100 group-hover/project-row:opacity-100 aria-expanded:opacity-100 md:after:hidden [&_svg]:size-4 [&_svg]:shrink-0"
          type="button"
        >
          <MoreHorizontalIcon />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6}>
        <DropdownMenuItem disabled>Rename</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled variant="destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SectionActionMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction
          aria-label="Section actions"
          showOnHover
          type="button"
        >
          <MoreHorizontalIcon />
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6}>
        <DropdownMenuItem disabled>Duplicate</DropdownMenuItem>
        <DropdownMenuItem disabled>Rename</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled variant="destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function NavProjects({
  activeProjectId,
  activeSectionId,
  onOpenProject,
  onSectionSelect,
  projects,
}: {
  activeProjectId: string | null
  activeSectionId: string
  onOpenProject: (projectId: string) => void
  onSectionSelect: (sectionId: string) => void
  projects: ProjectNavItem[]
}) {
  return (
    <div className="group-data-[collapsible=icon]:hidden">
      {projects.map((project) => (
        <Collapsible
          key={project.id}
          className="group/collapsible"
          defaultOpen
        >
          <SidebarGroup>
            <SidebarGroupLabel
              className="group/project-row relative gap-0 pr-8 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2 outline-none">
                <ChevronRightIcon className="size-4 shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                <span className="truncate">{project.name}</span>
              </CollapsibleTrigger>
              <ProjectActionMenu />
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {project.sections.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={
                          activeProjectId === project.id &&
                          activeSectionId === item.id
                        }
                        onClick={() => {
                          onOpenProject(project.id)
                          onSectionSelect(item.id)
                        }}
                        type="button"
                      >
                        <span className="ml-6 truncate">{item.title}</span>
                      </SidebarMenuButton>
                      <SectionActionMenu />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      ))}
    </div>
  )
}
