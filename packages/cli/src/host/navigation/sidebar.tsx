import {
  EllipsisIcon,
  ArrowLeftIcon,
  BookOpenTextIcon,
  FileTextIcon,
  FilePlus2Icon,
  LanguagesIcon,
  LoaderCircleIcon,
  MoonIcon,
  PaletteIcon,
  PencilIcon,
  SearchIcon,
  SparklesIcon,
  SunIcon,
  Trash2Icon,
} from "lucide-react"
import * as React from "react"

import { agentHtmlBrandName } from "../../shared/brand"
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
import { AgentHtmlGhostIcon, GithubMarkIcon } from "../ui/brand-icons"
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
import { HostIconButton } from "../ui/icon-button"
import { HostPopoverAction, HostPopoverContent } from "../ui/popover"
import { useHostI18n } from "../i18n/host-i18n"
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
  createArtifactPending,
  artifactsLoading,
  artifacts,
  codexThreads,
  codexThreadsError,
  codexThreadsLoading,
  guardIssues,
  onSelectArtifact,
  onSelectCodexThread,
  onSelectLanguage,
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
  createArtifactPending: boolean
  artifactsLoading: boolean
  artifacts: Artifact[]
  codexThreads: CodexThread[]
  codexThreadsError: string | null
  codexThreadsLoading: boolean
  guardIssues: GuardIssue[]
  onSelectArtifact: (filePath: string) => void
  onSelectCodexThread: (threadId: string | null) => void
  onSelectLanguage: (language: CanvasHostLanguage) => void
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
  const { t } = useHostI18n()
  const activeThemePreset =
    themePresets.find((preset) => preset.id === activeThemePresetId) ??
    themePresets[0]
  const isGalleryView = activeSidebarView === "gallery"
  const resolvedThemeIsDark = isResolvedCanvasThemeDark(activeThemeMode)

  return (
    <Sidebar className="border-transparent" collapsible="offcanvas">
      <SidebarHeader className="canvas-sidebar-pad canvas-sidebar-header-stack">
        {isGalleryView ? (
          <SidebarMenu className="canvas-sidebar-menu">
            <HostSidebarAction
              icon={ArrowLeftIcon}
              label={t("sidebar.back")}
              onClick={() => onSelectSidebarView("artifacts")}
              type="button"
            />
          </SidebarMenu>
        ) : (
          <>
            <div className="canvas-sidebar-brand">
              <div className="canvas-sidebar-brand-main">
                <AgentHtmlGhostIcon
                  aria-hidden="true"
                  className="canvas-sidebar-brand-icon"
                />
                <span className="canvas-sidebar-title min-w-0 truncate">
                  {agentHtmlBrandName}
                </span>
              </div>
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
                label={t("sidebar.resetPreview")}
                onClick={onResetThemePreview}
                type="button"
              />
            ) : (
              <HostSidebarStatus
                icon={SparklesIcon}
                label={t("sidebar.previewClean")}
              />
            )
          ) : (
            <>
              <HostSidebarAction
                icon={FilePlus2Icon}
                isActive={createArtifactActive}
                label={t("sidebar.newArtifact")}
                onClick={onSelectCreateArtifact}
                trailing={
                  createArtifactPending ? (
                    <LoaderCircleIcon
                      aria-hidden="true"
                      className="canvas-sidebar-spinner"
                    />
                  ) : null
                }
                type="button"
              />
              <HostSidebarAction
                icon={PaletteIcon}
                label={t("sidebar.gallery")}
                onClick={() => onSelectSidebarView("gallery")}
                type="button"
              />
              <SidebarMenuItem>
                <div className="canvas-sidebar-footer-icon-group">
                  <HostIconButton
                    className="canvas-sidebar-footer-icon-button"
                    icon={resolvedThemeIsDark ? SunIcon : MoonIcon}
                    label={
                      resolvedThemeIsDark
                        ? t("sidebar.switchToLightTheme")
                        : t("sidebar.switchToDarkTheme")
                    }
                    onClick={() =>
                      onSelectThemeMode(
                        isResolvedCanvasThemeDark(activeThemeMode)
                          ? "light"
                          : "dark"
                      )
                    }
                    size="icon-sm"
                    variant="ghost"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <HostIconButton
                        className="canvas-sidebar-footer-icon-button"
                        icon={LanguagesIcon}
                        label={t("sidebar.languageShow")}
                        size="icon-sm"
                        variant="ghost"
                      />
                    </PopoverTrigger>
                    <HostPopoverContent
                      align="end"
                      className="canvas-host-language-popover-content"
                      side="right"
                    >
                      <HostDropdownLabel>{t("sidebar.language")}</HostDropdownLabel>
                      {canvasHostLanguageOptions.map((language) => (
                        <HostPopoverAction
                          active={language === activeLanguage}
                          key={language}
                          label={languageOptionLabel({ language, t })}
                          onClick={() => onSelectLanguage(language)}
                        />
                      ))}
                    </HostPopoverContent>
                  </Popover>
                  <HostIconButton
                    className="canvas-sidebar-footer-icon-button"
                    href="https://agent-html.org/docs"
                    icon={BookOpenTextIcon}
                    label={t("sidebar.docs")}
                    rel="noreferrer"
                    size="icon-sm"
                    target="_blank"
                    variant="ghost"
                  />
                  <HostIconButton
                    className="canvas-sidebar-footer-icon-button"
                    href="https://github.com/Sayhi-bzb/Agent-HTML"
                    icon={GithubMarkIcon}
                    label={t("sidebar.github")}
                    rel="noreferrer"
                    size="icon-sm"
                    target="_blank"
                    variant="ghost"
                  />
                </div>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

const newCodexThreadValue = "__agent-html-new-codex-thread__"

const canvasHostLanguageOptions = [
  "system",
  "zh",
  "en",
] as const satisfies readonly CanvasHostLanguage[]

type HostSidebarTranslator = ReturnType<typeof useHostI18n>["t"]

function languageOptionLabel({
  language,
  t,
}: {
  language: CanvasHostLanguage
  t: HostSidebarTranslator
}) {
  if (language === "zh") {
    return t("sidebar.languageZh")
  }

  if (language === "en") {
    return t("sidebar.languageEnglish")
  }

  return t("sidebar.languageSystem")
}

function isResolvedCanvasThemeDark(mode: CanvasHostThemeMode) {
  if (mode === "dark") {
    return true
  }

  if (mode === "light") {
    return false
  }

  return typeof document !== "undefined"
    ? document.documentElement.classList.contains("dark")
    : false
}

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
  const { t } = useHostI18n()
  const label = artifact.title
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
            aria-label={t("sidebar.artifactActions", { label })}
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
            label={t("sidebar.rename")}
            onSelect={(event) => {
              event.preventDefault()
              setRenameOpen(true)
            }}
          />
          <HostDropdownItem
            icon={Trash2Icon}
            label={t("sidebar.delete")}
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
              <DialogTitle>{t("sidebar.renameArtifactTitle")}</DialogTitle>
              <DialogDescription>
                {t("sidebar.renameArtifactDescription")}
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
                  {t("sidebar.cancel")}
                </HostButton>
              </DialogClose>
              <HostButton type="submit">{t("sidebar.save")}</HostButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("sidebar.deleteArtifactTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("sidebar.deleteArtifactDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {status ? <p className="canvas-sidebar-dialog-status">{status}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel>{t("sidebar.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                void confirmDelete()
              }}
              variant="destructive"
            >
              {t("sidebar.delete")}
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
  const { t } = useHostI18n()
  const activeThread =
    activeThreadId
      ? threads.find((thread) => thread.id === activeThreadId)
      : null
  const activeThreadMissing = Boolean(activeThreadId && !activeThread && !loading)
  const missingThreadOption: HostSelectOption[] =
    activeThreadMissing && activeThreadId
      ? [
          {
            label: t("sidebar.currentThread", {
              threadId: shortCodexThreadId(activeThreadId),
            }),
            triggerLabel: shortCodexThreadId(activeThreadId),
            value: activeThreadId,
          },
        ]
      : []
  const options: HostSelectOption[] = loading
    ? [
        {
          label: t("sidebar.loadingThreads"),
          value: newCodexThreadValue,
        },
      ]
    : [
        {
          label: t("sidebar.newThread"),
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

  return (
    <HostSelect
      disabled={loading}
      label={error ? t("sidebar.codexThreadUnavailable") : t("sidebar.codexThread")}
      layout={layout}
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
  const { t } = useHostI18n()
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <SidebarMenu className="canvas-sidebar-menu">
        <HostSidebarAction
          icon={SearchIcon}
          label={t("sidebar.search")}
          onClick={() => setOpen(true)}
          type="button"
        />
      </SidebarMenu>
      <HostCommandDialog
        className="sm:max-w-md"
        description={t("sidebar.searchDescription")}
        onOpenChange={setOpen}
        open={open}
        title={t("sidebar.searchTitle")}
      >
        <HostCommand>
          <HostCommandInput placeholder={t("sidebar.searchPlaceholder")} />
          <HostCommandList>
            <HostCommandEmpty>{t("artifact.noArtifactsTitle")}</HostCommandEmpty>
            <HostCommandGroup heading={t("sidebar.artifacts")}>
              {artifacts.map((artifact) => {
                const label = artifact.title
                const fileLabel = artifactLabel(artifact.filePath)

                return (
                  <HostCommandItem
                    icon={FileTextIcon}
                    key={artifact.filePath}
                    keywords={[label, fileLabel, artifact.filePath]}
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
