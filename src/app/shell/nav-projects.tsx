"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/shared/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/shared/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"

import type { WorkspaceSection } from "@/app/workspace/types"

type ProjectNavItem = {
  id: string
  name: string
  sections: WorkspaceSection[]
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
              asChild
              className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <CollapsibleTrigger>
                {project.name}
                <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
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
                        <span>{item.title}</span>
                      </SidebarMenuButton>
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
