import * as React from "react"

import type { CodexThread } from "./api/api"
import { CreateArtifactSurface } from "./artifact/create-artifact-surface"
import { ArtifactDeleteDialog } from "./artifact/artifact-delete-dialog"
import { ArtifactSurface } from "./artifact/artifact-surface"
import { useCreateArtifactWorkflow } from "./artifact/use-create-artifact-workflow"
import { useArtifactRegistry } from "./artifact/use-artifact-registry"
import {
  readCanvasHostPreferences,
  type CanvasHostLanguage,
  type CanvasHostThemeMode,
  type CanvasSidebarView,
} from "./preferences/canvas-host-preferences"
import { useCanvasHostPreferencesPersistence } from "./preferences/use-canvas-host-preferences"
import { useCanvasPromptLifecycle } from "./prompt/use-canvas-prompt-lifecycle"
import {
  canvasInteractionEventName,
  clearCanvasInteractionSnapshots,
  createCanvasInteractionEventListener,
} from "./interaction/interaction-store"
import { fetchPipelineThreads } from "./pipeline"
import { ReactCanvasSidebar } from "./navigation/sidebar"
import {
  applyCanvasNavigationCommand,
  publishArtifactTitleRenameResult,
  publishCanvasNavigation,
  readTrustedCanvasNavigationCommand,
  readTrustedCanvasNavigationRequest,
} from "./navigation/desktop-navigation"
import { isArtifactSearchShortcut } from "./navigation/artifact-search-shortcut"
import {
  canvasNavigationSnapshotVersion,
  type CanvasNavigationArtifact,
  type CanvasNavigationSnapshot,
} from "./navigation/navigation-sync-contract"
import {
  canvasHostMobileDocsUrl,
  shouldRedirectCanvasHostToDocs,
} from "./mobile-docs-redirect"
import { isCanvasThemeDraftDirty } from "./theme/theme-draft"
import { useCanvasHostTheme } from "./theme/use-canvas-host-theme"
import {
  createHostTranslator,
  HostI18nProvider,
  resolveCanvasHostLocale,
} from "./i18n/host-i18n"
import type { CanvasThemeEditorSectionId } from "./theme/theme-editor-sections"
import {
  SidebarInset,
  SidebarProvider,
} from "#agent-html-playground/components/ui/sidebar"
import { TooltipProvider } from "#agent-html-playground/components/ui/tooltip"
import type { CanvasThemePresetId } from "#agent-html-playground/theme/presets"
import { PanelLeftIcon } from "lucide-react"
import { HostIconButton } from "./ui/icon-button"

export { resolveInitialCanvasHostMode } from "./artifact/use-create-artifact-workflow"

export const canvasHostCompactDesktopMediaQuery =
  "(min-width: 768px) and (max-width: 1099px)"

export function shouldAutoCollapseCanvasHostSidebar(
  viewport:
    | {
        matchMedia?: (query: string) => { matches: boolean }
      }
    | null
    | undefined
) {
  return Boolean(
    viewport?.matchMedia?.(canvasHostCompactDesktopMediaQuery).matches
  )
}

export function ReactCanvasHostApp() {
  if (
    shouldRedirectCanvasHostToDocs(
      typeof window === "undefined" ? null : window
    )
  ) {
    return <ReactCanvasHostMobileRedirect />
  }

  return <ReactCanvasHostWorkbench />
}

function ReactCanvasHostMobileRedirect() {
  React.useEffect(() => {
    window.location.replace(canvasHostMobileDocsUrl)
  }, [])

  return null
}

function ReactCanvasHostWorkbench() {
  const initialPreferences = React.useMemo(
    () => readCanvasHostPreferences(),
    []
  )
  const [leftSidebarOpen, setLeftSidebarOpen] = React.useState(
    initialPreferences.leftSidebarOpen
  )
  const [artifactSearchOpen, setArtifactSearchOpen] = React.useState(false)
  const [desktopNavigationOrigin, setDesktopNavigationOrigin] = React.useState<
    string | null
  >(null)
  const [leftSidebarAutoCollapsed, setLeftSidebarAutoCollapsed] =
    React.useState(() =>
      shouldAutoCollapseCanvasHostSidebar(
        typeof window === "undefined" ? null : window
      )
    )
  const [activeThemePresetId, setActiveThemePresetId] =
    React.useState<CanvasThemePresetId>(initialPreferences.activeThemePresetId)
  const [activeThemeMode, setActiveThemeMode] =
    React.useState<CanvasHostThemeMode>(initialPreferences.activeThemeMode)
  const restoreThemeSelection = React.useCallback(
    ({
      mode,
      presetId,
    }: {
      mode: CanvasHostThemeMode
      presetId: CanvasThemePresetId
    }) => {
      setActiveThemeMode(mode)
      setActiveThemePresetId(presetId)
    },
    []
  )
  const [activeLanguage, setActiveLanguage] =
    React.useState<CanvasHostLanguage>(initialPreferences.activeLanguage)
  const [activeSidebarView, setActiveSidebarView] =
    React.useState<CanvasSidebarView>(initialPreferences.activeSidebarView)
  const [activeThemeEditorSectionId, setActiveThemeEditorSectionId] =
    React.useState<CanvasThemeEditorSectionId>(
      initialPreferences.activeThemeEditorSectionId
    )
  const [activeCodexThreadId, setActiveCodexThreadId] = React.useState<
    string | null
  >(initialPreferences.activeCodexThreadId)
  const [codexThreads, setCodexThreads] = React.useState<CodexThread[]>([])
  const [codexThreadsLoading, setCodexThreadsLoading] = React.useState(true)
  const [codexThreadsError, setCodexThreadsError] = React.useState<
    string | null
  >(null)
  const [pendingDeleteArtifact, setPendingDeleteArtifact] =
    React.useState<CanvasNavigationArtifact | null>(null)
  const activeFilePathRef = React.useRef<string | null>(null)
  const t = React.useMemo(
    () =>
      createHostTranslator(
        resolveCanvasHostLocale({
          language: activeLanguage,
        })
      ),
    [activeLanguage]
  )
  const createArtifactWorkflow = useCreateArtifactWorkflow({
    initialJob: initialPreferences.createArtifactJob,
    t,
  })
  const {
    clear: clearCreateArtifactJob,
    draft: createArtifactDraft,
    job: createArtifactJob,
    mode: activeHostMode,
    onPendingArtifactFailure: handlePendingArtifactFailure,
    onPendingArtifactReady: handlePendingArtifactReady,
    selectArtifactMode,
    selectCreateArtifact: selectCreateArtifactMode,
    setDraft: setCreateArtifactDraft,
    status: createArtifactStatus,
    submit: submitCreateArtifact,
  } = createArtifactWorkflow
  const effectiveLeftSidebarOpen = leftSidebarOpen && !leftSidebarAutoCollapsed
  const setEffectiveLeftSidebarOpen = React.useCallback((open: boolean) => {
    setLeftSidebarAutoCollapsed(false)
    setLeftSidebarOpen(open)
  }, [])
  const {
    activeArtifact,
    activeDiagnostics,
    artifactRegistryVersion,
    artifacts,
    artifactsLoading,
    deleteExistingArtifact,
    loadError,
    refreshArtifacts,
    renameExistingArtifactTitle,
    resolvedActiveFilePath,
    selectArtifact,
  } = useArtifactRegistry({
    onPendingArtifactFailure: handlePendingArtifactFailure,
    onPendingArtifactReady: handlePendingArtifactReady,
    onSelectArtifactMode: selectArtifactMode,
    pendingFilePath:
      createArtifactJob && createArtifactJob.phase !== "failed"
        ? createArtifactJob.filePath
        : null,
  })
  const requestDeleteArtifact = React.useCallback(
    (filePath: string) => {
      const artifact = artifacts.find(
        (candidate) => candidate.filePath === filePath
      )
      setPendingDeleteArtifact(
        artifact ? { filePath: artifact.filePath, title: artifact.title } : null
      )
    },
    [artifacts]
  )
  const {
    resetThemePreview,
    themeDraft,
    themePresets,
    themeRuntimeVariables,
    updateThemeVariable,
  } = useCanvasHostTheme({
    activeThemeMode,
    activeThemePresetId,
    restoreThemeSelection,
  })

  activeFilePathRef.current = resolvedActiveFilePath

  React.useEffect(() => {
    const listener = createCanvasInteractionEventListener({
      getActiveFilePath: () => activeFilePathRef.current,
    })

    window.addEventListener(canvasInteractionEventName, listener)

    return () => {
      window.removeEventListener(canvasInteractionEventName, listener)
      clearCanvasInteractionSnapshots()
    }
  }, [])

  React.useEffect(() => {
    if (resolvedActiveFilePath) {
      clearCanvasInteractionSnapshots(resolvedActiveFilePath)
    }
  }, [resolvedActiveFilePath])

  const refreshCodexThreads = React.useCallback(async () => {
    setCodexThreadsLoading(true)
    try {
      const data = await fetchPipelineThreads()
      setCodexThreads(data.threads ?? [])
      setCodexThreadsError(null)
    } catch (error) {
      setCodexThreadsError(
        error instanceof Error ? error.message : String(error)
      )
    } finally {
      setCodexThreadsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void refreshCodexThreads()
  }, [refreshCodexThreads])

  const { setPromptStatus, setPromptTarget } = useCanvasPromptLifecycle({
    activeCodexThreadId,
    onCodexThreadChange: setActiveCodexThreadId,
    onThreadsRefresh: refreshCodexThreads,
    resolvedActiveFilePath,
    t,
  })

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isArtifactSearchShortcut(event)) {
        return
      }

      event.preventDefault()
      setArtifactSearchOpen(true)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "b" || (!event.metaKey && !event.ctrlKey)) {
        return
      }

      event.preventDefault()
      setEffectiveLeftSidebarOpen(!effectiveLeftSidebarOpen)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [effectiveLeftSidebarOpen, setEffectiveLeftSidebarOpen])

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(canvasHostCompactDesktopMediaQuery)
    const syncCompactSidebar = () => {
      if (mediaQuery.matches) {
        setLeftSidebarAutoCollapsed(true)
      }
    }

    syncCompactSidebar()
    mediaQuery.addEventListener("change", syncCompactSidebar)

    return () => {
      mediaQuery.removeEventListener("change", syncCompactSidebar)
    }
  }, [])

  function selectThemePreset(presetId: CanvasThemePresetId) {
    setActiveThemePresetId(presetId)
    resetThemePreview()
  }

  const selectCreateArtifact = React.useCallback(() => {
    setPromptTarget(null)
    setPromptStatus("")
    selectCreateArtifactMode()
  }, [selectCreateArtifactMode, setPromptStatus, setPromptTarget])

  const desktopNavigationSnapshot = React.useMemo<CanvasNavigationSnapshot>(
    () => ({
      activeFilePath: resolvedActiveFilePath,
      artifacts: artifacts.map(({ filePath, title }) => ({ filePath, title })),
      artifactsLoading,
      createArtifactActive: activeHostMode === "create-artifact",
      leftSidebarOpen: effectiveLeftSidebarOpen,
      version: canvasNavigationSnapshotVersion,
    }),
    [
      activeHostMode,
      artifacts,
      artifactsLoading,
      effectiveLeftSidebarOpen,
      resolvedActiveFilePath,
    ]
  )
  React.useEffect(() => {
    if (window.parent === window || !desktopNavigationOrigin) {
      return
    }

    publishCanvasNavigation({
      snapshot: desktopNavigationSnapshot,
      targetOrigin: desktopNavigationOrigin,
    })
  }, [desktopNavigationOrigin, desktopNavigationSnapshot])

  React.useEffect(() => {
    if (window.parent === window) {
      return
    }

    const parentWindow = window.parent
    const handleDesktopNavigationMessage = (event: MessageEvent<unknown>) => {
      const request = readTrustedCanvasNavigationRequest({
        event,
        parentWindow,
      })
      if (request) {
        setDesktopNavigationOrigin(event.origin)
        publishCanvasNavigation({
          snapshot: desktopNavigationSnapshot,
          targetOrigin: event.origin,
        })
        return
      }

      const message = readTrustedCanvasNavigationCommand({
        event,
        parentWindow,
      })
      if (!message) {
        return
      }

      setDesktopNavigationOrigin(event.origin)

      applyCanvasNavigationCommand({
        artifactFilePaths: artifacts.map((artifact) => artifact.filePath),
        command: message.command,
        onCreateArtifact: selectCreateArtifact,
        onOpenArtifactSearch: () => setArtifactSearchOpen(true),
        onRequestDeleteArtifact: requestDeleteArtifact,
        onRenameArtifactTitle: ({ filePath, requestId, title }) => {
          void renameExistingArtifactTitle({ filePath, title })
            .then((renamed) => {
              publishArtifactTitleRenameResult({
                result: {
                  filePath: renamed.filePath,
                  ok: true,
                  requestId,
                  title: renamed.title,
                },
                target: parentWindow,
                targetOrigin: event.origin,
              })
            })
            .catch((error: unknown) => {
              publishArtifactTitleRenameResult({
                result: {
                  error:
                    (error instanceof Error ? error.message : String(error))
                      .trim()
                      .slice(0, 2_048) || "Unable to rename Artifact title",
                  filePath,
                  ok: false,
                  requestId,
                },
                target: parentWindow,
                targetOrigin: event.origin,
              })
            })
        },
        onSelectArtifact: selectArtifact,
        onSetSidebarOpen: setEffectiveLeftSidebarOpen,
      })
    }

    window.addEventListener("message", handleDesktopNavigationMessage)
    return () => {
      window.removeEventListener("message", handleDesktopNavigationMessage)
    }
  }, [
    artifacts,
    desktopNavigationSnapshot,
    requestDeleteArtifact,
    renameExistingArtifactTitle,
    selectArtifact,
    selectCreateArtifact,
    setEffectiveLeftSidebarOpen,
  ])

  const submitCreateArtifactPrompt = React.useCallback(
    (request: string) =>
      submitCreateArtifact({
        existingFilePaths: artifacts.map((artifact) => artifact.filePath),
        request,
        refreshArtifacts,
      }),
    [artifacts, refreshArtifacts, submitCreateArtifact]
  )

  useCanvasHostPreferencesPersistence({
    activeCodexThreadId,
    activeFilePath: artifacts.length === 0 ? undefined : resolvedActiveFilePath,
    activeLanguage,
    activeSidebarView,
    activeThemeEditorSectionId,
    activeThemeMode,
    activeThemePresetId,
    createArtifactJob,
    leftSidebarOpen,
  })

  return (
    <TooltipProvider>
      <HostI18nProvider language={activeLanguage}>
        <>
          <div className="canvas-host-shell">
            <SidebarProvider
              className="contents"
              keyboardShortcut={false}
              open={effectiveLeftSidebarOpen}
              onOpenChange={setEffectiveLeftSidebarOpen}
            >
              <ReactCanvasSidebar
                artifactSearchOpen={artifactSearchOpen}
                activeSectionId={activeThemeEditorSectionId}
                activeCodexThreadId={activeCodexThreadId}
                activeLanguage={activeLanguage}
                activeSidebarView={activeSidebarView}
                activeThemeMode={activeThemeMode}
                activeThemePresetId={activeThemePresetId}
                createArtifactActive={activeHostMode === "create-artifact"}
                createArtifactPending={
                  createArtifactJob !== null &&
                  createArtifactJob.phase !== "failed"
                }
                artifacts={artifacts}
                codexThreads={codexThreads}
                codexThreadsError={codexThreadsError}
                codexThreadsLoading={codexThreadsLoading}
                onSelectArtifact={selectArtifact}
                onArtifactSearchOpenChange={setArtifactSearchOpen}
                onSelectCodexThread={setActiveCodexThreadId}
                onSelectCreateArtifact={selectCreateArtifact}
                onSelectLanguage={setActiveLanguage}
                onSelectSection={setActiveThemeEditorSectionId}
                onSelectSidebarView={setActiveSidebarView}
                onSelectThemeMode={setActiveThemeMode}
                onSelectThemePreset={selectThemePreset}
                onThemeVariableChange={updateThemeVariable}
                onResetThemePreview={resetThemePreview}
                themeDraft={themeDraft}
                themePreviewDirty={isCanvasThemeDraftDirty(themeDraft)}
                themePresets={themePresets}
                themeRuntimeVariables={themeRuntimeVariables}
                showArtifactSearchAction={
                  typeof window === "undefined" || window.parent === window
                }
              />
            </SidebarProvider>
            <SidebarInset className="h-full min-h-0 min-w-0 overflow-hidden">
              {!desktopNavigationOrigin ? (
                <div className="canvas-host-toolbar">
                  <HostIconButton
                    icon={PanelLeftIcon}
                    label={
                      effectiveLeftSidebarOpen
                        ? t("app.collapseArtifactSidebar")
                        : t("app.expandArtifactSidebar")
                    }
                    onClick={() =>
                      setEffectiveLeftSidebarOpen(!effectiveLeftSidebarOpen)
                    }
                    placement="toolbar"
                    size="icon-sm"
                    tone="neutral"
                    variant="ghost"
                  />
                </div>
              ) : null}
              {activeHostMode === "create-artifact" ? (
                <CreateArtifactSurface
                  disabled={
                    createArtifactJob !== null &&
                    createArtifactJob.phase !== "failed"
                  }
                  draft={createArtifactDraft}
                  onClearPending={clearCreateArtifactJob}
                  onDraftChange={setCreateArtifactDraft}
                  onSubmit={submitCreateArtifactPrompt}
                  pending={
                    createArtifactJob !== null &&
                    createArtifactJob.phase !== "failed"
                  }
                  status={createArtifactStatus}
                />
              ) : (
                <ArtifactSurface
                  activeFilePath={resolvedActiveFilePath}
                  blocks={activeArtifact?.blocks}
                  artifactCount={artifacts.length}
                  artifactRegistryVersion={artifactRegistryVersion}
                  artifactsLoading={artifactsLoading}
                  diagnostics={activeDiagnostics}
                  loadError={loadError}
                />
              )}
            </SidebarInset>
          </div>
          {pendingDeleteArtifact ? (
            <ArtifactDeleteDialog
              artifact={pendingDeleteArtifact}
              key={pendingDeleteArtifact.filePath}
              onDelete={deleteExistingArtifact}
              onDismiss={() => setPendingDeleteArtifact(null)}
            />
          ) : null}
        </>
      </HostI18nProvider>
    </TooltipProvider>
  )
}
