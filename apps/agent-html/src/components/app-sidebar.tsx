import * as React from "react"

import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { SearchCommand } from "@/components/search-command"
import { SettingsMenu } from "@/components/settings-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {
  LifeBuoyIcon,
  SendIcon,
} from "lucide-react"

type ProjectNavItem = {
  id: string
  name: string
  slug: string
}

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: (
        <LifeBuoyIcon
        />
      ),
    },
    {
      title: "Feedback",
      url: "#",
      icon: (
        <SendIcon
        />
      ),
    },
  ],
}

export function AppSidebar({
  onDeleteProject,
  onDuplicateProject,
  onOpenProject,
  onRenameProject,
  projects,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  onDeleteProject: (projectId: string) => void
  onDuplicateProject: (projectId: string) => void
  onOpenProject: (projectId: string) => void
  onRenameProject: (projectId: string, name: string) => void
  projects: ProjectNavItem[]
}) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SearchCommand onOpenProject={onOpenProject} projects={projects} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects
          onDeleteProject={onDeleteProject}
          onDuplicateProject={onDuplicateProject}
          onOpenProject={onOpenProject}
          onRenameProject={onRenameProject}
          projects={projects}
        />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <SettingsMenu />
      </SidebarFooter>
    </Sidebar>
  )
}
