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
  slug: string
}

export function SearchCommand({
  onOpenProject,
  projects,
}: {
  onOpenProject: (projectId: string) => void
  projects: ProjectSearchItem[]
}) {
  const [open, setOpen] = React.useState(false)

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
            <CommandGroup heading="Projects">
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  keywords={[project.slug]}
                  onSelect={() => {
                    onOpenProject(project.id)
                    setOpen(false)
                  }}
                >
                  {project.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
