"use client"

import * as React from "react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/shared/ui/command"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/shared/ui/sidebar"
import { SearchIcon } from "lucide-react"

type ProjectSearchItem = {
  id: string
  name: string
  sections: {
    id: string
    title: string
  }[]
  slug: string
}

export function SearchCommand({
  onOpenWorkspaceSection,
  projects,
}: {
  onOpenWorkspaceSection: (input: {
    projectId: string
    sectionId: string
  }) => void
  projects: ProjectSearchItem[]
}) {
  const [open, setOpen] = React.useState(false)
  const sectionItems = React.useMemo(
    () =>
      projects.flatMap((project) =>
        project.sections.map((section) => ({
          project,
          section,
        }))
      ),
    [projects]
  )

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton type="button" onClick={() => setOpen(true)}>
            <SearchIcon />
            <span>Search</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search for a command to run."
        className="sm:max-w-md"
      >
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Sections">
              {sectionItems.map(({ project, section }) => (
                <CommandItem
                  key={section.id}
                  keywords={[project.name, project.slug, section.title]}
                  onSelect={() => {
                    onOpenWorkspaceSection({
                      projectId: project.id,
                      sectionId: section.id,
                    })
                    setOpen(false)
                  }}
                >
                  {section.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
