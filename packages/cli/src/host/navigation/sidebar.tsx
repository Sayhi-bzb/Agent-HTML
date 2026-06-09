import {
  EllipsisIcon,
  ArrowLeftIcon,
  FileTextIcon,
  FilePlus2Icon,
  PaletteIcon,
  PencilIcon,
  SearchIcon,
  Settings2Icon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react"
import * as React from "react"

import { artifactLabel } from "../api/api"
import type { CodexThread } from "../api/api"
import {
  ReactCanvasThemeEditor,
  ReactCanvasThemeEditorHeader,
  ReactCanvasThemePresetSelect,
} from "../theme/theme-editor"
import type { CanvasThemeEditorSectionId } from "../theme/theme-editor-sections"
import type {
  CanvasThemeDraft,
  CanvasThemeResolvedVariables,
  CanvasThemeVariableName,
} from "../theme/theme-draft"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#agent-html-playground/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "#agent-html-playground/components/ui/dropdown-menu"
import { Input } from "#agent-html-playground/components/ui/input"
import {
  Popover,
  PopoverTrigger,
} from "#agent-html-playground/components/ui/popover"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "#agent-html-playground/components/ui/sidebar"
import type {
  CanvasThemePreset,
  CanvasThemePresetId,
} from "#agent-html-playground/theme/presets"
import type { Artifact, GuardIssue } from "../host-contracts"
import { countHumanVisibleGuardIssues } from "../guard-visibility"
import type {
  CanvasHostLanguage,
  CanvasHostThemeMode,
  CanvasSidebarView,
} from "../preferences/canvas-host-preferences"
import { HostButton } from "../ui/button"
import {
  HostCommand,
  HostCommandDialog,
  HostCommandEmpty,
  HostCommandGroup,
  HostCommandInput,
  HostCommandItem,
  HostCommandList,
} from "../ui/command"
import {
  HostDropdownContent,
  HostDropdownItem,
  HostDropdownLabel,
} from "../ui/dropdown"
import { HostPopoverAction, HostPopoverContent } from "../ui/popover"
import {
  HostSidebarAction,
  HostSidebarActionButton,
  HostSidebarStatus,
} from "../ui/sidebar-action"
import type { HostSelectOption } from "../ui/select"
import { HostSelect } from "../ui/select"

export function ReactCanvasSidebar({
  activeFilePath,
  activeCodexThreadId,
  activeLanguage,
  activeSectionId,
  activeSidebarView,
  activeThemeMode,
  activeThemePresetId,
  createArtifactActive,
  artifactsLoading,
  artifacts,
  codexThreads,
  codexThreadsError,
  codexThreadsLoading,
  guardIssues,
  onSelectArtifact,
  onSelectCodexThread,
  onDeleteArtifact,
  onRenameArtifact,
  onSelectSection,
  onSelectSidebarView,
  onSelectThemeMode,
  onSelectThemePreset,
  onResetThemePreview,
  onSelectCreateArtifact,
  onThemeVariableChange,
  themeDraft,
  themePreviewDirty,
  themePresets,
  themeRuntimeVariables,
}: {
  activeFilePath: string | null
  activeCodexThreadId: string | null
  activeLanguage: CanvasHostLanguage
  activeSectionId: CanvasThemeEditorSectionId
  activeSidebarView: CanvasSidebarView
  activeThemeMode: CanvasHostThemeMode
  activeThemePresetId: CanvasThemePresetId
  createArtifactActive: boolean
  artifactsLoading: boolean
  artifacts: Artifact[]
  codexThreads: CodexThread[]
  codexThreadsError: string | null
  codexThreadsLoading: boolean
  guardIssues: GuardIssue[]
  onSelectArtifact: (filePath: string) => void
  onSelectCodexThread: (threadId: string | null) => void
  onDeleteArtifact: (filePath: string) => Promise<void>
  onRenameArtifact: (input: {
    filePath: string
    nextFileName: string
  }) => Promise<void>
  onSelectSection: (sectionId: CanvasThemeEditorSectionId) => void
  onSelectSidebarView: (view: CanvasSidebarView) => void
  onSelectThemeMode: (mode: CanvasHostThemeMode) => void
  onSelectThemePreset: (presetId: CanvasThemePresetId) => void
  onResetThemePreview: () => void
  onSelectCreateArtifact: () => void
  onThemeVariableChange: (
    name: CanvasThemeVariableName,
    value: string
  ) => void
  themeDraft: CanvasThemeDraft
  themePreviewDirty: boolean
  themePresets: readonly CanvasThemePreset[]
  themeRuntimeVariables: CanvasThemeResolvedVariables
}) {
  const activeThemePreset =
    themePresets.find((preset) => preset.id === activeThemePresetId) ??
    themePresets[0]
  const isGalleryView = activeSidebarView === "gallery"

  return (
    <Sidebar className="border-transparent" collapsible="offcanvas">
      <SidebarHeader className="canvas-sidebar-pad canvas-sidebar-header-stack">
        {isGalleryView ? (
          <SidebarMenu className="canvas-sidebar-menu">
            <HostSidebarAction
              icon={ArrowLeftIcon}
              label="Back"
              onClick={() => onSelectSidebarView("artifacts")}
              type="button"
            />
          </SidebarMenu>
        ) : (
          <>
            <div className="canvas-sidebar-brand">
              <img
                alt=""
                aria-hidden="true"
                className="canvas-sidebar-brand-icon"
                src="/__agent-html/public/ghost.svg"
              />
              <span className="canvas-sidebar-title min-w-0 truncate">
                Agent-HTML
              </span>
            </div>
            <ReactCanvasArtifactSearch
              artifacts={artifacts}
              onSelectArtifact={onSelectArtifact}
              onSelectSidebarView={onSelectSidebarView}
            />
            <ReactCanvasCodexThreadSelect
              activeThreadId={activeCodexThreadId}
              error={codexThreadsError}
              loading={codexThreadsLoading}
              onSelectThread={onSelectCodexThread}
              threads={codexThreads}
            />
            <ReactCanvasThemePresetSelect
              activePresetId={activeThemePresetId}
              onSelectPreset={onSelectThemePreset}
              presets={themePresets}
            />
          </>
        )}
        {isGalleryView ? (
          <ReactCanvasThemeEditorHeader
            activePresetId={activeThemePresetId}
            activeSectionId={activeSectionId}
            onSelectPreset={onSelectThemePreset}
            onSelectSection={onSelectSection}
            presets={themePresets}
          />
        ) : null}
      </SidebarHeader>
      <SidebarContent>
        {isGalleryView ? (
          <ReactCanvasThemeEditor
            activeSectionId={activeSectionId}
            draft={themeDraft}
            onVariableChange={onThemeVariableChange}
            preset={activeThemePreset}
            runtimeVariables={themeRuntimeVariables}
          />
        ) : (
          <SidebarGroup className="canvas-sidebar-artifact-list">
            <SidebarGroupContent>
              <SidebarMenu>
                {artifactsLoading ? (
                  <ReactCanvasArtifactListSkeleton />
                ) : (
                  artifacts.map((artifact) => {
                    const artifactIssues = guardIssues.filter(
                      (issue) => issue.filePath === artifact.filePath
                    )
                    const issueCount =
                      countHumanVisibleGuardIssues(artifactIssues)

                    return (
                      <ArtifactSidebarItem
                        artifact={artifact}
                        issueCount={issueCount}
                        isActive={artifact.filePath === activeFilePath}
                        key={artifact.filePath}
                        onDeleteArtifact={onDeleteArtifact}
                        onRenameArtifact={onRenameArtifact}
                        onSelectArtifact={onSelectArtifact}
                      />
                    )
                  })
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="canvas-sidebar-pad">
        <SidebarMenu>
          {isGalleryView ? (
            themePreviewDirty ? (
              <HostSidebarAction
                icon={SparklesIcon}
                label="Reset preview"
                onClick={onResetThemePreview}
                type="button"
              />
            ) : (
              <HostSidebarStatus
                icon={SparklesIcon}
                label="Preview clean"
              />
            )
          ) : (
            <>
              <HostSidebarAction
                icon={FilePlus2Icon}
                isActive={createArtifactActive}
                label="New artifact"
                onClick={onSelectCreateArtifact}
                type="button"
              />
              <HostSidebarAction
                icon={PaletteIcon}
                label="Gallery"
                onClick={() => onSelectSidebarView("gallery")}
                type="button"
              />
              <SidebarMenuItem>
                <Popover>
                  <PopoverTrigger asChild>
                    <HostSidebarActionButton
                      icon={Settings2Icon}
                      label="Settings"
                      type="button"
                    />
                  </PopoverTrigger>
                  <HostPopoverContent
                    align="end"
                    className="canvas-host-settings-popover-content"
                    side="right"
                  >
                    <HostDropdownLabel>Settings</HostDropdownLabel>
                    <ReactCanvasThemeSelect
                      activeMode={activeThemeMode}
                      onSelectMode={onSelectThemeMode}
                    />
                    <ReactCanvasLanguageSelect activeLanguage={activeLanguage} />
                  </HostPopoverContent>
                </Popover>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

const newCodexThreadValue = "__agent-html-new-codex-thread__"

const themeModeOptions = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
] satisfies readonly { label: string; value: CanvasHostThemeMode }[]

const languageOptions = [
  { label: "System", value: "system" },
  { label: "中文", value: "zh" },
  { label: "English", value: "en" },
] satisfies readonly { label: string; value: CanvasHostLanguage }[]

function artifactFileName(filePath: string) {
  return filePath.split(/[\\/]/).at(-1) ?? filePath
}

function ArtifactSidebarItem({
  artifact,
  issueCount,
  isActive,
  onDeleteArtifact,
  onRenameArtifact,
  onSelectArtifact,
}: {
  artifact: Artifact
  issueCount: number
  isActive: boolean
  onDeleteArtifact: (filePath: string) => Promise<void>
  onRenameArtifact: (input: {
    filePath: string
    nextFileName: string
  }) => Promise<void>
  onSelectArtifact: (filePath: string) => void
}) {
  const label = artifactLabel(artifact.filePath)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [renameOpen, setRenameOpen] = React.useState(false)
  const [renameDraft, setRenameDraft] = React.useState(() =>
    artifactFileName(artifact.filePath)
  )
  const [status, setStatus] = React.useState("")

  React.useEffect(() => {
    if (!renameOpen) {
      setRenameDraft(artifactFileName(artifact.filePath))
      setStatus("")
    }
  }, [artifact.filePath, renameOpen])

  async function submitRename(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("")

    try {
      await onRenameArtifact({
        filePath: artifact.filePath,
        nextFileName: renameDraft,
      })
      setRenameOpen(false)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error))
    }
  }

  async function confirmDelete() {
    setStatus("")

    try {
      await onDeleteArtifact(artifact.filePath)
      setDeleteOpen(false)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error))
    }
  }

  return (
    <SidebarMenuItem>
      <HostSidebarActionButton
        isActive={isActive}
        label={label}
        onClick={() => onSelectArtifact(artifact.filePath)}
        type="button"
      />
      {issueCount > 0 ? <SidebarMenuBadge>{issueCount}</SidebarMenuBadge> : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            aria-label={`Artifact actions for ${label}`}
            onClick={(event) => event.stopPropagation()}
            showOnHover
            type="button"
          >
            <EllipsisIcon />
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <HostDropdownContent align="end" side="right">
          <HostDropdownItem
            icon={PencilIcon}
            label="Rename"
            onSelect={(event) => {
              event.preventDefault()
              setRenameOpen(true)
            }}
          />
          <HostDropdownItem
            icon={Trash2Icon}
            label="Delete"
            onSelect={(event) => {
              event.preventDefault()
              setDeleteOpen(true)
            }}
            variant="destructive"
          />
        </HostDropdownContent>
      </DropdownMenu>
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <form onSubmit={submitRename}>
            <DialogHeader>
              <DialogTitle>Rename artifact</DialogTitle>
              <DialogDescription>
                Choose a new artifact filename.
              </DialogDescription>
            </DialogHeader>
            <Input
              className="mt-4"
              onChange={(event) => setRenameDraft(event.currentTarget.value)}
              value={renameDraft}
            />
            {status ? <p className="canvas-sidebar-dialog-status">{status}</p> : null}
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <HostButton type="button" variant="outline">
                  Cancel
                </HostButton>
              </DialogClose>
              <HostButton type="submit">Save</HostButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete artifact?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the artifact entry from the Canvas workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {status ? <p className="canvas-sidebar-dialog-status">{status}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                void confirmDelete()
              }}
              variant="destructive"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarMenuItem>
  )
}

function shortCodexThreadId(threadId: string) {
  return threadId.length > 18
    ? `${threadId.slice(0, 10)}...${threadId.slice(-6)}`
    : threadId
}

function codexThreadLabel(thread: CodexThread) {
  return thread.name ?? thread.preview ?? shortCodexThreadId(thread.id)
}

function ReactCanvasThemeSelect({
  activeMode,
  onSelectMode,
}: {
  activeMode: CanvasHostThemeMode
  onSelectMode: (mode: CanvasHostThemeMode) => void
}) {
  return (
    <ReactCanvasSettingsOptionPopover
      activeValue={activeMode}
      label="Theme"
      onSelectValue={(value) => onSelectMode(value as CanvasHostThemeMode)}
      options={themeModeOptions}
      title="Theme"
    />
  )
}

function ReactCanvasLanguageSelect({
  activeLanguage,
}: {
  activeLanguage: CanvasHostLanguage
}) {
  return (
    <ReactCanvasSettingsOptionPopover
      activeValue={activeLanguage}
      disabled
      label="Language"
      onSelectValue={() => {}}
      options={languageOptions}
      title="Language"
    />
  )
}

function HostSettingsSelectRow({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <div className="canvas-host-settings-row">
      <span className="canvas-host-settings-row-title">{title}</span>
      {children}
    </div>
  )
}

function ReactCanvasCodexThreadSelect({
  activeThreadId,
  error,
  layout = "sidebar",
  loading,
  onSelectThread,
  threads,
}: {
  activeThreadId: string | null
  error: string | null
  layout?: "sidebar"
  loading: boolean
  onSelectThread: (threadId: string | null) => void
  threads: CodexThread[]
}) {
  const activeThread =
    activeThreadId
      ? threads.find((thread) => thread.id === activeThreadId)
      : null
  const activeThreadMissing = Boolean(activeThreadId && !activeThread && !loading)
  const missingThreadOption: HostSelectOption[] =
    activeThreadMissing && activeThreadId
      ? [
          {
            label: `Current ${shortCodexThreadId(activeThreadId)}`,
            triggerLabel: shortCodexThreadId(activeThreadId),
            value: activeThreadId,
          },
        ]
      : []
  const options: HostSelectOption[] = loading
    ? [
        {
          label: "Loading threads",
          value: newCodexThreadValue,
        },
      ]
    : [
        {
          label: "New thread",
          value: newCodexThreadValue,
        },
        ...missingThreadOption,
        ...threads.map((thread) => ({
          label: codexThreadLabel(thread),
          triggerLabel: shortCodexThreadId(thread.id),
          value: thread.id,
        })),
      ]
  const value = activeThreadId ?? newCodexThreadValue

  const select = (
    <HostSelect
      disabled={loading}
      label={error ? "Codex thread unavailable" : "Codex thread"}
      layout={layout}
      onValueChange={(nextValue) =>
        onSelectThread(nextValue === newCodexThreadValue ? null : nextValue)
      }
      options={options}
      value={value}
    />
  )

  return select
}

function ReactCanvasSettingsOptionPopover({
  activeValue,
  disabled = false,
  label,
  onSelectValue,
  options,
  title,
}: {
  activeValue: string
  disabled?: boolean
  label: string
  onSelectValue: (value: string) => void
  options: readonly HostSelectOption[]
  title: string
}) {
  const [open, setOpen] = React.useState(false)
  const activeOption = options.find((option) => option.value === activeValue)

  function selectValue(nextValue: string) {
    onSelectValue(nextValue)
    setOpen(false)
  }

  return (
    <HostSettingsSelectRow title={title}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <HostButton
            aria-label={label}
            className="canvas-host-select-compact-trigger"
            disabled={disabled}
            type="button"
            variant="ghost"
          >
            <span className="canvas-host-select-compact-value">
              {activeOption?.label ?? label}
            </span>
          </HostButton>
        </PopoverTrigger>
        {disabled ? null : (
          <HostPopoverContent
            align="end"
            className="canvas-host-settings-options-content"
            side="right"
          >
            {options.map((option) => (
              <HostPopoverAction
                active={option.value === activeValue}
                key={option.value}
                label={option.label}
                onClick={() => selectValue(option.value)}
              />
            ))}
          </HostPopoverContent>
        )}
      </Popover>
    </HostSettingsSelectRow>
  )
}

function ReactCanvasArtifactSearch({
  artifacts,
  onSelectArtifact,
  onSelectSidebarView,
}: {
  artifacts: Artifact[]
  onSelectArtifact: (filePath: string) => void
  onSelectSidebarView: (view: CanvasSidebarView) => void
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <SidebarMenu className="canvas-sidebar-menu">
        <HostSidebarAction
          icon={SearchIcon}
          label="Search"
          onClick={() => setOpen(true)}
          type="button"
        />
      </SidebarMenu>
      <HostCommandDialog
        className="sm:max-w-md"
        description="Search Canvas artifacts."
        onOpenChange={setOpen}
        open={open}
        title="Search artifacts"
      >
        <HostCommand>
          <HostCommandInput placeholder="Search artifacts..." />
          <HostCommandList>
            <HostCommandEmpty>No artifacts found.</HostCommandEmpty>
            <HostCommandGroup heading="Artifacts">
              {artifacts.map((artifact) => {
                const label = artifactLabel(artifact.filePath)

                return (
                  <HostCommandItem
                    icon={FileTextIcon}
                    key={artifact.filePath}
                    keywords={[label, artifact.filePath]}
                    label={label}
                    onSelect={() => {
                      onSelectArtifact(artifact.filePath)
                      onSelectSidebarView("artifacts")
                      setOpen(false)
                    }}
                    value={artifact.filePath}
                  />
                )
              })}
            </HostCommandGroup>
          </HostCommandList>
        </HostCommand>
      </HostCommandDialog>
    </>
  )
}

function ReactCanvasArtifactListSkeleton() {
  return (
    <>
      {["primary", "secondary", "tertiary", "quaternary"].map((row) => (
        <SidebarMenuItem key={row}>
          <SidebarMenuSkeleton />
        </SidebarMenuItem>
      ))}
    </>
  )
}
