"use client"

import * as React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Input } from "@/shared/ui/input"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar"
import {
  CopyIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"

type ProjectNavItem = {
  id: string
  name: string
  slug: string
}

export function NavProjects({
  onDeleteProject,
  onDuplicateProject,
  onOpenProject,
  onRenameProject,
  projects,
}: {
  onDeleteProject: (projectId: string) => void
  onDuplicateProject: (projectId: string) => void
  onOpenProject: (projectId: string) => void
  onRenameProject: (projectId: string, name: string) => void
  projects: ProjectNavItem[]
}) {
  const { isMobile } = useSidebar()
  const [draftName, setDraftName] = React.useState("")
  const [editingProjectId, setEditingProjectId] = React.useState<string | null>(
    null
  )
  const [pendingDeleteProjectId, setPendingDeleteProjectId] = React.useState<
    string | null
  >(null)

  const pendingDeleteProject = React.useMemo(
    () =>
      pendingDeleteProjectId
        ? projects.find((project) => project.id === pendingDeleteProjectId) ??
          null
        : null,
    [pendingDeleteProjectId, projects]
  )

  const cancelRename = React.useCallback(() => {
    setDraftName("")
    setEditingProjectId(null)
  }, [])

  const commitRename = React.useCallback(() => {
    if (!editingProjectId) {
      return
    }

    const nextName = draftName.trim()
    if (!nextName) {
      cancelRename()
      return
    }

    onRenameProject(editingProjectId, nextName)
    cancelRename()
  }, [cancelRename, draftName, editingProjectId, onRenameProject])

  React.useEffect(() => {
    if (
      editingProjectId &&
      !projects.some((project) => project.id === editingProjectId)
    ) {
      cancelRename()
    }
  }, [cancelRename, editingProjectId, projects])

  React.useEffect(() => {
    if (pendingDeleteProjectId && !pendingDeleteProject) {
      setPendingDeleteProjectId(null)
    }
  }, [pendingDeleteProject, pendingDeleteProjectId])

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          const isEditing = editingProjectId === item.id

          return (
          <SidebarMenuItem key={item.id}>
            {isEditing ? (
              <Input
                autoFocus
                className="h-8 bg-background"
                onBlur={commitRename}
                onChange={(event) => setDraftName(event.target.value)}
                onFocus={(event) => event.currentTarget.select()}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    commitRename()
                  }

                  if (event.key === "Escape") {
                    event.preventDefault()
                    cancelRename()
                  }
                }}
                value={draftName}
              />
            ) : (
              <SidebarMenuButton
                onClick={() => onOpenProject(item.id)}
                type="button"
              >
                <span>{item.name}</span>
              </SidebarMenuButton>
            )}
            {!isEditing ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction
                    showOnHover
                    className="aria-expanded:bg-muted"
                  >
                    <MoreHorizontalIcon />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem
                    onSelect={() => {
                      setDraftName(item.name)
                      setEditingProjectId(item.id)
                    }}
                  >
                    <PencilIcon className="text-muted-foreground" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onDuplicateProject(item.id)}>
                    <CopyIcon className="text-muted-foreground" />
                    <span>Duplicate</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => setPendingDeleteProjectId(item.id)}
                    variant="destructive"
                  >
                    <Trash2Icon />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </SidebarMenuItem>
        )})}
      </SidebarMenu>
      <AlertDialog
        open={pendingDeleteProject !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteProjectId(null)
          }
        }}
      >
          <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {pendingDeleteProject?.name ?? "project"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the project and closes its open tabs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (!pendingDeleteProjectId) {
                  return
                }

                onDeleteProject(pendingDeleteProjectId)
                setPendingDeleteProjectId(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarGroup>
  )
}
