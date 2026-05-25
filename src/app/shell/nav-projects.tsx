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

export type WorkspaceSection = {
  groupTitle: string
  id: string
  title: string
}

type ProjectNavItem = {
  id: string
  name: string
}

export const workspaceSections: WorkspaceSection[] = [
  {
    groupTitle: "Getting Started",
    id: "installation",
    title: "Installation",
  },
  {
    groupTitle: "Getting Started",
    id: "project-structure",
    title: "Project Structure",
  },
  {
    groupTitle: "Build Your Application",
    id: "routing",
    title: "Routing",
  },
  {
    groupTitle: "Build Your Application",
    id: "data-fetching",
    title: "Data Fetching",
  },
  {
    groupTitle: "Build Your Application",
    id: "rendering",
    title: "Rendering",
  },
  {
    groupTitle: "Build Your Application",
    id: "caching",
    title: "Caching",
  },
]

export const defaultWorkspaceSectionId = workspaceSections[0].id

export function getWorkspaceSection(sectionId: string) {
  return (
    workspaceSections.find((section) => section.id === sectionId) ??
    workspaceSections[0]
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
                  {workspaceSections.map((item) => (
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
