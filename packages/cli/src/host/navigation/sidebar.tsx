import {
  ArrowLeftIcon,
  FileTextIcon,
  PaletteIcon,
  SearchIcon,
  Settings2Icon,
  SparklesIcon,
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
  DropdownMenu,
  DropdownMenuTrigger,
} from "#agent-html-playground/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "#agent-html-playground/components/ui/sidebar"
import type {
  CanvasThemePreset,
  CanvasThemePresetId,
} from "#agent-html-playground/theme/presets"
import type { Artifact, GuardIssue } from "../host-contracts"
import type { CanvasSidebarView } from "../preferences/canvas-host-preferences"
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
  HostDropdownLabel,
  HostDropdownMeta,
} from "../ui/dropdown"
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
  activeSectionId,
  activeSidebarView,
  activeThemePresetId,
  artifactsLoading,
  artifacts,
  codexThreads,
  codexThreadsError,
  codexThreadsLoading,
  guardIssues,
  onSelectArtifact,
  onSelectCodexThread,
  onSelectSection,
  onSelectSidebarView,
  onSelectThemePreset,
  onResetThemePreview,
  onThemeVariableChange,
  themeDraft,
  themePreviewDirty,
  themePresets,
  themeRuntimeVariables,
}: {
  activeFilePath: string | null
  activeCodexThreadId: string | null
  activeSectionId: CanvasThemeEditorSectionId
  activeSidebarView: CanvasSidebarView
  activeThemePresetId: CanvasThemePresetId
  artifactsLoading: boolean
  artifacts: Artifact[]
  codexThreads: CodexThread[]
  codexThreadsError: string | null
  codexThreadsLoading: boolean
  guardIssues: GuardIssue[]
  onSelectArtifact: (filePath: string) => void
  onSelectCodexThread: (threadId: string | null) => void
  onSelectSection: (sectionId: CanvasThemeEditorSectionId) => void
  onSelectSidebarView: (view: CanvasSidebarView) => void
  onSelectThemePreset: (presetId: CanvasThemePresetId) => void
  onResetThemePreview: () => void
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
              loading={codexThreadsLoading}
              onSelectThread={onSelectCodexThread}
              threads={codexThreads}
              error={codexThreadsError}
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
                    const issueCount = guardIssues.filter(
                      (issue) => issue.filePath === artifact.filePath
                    ).length

                    return (
                      <HostSidebarAction
                        icon={FileTextIcon}
                        isActive={artifact.filePath === activeFilePath}
                        key={artifact.filePath}
                        label={artifactLabel(artifact.filePath)}
                        onClick={() => onSelectArtifact(artifact.filePath)}
                        title={artifact.filePath}
                        tooltip={artifactLabel(artifact.filePath)}
                        type="button"
                      >
                        {issueCount > 0 ? (
                          <SidebarMenuBadge>{issueCount}</SidebarMenuBadge>
                        ) : null}
                      </HostSidebarAction>
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
                icon={PaletteIcon}
                label="Gallery"
                onClick={() => onSelectSidebarView("gallery")}
                type="button"
              />
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <HostSidebarActionButton
                      icon={Settings2Icon}
                      label="Settings"
                      type="button"
                    />
                  </DropdownMenuTrigger>
                  <HostDropdownContent align="end" side="right">
                    <HostDropdownLabel>Settings</HostDropdownLabel>
                    <HostDropdownMeta
                      caption="Local artifact workbench"
                      label="Agent-HTML"
                    />
                  </HostDropdownContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

const newCodexThreadValue = "__agent-html-new-codex-thread__"

function shortCodexThreadId(threadId: string) {
  return threadId.length > 10 ? `${threadId.slice(0, 10)}...` : threadId
}

function codexThreadLabel(thread: CodexThread) {
  return thread.name ?? thread.preview ?? shortCodexThreadId(thread.id)
}

function ReactCanvasCodexThreadSelect({
  activeThreadId,
  error,
  loading,
  onSelectThread,
  threads,
}: {
  activeThreadId: string | null
  error: string | null
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
            value: activeThreadId,
          },
        ]
      : []
  const options: HostSelectOption[] = loading
    ? [{ label: "Loading threads", value: newCodexThreadValue }]
    : [
        { label: "New thread", value: newCodexThreadValue },
        ...missingThreadOption,
        ...threads.map((thread) => ({
          label: codexThreadLabel(thread),
          value: thread.id,
        })),
      ]
  const value = activeThreadId ?? newCodexThreadValue

  return (
    <HostSelect
      disabled={loading}
      label={error ? "Codex thread unavailable" : "Codex thread"}
      onValueChange={(nextValue) =>
        onSelectThread(nextValue === newCodexThreadValue ? null : nextValue)
      }
      options={options}
      value={value}
    />
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
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
      ))}
    </>
  )
}
