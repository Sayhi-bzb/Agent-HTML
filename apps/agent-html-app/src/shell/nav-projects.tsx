"use client"

import * as React from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/shared/ui/collapsible"
import { ConfirmationDialog } from "@/app/shell/confirmation-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/shared/ui/dropdown-menu"
import { Input } from "@/app/shared/ui/input"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/shared/ui/sidebar"
import {
  ChevronRightIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PlusIcon,
} from "lucide-react"

import type { WorkspaceSection } from "@/app/workspace/types"

type ProjectNavItem = {
  id: string
  name: string
  sections: WorkspaceSection[]
}

type PendingDelete =
  | { project: ProjectNavItem; type: "project" }
  | { project: ProjectNavItem; section: WorkspaceSection; type: "section" }

type EditingTarget =
  | { projectId: string; type: "new-section" }
  | { projectId: string; type: "project" }
  | { projectId: string; sectionId: string; type: "section" }
  | null

type PendingAction =
  | "delete-project"
  | "delete-section"
  | "duplicate-section"
  | "new-section"
  | "rename-project"
  | "rename-section"
  | null

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function isEditingProject(target: EditingTarget, projectId: string) {
  return target?.type === "project" && target.projectId === projectId
}

function isCreatingSection(target: EditingTarget, projectId: string) {
  return target?.type === "new-section" && target.projectId === projectId
}

function isEditingSection(
  target: EditingTarget,
  projectId: string,
  sectionId: string
) {
  return (
    target?.type === "section" &&
    target.projectId === projectId &&
    target.sectionId === sectionId
  )
}

function InlineNameInput({
  autoFocus,
  error,
  onCancel,
  onSubmit,
  placeholder,
  submittingLabel,
  value,
}: {
  autoFocus?: boolean
  error: string | null
  onCancel: () => void
  onSubmit: (value: string) => Promise<void>
  placeholder: string
  submittingLabel: string
  value: string
}) {
  const [draft, setDraft] = React.useState(value)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [localError, setLocalError] = React.useState<string | null>(null)
  const isSubmittingRef = React.useRef(false)

  React.useEffect(() => {
    setDraft(value)
  }, [value])

  const submit = React.useCallback(async () => {
    const nextValue = draft.trim()
    if (isSubmitting) {
      return
    }
    if (!nextValue) {
      setLocalError(`${placeholder} is required.`)
      return
    }

    setLocalError(null)
    isSubmittingRef.current = true
    setIsSubmitting(true)
    try {
      await onSubmit(nextValue)
    } catch {
      return
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }, [draft, isSubmitting, onSubmit])

  return (
    <div className="min-w-0 flex-1">
      <Input
        aria-label={placeholder}
        autoFocus={autoFocus}
        className="h-7 bg-background px-2 text-sm"
        disabled={isSubmitting}
        onBlur={() => {
          if (!isSubmittingRef.current && draft.trim() === value.trim()) {
            onCancel()
          }
        }}
        onChange={(event) => {
          setDraft(event.target.value)
          setLocalError(null)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            submit()
          }
          if (event.key === "Escape") {
            event.preventDefault()
            onCancel()
          }
        }}
        placeholder={placeholder}
        value={draft}
      />
      {localError || error ? (
        <p className="mt-1 truncate px-1 text-xs text-destructive">
          {localError ?? error}
        </p>
      ) : isSubmitting ? (
        <p className="mt-1 truncate px-1 text-xs text-muted-foreground">
          {submittingLabel}
        </p>
      ) : null}
    </div>
  )
}

function ProjectActionMenu({
  canEdit,
  disabledReason,
  onDelete,
  onNewSection,
  onRename,
}: {
  canEdit: boolean
  disabledReason: string | null
  onDelete: () => void
  onNewSection: () => void
  onRename: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction
          aria-label="Project actions"
          showOnHover
          title={disabledReason ?? undefined}
          type="button"
        >
          <MoreHorizontalIcon />
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6}>
        {!canEdit && disabledReason ? (
          <DropdownMenuItem disabled>{disabledReason}</DropdownMenuItem>
        ) : null}
        <DropdownMenuItem disabled={!canEdit} onSelect={onNewSection}>
          New Section
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!canEdit} onSelect={onRename}>
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!canEdit}
          onSelect={onDelete}
          variant="destructive"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ProjectQuickActions({
  canEdit,
  onNewSection,
}: {
  canEdit: boolean
  onNewSection: () => void
}) {
  return (
    <SidebarMenuAction
      aria-label="New section"
      disabled={!canEdit}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onNewSection()
      }}
      position="secondary"
      showOnHover
      title="New Section"
      type="button"
    >
      <PlusIcon />
    </SidebarMenuAction>
  )
}

function SectionActionMenu({
  canEdit,
  disabledReason,
  onDelete,
  onDuplicate,
  onRename,
}: {
  canEdit: boolean
  disabledReason: string | null
  onDelete: () => void
  onDuplicate: () => void
  onRename: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuAction
          aria-label="Section actions"
          showOnHover
          title={disabledReason ?? undefined}
          type="button"
        >
          <MoreHorizontalIcon />
        </SidebarMenuAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6}>
        {!canEdit && disabledReason ? (
          <DropdownMenuItem disabled>{disabledReason}</DropdownMenuItem>
        ) : null}
        <DropdownMenuItem disabled={!canEdit} onSelect={onDuplicate}>
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!canEdit} onSelect={onRename}>
          Rename
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={!canEdit}
          onSelect={onDelete}
          variant="destructive"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function SectionQuickActions({
  canEdit,
  onDuplicate,
}: {
  canEdit: boolean
  onDuplicate: () => void
}) {
  return (
    <SidebarMenuAction
      aria-label="Duplicate section"
      disabled={!canEdit}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onDuplicate()
      }}
      position="secondary"
      showOnHover
      title="Duplicate"
      type="button"
    >
      <CopyIcon />
    </SidebarMenuAction>
  )
}

export function NavProjects({
  activeProjectId,
  activeSectionId,
  canEditStructure,
  hasUnsavedChanges,
  onCreateProjectSection,
  onDeleteProject,
  onDeleteProjectSection,
  onDuplicateProjectSection,
  onOpenWorkspaceSection,
  onRenameProject,
  onRenameProjectSection,
  projects,
  workspaceActionError,
}: {
  activeProjectId: string | null
  activeSectionId: string
  canEditStructure: boolean
  hasUnsavedChanges: boolean
  onCreateProjectSection: (input: {
    projectId: string
    title: string
  }) => Promise<void>
  onDeleteProject: (input: { projectId: string }) => Promise<void>
  onDeleteProjectSection: (input: {
    projectId: string
    sectionId: string
  }) => Promise<void>
  onDuplicateProjectSection: (input: {
    projectId: string
    sectionId: string
  }) => Promise<void>
  onOpenWorkspaceSection: (input: {
    projectId: string
    sectionId: string
  }) => void
  onRenameProject: (input: {
    name: string
    projectId: string
  }) => Promise<void>
  onRenameProjectSection: (input: {
    projectId: string
    sectionId: string
    title: string
  }) => Promise<void>
  projects: ProjectNavItem[]
  workspaceActionError: string | null
}) {
  const [editingTarget, setEditingTarget] =
    React.useState<EditingTarget>(null)
  const [actionError, setActionError] = React.useState<string | null>(null)
  const [pendingDelete, setPendingDelete] =
    React.useState<PendingDelete | null>(null)
  const [pendingAction, setPendingAction] =
    React.useState<PendingAction>(null)

  const canEdit = canEditStructure && pendingAction === null
  const disabledReason = !canEditStructure
    ? "Desktop runtime required"
    : pendingAction !== null
      ? "Working..."
      : null

  const beginStructureEdit = React.useCallback(
    (action: () => void) => {
      if (hasUnsavedChanges) {
        setActionError("Save current section before editing workspace structure.")
        return
      }

      setActionError(null)
      action()
    },
    [hasUnsavedChanges]
  )

  const submitAction = React.useCallback(
    async (
      action: () => Promise<void>,
      fallback: string,
      pending: PendingAction
    ) => {
      setActionError(null)
      setPendingAction(pending)
      try {
        await action()
        setEditingTarget(null)
      } catch (error) {
        setActionError(getErrorMessage(error, fallback))
        throw error
      } finally {
        setPendingAction(null)
      }
    },
    []
  )

  return (
    <div className="group-data-[collapsible=icon]:hidden">
      {workspaceActionError || actionError ? (
        <p className="px-4 py-2 text-xs text-destructive">
          {workspaceActionError ?? actionError}
        </p>
      ) : null}
      {projects.map((project) => (
        <Collapsible
          key={project.id}
          className="group/collapsible"
          defaultOpen
        >
          <SidebarGroup>
            <SidebarGroupLabel
              className="group/project-row relative gap-0 pr-14 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {isEditingProject(editingTarget, project.id) ? (
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <ChevronRightIcon className="size-4 shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  <InlineNameInput
                    autoFocus
                    error={actionError}
                    onCancel={() => setEditingTarget(null)}
                    onSubmit={(name) =>
                      submitAction(
                        () => onRenameProject({ name, projectId: project.id }),
                        "Unable to rename project.",
                        "rename-project"
                      )
                    }
                    placeholder="Project name"
                    submittingLabel="Renaming..."
                    value={project.name}
                  />
                </div>
              ) : (
                <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2 outline-none">
                  <ChevronRightIcon className="size-4 shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  <span
                    className="truncate"
                    onDoubleClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      beginStructureEdit(() =>
                        setEditingTarget({
                          projectId: project.id,
                          type: "project",
                        })
                      )
                    }}
                  >
                    {project.name}
                  </span>
                </CollapsibleTrigger>
              )}
              <ProjectQuickActions
                canEdit={canEdit}
                onNewSection={() => {
                  beginStructureEdit(() =>
                    setEditingTarget({
                      projectId: project.id,
                      type: "new-section",
                    })
                  )
                }}
              />
              <ProjectActionMenu
                canEdit={canEdit}
                disabledReason={disabledReason}
                onDelete={() =>
                  beginStructureEdit(() =>
                    setPendingDelete({ project, type: "project" })
                  )
                }
                onNewSection={() => {
                  beginStructureEdit(() =>
                    setEditingTarget({
                      projectId: project.id,
                      type: "new-section",
                    })
                  )
                }}
                onRename={() => {
                  beginStructureEdit(() =>
                    setEditingTarget({ projectId: project.id, type: "project" })
                  )
                }}
              />
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {project.sections.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      {isEditingSection(editingTarget, project.id, item.id) ? (
                        <div className="flex min-h-8 w-full items-start rounded-md p-2 pr-8 text-sm">
                          <span className="ml-6 min-w-0 flex-1">
                            <InlineNameInput
                              autoFocus
                              error={actionError}
                              onCancel={() => setEditingTarget(null)}
                              onSubmit={(title) =>
                                submitAction(
                                  () =>
                                    onRenameProjectSection({
                                      projectId: project.id,
                                      sectionId: item.id,
                                      title,
                                    }),
                                  "Unable to rename section.",
                                  "rename-section"
                                )
                              }
                              placeholder="Section title"
                              submittingLabel="Renaming..."
                              value={item.title}
                            />
                          </span>
                        </div>
                      ) : (
                        <SidebarMenuButton
                          className="pr-14"
                          isActive={
                            activeProjectId === project.id &&
                            activeSectionId === item.id
                          }
                          onClick={() => {
                            onOpenWorkspaceSection({
                              projectId: project.id,
                              sectionId: item.id,
                            })
                          }}
                          type="button"
                        >
                          <span
                            className="ml-6 truncate"
                            onDoubleClick={(event) => {
                              event.preventDefault()
                              event.stopPropagation()
                              beginStructureEdit(() =>
                                setEditingTarget({
                                  projectId: project.id,
                                  sectionId: item.id,
                                  type: "section",
                                })
                              )
                            }}
                          >
                            {item.title}
                          </span>
                        </SidebarMenuButton>
                      )}
                      <SectionQuickActions
                        canEdit={canEdit}
                        onDuplicate={() =>
                          beginStructureEdit(() =>
                            submitAction(
                              () =>
                                onDuplicateProjectSection({
                                  projectId: project.id,
                                  sectionId: item.id,
                                }),
                              "Unable to duplicate section.",
                              "duplicate-section"
                            ).catch(() => {})
                          )
                        }
                      />
                      <SectionActionMenu
                        canEdit={canEdit}
                        disabledReason={disabledReason}
                        onDelete={() =>
                          beginStructureEdit(() =>
                            setPendingDelete({
                              project,
                              section: item,
                              type: "section",
                            })
                          )
                        }
                        onDuplicate={() =>
                          beginStructureEdit(() =>
                            submitAction(
                              () =>
                                onDuplicateProjectSection({
                                  projectId: project.id,
                                  sectionId: item.id,
                                }),
                              "Unable to duplicate section.",
                              "duplicate-section"
                            ).catch(() => {})
                          )
                        }
                        onRename={() => {
                          beginStructureEdit(() =>
                            setEditingTarget({
                              projectId: project.id,
                              sectionId: item.id,
                              type: "section",
                            })
                          )
                        }}
                      />
                    </SidebarMenuItem>
                  ))}
                  {isCreatingSection(editingTarget, project.id) ? (
                    <SidebarMenuItem>
                      <div className="flex min-h-8 items-start p-2">
                        <span className="ml-6 min-w-0 flex-1">
                          <InlineNameInput
                            autoFocus
                            error={actionError}
                            onCancel={() => setEditingTarget(null)}
                            onSubmit={(title) =>
                              submitAction(
                                () =>
                                  onCreateProjectSection({
                                    projectId: project.id,
                                    title,
                                  }),
                                "Unable to create section.",
                                "new-section"
                              )
                            }
                            placeholder="Untitled Section"
                            submittingLabel="Creating..."
                            value=""
                          />
                        </span>
                      </div>
                    </SidebarMenuItem>
                  ) : null}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      ))}
      <ConfirmationDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null)
          }
        }}
        title={
          pendingDelete?.type === "project"
            ? "Delete project?"
            : "Delete section?"
        }
        description={
          pendingDelete?.type === "project"
            ? `This will delete "${pendingDelete.project.name}" and all of its sections and documents.`
            : pendingDelete
              ? `This will delete "${pendingDelete.section.title}" and its document.`
              : null
        }
        cancelDisabled={pendingAction !== null}
        primaryAction={{
          disabled: pendingAction !== null,
          label:
            pendingAction === "delete-project" ||
            pendingAction === "delete-section"
              ? "Deleting..."
              : "Delete",
          onClick: (event) => {
            event.preventDefault()
            if (!pendingDelete || pendingAction !== null) {
              return
            }

            const action =
              pendingDelete.type === "project"
                ? onDeleteProject({
                    projectId: pendingDelete.project.id,
                  })
                : onDeleteProjectSection({
                    projectId: pendingDelete.project.id,
                    sectionId: pendingDelete.section.id,
                  })

            submitAction(
              () => action,
              pendingDelete.type === "project"
                ? "Unable to delete project."
                : "Unable to delete section.",
              pendingDelete.type === "project"
                ? "delete-project"
                : "delete-section"
            )
              .then(() => setPendingDelete(null))
              .catch(() => {})
          },
          variant: "destructive",
        }}
      />
    </div>
  )
}
