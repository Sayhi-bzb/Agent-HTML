import {
  ArrowLeftIcon,
  BookOpenTextIcon,
  FileTextIcon,
  FilePlus2Icon,
  LanguagesIcon,
  LoaderCircleIcon,
  MoonIcon,
  PaletteIcon,
  SearchIcon,
  SparklesIcon,
  SunIcon,
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
  Popover,
  PopoverTrigger,
} from "#agent-html-playground/components/ui/popover"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "#agent-html-playground/components/ui/sidebar"
import type {
  CanvasThemePreset,
  CanvasThemePresetId,
} from "#agent-html-playground/theme/presets"
import type { Artifact } from "../host-contracts"
import type {
  CanvasHostLanguage,
  CanvasHostThemeMode,
  CanvasSidebarView,
} from "../preferences/canvas-host-preferences"
import { GithubMarkIcon } from "../ui/brand-icons"
import {
  HostCommand,
  HostCommandDialog,
  HostCommandEmpty,
  HostCommandGroup,
  HostCommandInput,
  HostCommandItem,
  HostCommandList,
} from "../ui/command"
import { HostDropdownLabel } from "../ui/dropdown"
import { HostIconButton } from "../ui/icon-button"
import { HostPopoverAction, HostPopoverContent } from "../ui/popover"
import { useHostI18n } from "../i18n/host-i18n"
import { HostSidebarAction, HostSidebarStatus } from "../ui/sidebar-action"
import type { HostSelectOption } from "../ui/select"
import { HostSelect } from "../ui/select"

export function ReactCanvasSidebar({
  activeCodexThreadId,
  activeLanguage,
  activeSectionId,
  activeSidebarView,
  activeThemeMode,
  activeThemePresetId,
  createArtifactActive,
  createArtifactPending,
  artifacts,
  codexThreads,
  codexThreadsError,
  codexThreadsLoading,
  onSelectArtifact,
  onSelectCodexThread,
  onSelectLanguage,
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
  activeCodexThreadId: string | null
  activeLanguage: CanvasHostLanguage
  activeSectionId: CanvasThemeEditorSectionId
  activeSidebarView: CanvasSidebarView
  activeThemeMode: CanvasHostThemeMode
  activeThemePresetId: CanvasThemePresetId
  createArtifactActive: boolean
  createArtifactPending: boolean
  artifacts: Artifact[]
  codexThreads: CodexThread[]
  codexThreadsError: string | null
  codexThreadsLoading: boolean
  onSelectArtifact: (filePath: string) => void
  onSelectCodexThread: (threadId: string | null) => void
  onSelectLanguage: (language: CanvasHostLanguage) => void
  onSelectSection: (sectionId: CanvasThemeEditorSectionId) => void
  onSelectSidebarView: (view: CanvasSidebarView) => void
  onSelectThemeMode: (mode: CanvasHostThemeMode) => void
  onSelectThemePreset: (presetId: CanvasThemePresetId) => void
  onResetThemePreview: () => void
  onSelectCreateArtifact: () => void
  onThemeVariableChange: (name: CanvasThemeVariableName, value: string) => void
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
        ) : null}
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
                      <HostDropdownLabel>
                        {t("sidebar.language")}
                      </HostDropdownLabel>
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
  const activeThread = activeThreadId
    ? threads.find((thread) => thread.id === activeThreadId)
    : null
  const activeThreadMissing = Boolean(
    activeThreadId && !activeThread && !loading
  )
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
      label={
        error ? t("sidebar.codexThreadUnavailable") : t("sidebar.codexThread")
      }
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
            <HostCommandEmpty>
              {t("artifact.noArtifactsTitle")}
            </HostCommandEmpty>
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
