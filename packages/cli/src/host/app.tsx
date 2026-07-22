import * as React from "react"

import type { CodexThread } from "./api/api"
import { CreateArtifactSurface } from "./artifact/create-artifact-surface"
import { ArtifactDeleteDialog } from "./artifact/artifact-delete-dialog"
import { ArtifactSurface } from "./artifact/artifact-surface"
import { useCreateArtifactWorkflow } from "./artifact/use-create-artifact-workflow"
import { useArtifactRegistry } from "./artifact/use-artifact-registry"
import { CanvasSurface } from "./canvas/canvas-surface"
import { useCanvasRegistry } from "./canvas/use-canvas-registry"
import {
  readCanvasHostPreferences,
  type CanvasHostLanguage,
  type CanvasHostThemeMode,
} from "./preferences/canvas-host-preferences"
import { useCanvasHostPreferencesPersistence } from "./preferences/use-canvas-host-preferences"
import { useCanvasPromptLifecycle } from "./prompt/use-canvas-prompt-lifecycle"
import {
  canvasInteractionEventName,
  clearCanvasInteractionSnapshots,
  createCanvasInteractionEventListener,
} from "./interaction/interaction-store"
import { fetchPipelineThreads } from "./pipeline"
import { HostAgentMenu } from "./navigation/agent-menu"
import { ArtifactSearchDialog } from "./navigation/artifact-search-dialog"
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
import { AppearanceSurface } from "./theme/appearance-surface"
import { useCanvasHostTheme } from "./theme/use-canvas-host-theme"
import {
  createHostTranslator,
  HostI18nProvider,
  resolveCanvasHostLocale,
} from "./i18n/host-i18n"
import type { CanvasThemeEditorSectionId } from "./theme/theme-editor-contract"
import { TooltipProvider } from "#agent-html-playground/components/ui/tooltip"
import type { CanvasThemePresetId } from "#agent-html-playground/theme/presets"
import { CodexThreadManagerSurface } from "./thread/thread-manager-surface"
import { CodexThreadSurface } from "./thread/thread-surface"
import { codexThreadLabel } from "./thread/thread-label"
import { resolveActiveCodexThreadLabel } from "./thread/thread-label"
import {
  createWorkspaceTab,
  workspaceTabReducer,
  type WorkspaceTabTarget,
} from "./navigation/workspace-tabs"

export { resolveInitialCanvasHostMode } from "./artifact/use-create-artifact-workflow"

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
  const [artifactSearchOpen, setArtifactSearchOpen] = React.useState(false)
  const [workspaceTabSession, dispatchWorkspaceTab] = React.useReducer(
    workspaceTabReducer,
    initialPreferences.workspaceTabSession
  )
  const [desktopNavigationOrigin, setDesktopNavigationOrigin] = React.useState<
    string | null
  >(null)
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
  const workspaceTabsInitializedRef = React.useRef(false)
  const activeWorkspaceTab =
    workspaceTabSession.tabs.find(
      (tab) => tab.id === workspaceTabSession.activeTabId
    ) ?? null
  const selectedCodexThreadId =
    activeWorkspaceTab?.kind === "thread"
      ? activeWorkspaceTab.threadId
      : activeCodexThreadId
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
  const handleWorkspacePendingArtifactReady = React.useCallback(
    (event: { filePath: string }) => {
      handlePendingArtifactReady(event)
      dispatchWorkspaceTab({
        tab: { filePath: event.filePath, kind: "artifact" },
        type: "open",
      })
    },
    [handlePendingArtifactReady]
  )
  const {
    artifactRegistryVersion,
    artifacts,
    artifactsLoading,
    deleteExistingArtifact,
    diagnostics,
    loadError,
    refreshArtifacts,
    renameExistingArtifactTitle,
    resolvedActiveFilePath,
    selectArtifact,
  } = useArtifactRegistry({
    onPendingArtifactFailure: handlePendingArtifactFailure,
    onPendingArtifactReady: handleWorkspacePendingArtifactReady,
    onSelectArtifactMode: selectArtifactMode,
    pendingFilePath:
      createArtifactJob && createArtifactJob.phase !== "failed"
        ? createArtifactJob.filePath
        : null,
  })
  const activeArtifact =
    activeWorkspaceTab?.kind === "artifact"
      ? (artifacts.find(
          (artifact) => artifact.filePath === activeWorkspaceTab.filePath
        ) ?? null)
      : null
  const activeDiagnostics =
    activeWorkspaceTab?.kind === "artifact"
      ? diagnostics.filter(
          (diagnostic) => diagnostic.filePath === activeWorkspaceTab.filePath
        )
      : []
  const previewArtifact =
    artifacts.find(
      (artifact) => artifact.filePath === resolvedActiveFilePath
    ) ?? null
  const previewDiagnostics = resolvedActiveFilePath
    ? diagnostics.filter(
        (diagnostic) => diagnostic.filePath === resolvedActiveFilePath
      )
    : []
  const { canvasLoadError, canvasRegistryVersion, canvases, canvasesLoading } =
    useCanvasRegistry()
  const selectArtifactSurface = React.useCallback(
    (filePath: string) => {
      if (!artifacts.some((artifact) => artifact.filePath === filePath)) return
      selectArtifactMode()
      dispatchWorkspaceTab({
        tab: { filePath, kind: "artifact" },
        type: "open",
      })
    },
    [artifacts, selectArtifactMode]
  )
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

  React.useEffect(() => {
    activeFilePathRef.current = resolvedActiveFilePath
  }, [resolvedActiveFilePath])

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
    const timeoutId = window.setTimeout(() => void refreshCodexThreads(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [refreshCodexThreads])

  const { setPromptStatus, setPromptTarget } = useCanvasPromptLifecycle({
    activeCodexThreadId,
    onCodexThreadChange: setActiveCodexThreadId,
    onThreadsRefresh: refreshCodexThreads,
    resolvedActiveFilePath,
    t,
  })
  const selectCanvas = React.useCallback(
    (filePath: string) => {
      if (!canvases.some((canvas) => canvas.filePath === filePath)) return
      selectArtifactMode()
      dispatchWorkspaceTab({
        tab: { filePath, kind: "canvas" },
        type: "open",
      })
    },
    [canvases, selectArtifactMode]
  )

  const openWorkspaceTab = React.useCallback(
    (tab: WorkspaceTabTarget) => {
      selectArtifactMode()
      dispatchWorkspaceTab({ tab, type: "open" })
    },
    [selectArtifactMode]
  )

  const openCodexThreadManager = React.useCallback(() => {
    openWorkspaceTab({ kind: "thread-manager" })
  }, [openWorkspaceTab])

  const openAppearance = React.useCallback(() => {
    openWorkspaceTab({ kind: "appearance" })
  }, [openWorkspaceTab])

  const selectCodexThread = React.useCallback(
    (threadId: string | null) => {
      setActiveCodexThreadId(threadId)
      if (threadId) {
        openWorkspaceTab({ kind: "thread", threadId })
      }
    },
    [openWorkspaceTab]
  )

  React.useEffect(() => {
    if (!activeWorkspaceTab) return
    setPromptTarget(null)
    setPromptStatus("")
    selectArtifactMode()

    if (activeWorkspaceTab.kind === "artifact") {
      selectArtifact(activeWorkspaceTab.filePath)
    }
  }, [
    activeWorkspaceTab,
    selectArtifact,
    selectArtifactMode,
    setPromptStatus,
    setPromptTarget,
  ])

  React.useEffect(() => {
    if (artifactsLoading || canvasesLoading) return

    dispatchWorkspaceTab({
      artifactFilePaths: new Set(
        artifacts.map((artifact) => artifact.filePath)
      ),
      canvasFilePaths: new Set(canvases.map((canvas) => canvas.filePath)),
      ...(codexThreadsLoading || codexThreadsError
        ? {}
        : { threadIds: new Set(codexThreads.map((thread) => thread.id)) }),
      type: "reconcile",
    })

    if (!workspaceTabsInitializedRef.current) {
      workspaceTabsInitializedRef.current = true
      if (workspaceTabSession.tabs.length === 0 && resolvedActiveFilePath) {
        dispatchWorkspaceTab({
          tab: { filePath: resolvedActiveFilePath, kind: "artifact" },
          type: "open",
        })
      }
    }
  }, [
    artifacts,
    artifactsLoading,
    canvases,
    canvasesLoading,
    codexThreads,
    codexThreadsError,
    codexThreadsLoading,
    resolvedActiveFilePath,
    workspaceTabSession.tabs,
  ])

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

  const selectThemePreset = React.useCallback(
    (presetId: CanvasThemePresetId) => {
      setActiveThemePresetId(presetId)
      resetThemePreview()
    },
    [resetThemePreview]
  )

  const selectCreateArtifact = React.useCallback(() => {
    setPromptTarget(null)
    setPromptStatus("")
    selectCreateArtifactMode()
  }, [selectCreateArtifactMode, setPromptStatus, setPromptTarget])

  const desktopNavigationSnapshot = React.useMemo<CanvasNavigationSnapshot>(
    () => ({
      activeCodexThreadLabel: resolveActiveCodexThreadLabel({
        activeThreadId: selectedCodexThreadId,
        threads: codexThreads,
      }),
      activeFilePath:
        activeWorkspaceTab?.kind === "artifact" ||
        activeWorkspaceTab?.kind === "canvas"
          ? activeWorkspaceTab.filePath
          : null,
      activeLanguage,
      activeThemePresetId,
      artifacts: artifacts.map(({ filePath, title }) => ({ filePath, title })),
      artifactsLoading,
      canvases: canvases.map(({ filePath, title }) => ({ filePath, title })),
      canvasesLoading,
      codexThreadManagerActive: activeWorkspaceTab?.kind === "thread-manager",
      createArtifactActive: activeHostMode === "create-artifact",
      tabSession: workspaceTabSession,
      themePresets: themePresets.map(({ id, label }) => ({ id, label })),
      threads: codexThreads.map((thread) => ({
        id: thread.id,
        title: codexThreadLabel(thread),
      })),
      threadsLoading: codexThreadsLoading,
      version: canvasNavigationSnapshotVersion,
    }),
    [
      activeHostMode,
      activeLanguage,
      activeThemePresetId,
      artifacts,
      artifactsLoading,
      canvases,
      canvasesLoading,
      codexThreads,
      codexThreadsLoading,
      activeWorkspaceTab,
      selectedCodexThreadId,
      themePresets,
      workspaceTabSession,
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
        if (request.session) {
          dispatchWorkspaceTab({ session: request.session, type: "hydrate" })
          return
        }
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
        canvasFilePaths: canvases.map((canvas) => canvas.filePath),
        command: message.command,
        onActivateTab: (tabId) => {
          selectArtifactMode()
          dispatchWorkspaceTab({ tabId, type: "activate" })
        },
        onCloseCodexThreadManager: () =>
          dispatchWorkspaceTab({ tabId: "threads", type: "close" }),
        onCloseTab: (tabId) => dispatchWorkspaceTab({ tabId, type: "close" }),
        onCreateArtifact: selectCreateArtifact,
        onOpenArtifactSearch: () => setArtifactSearchOpen(true),
        onOpenCodexThreadManager: openCodexThreadManager,
        onOpenTab: openWorkspaceTab,
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
        onSelectArtifact: selectArtifactSurface,
        onSelectCanvas: selectCanvas,
        onSetLanguage: setActiveLanguage,
        onSetThemeMode: setActiveThemeMode,
        onSetThemePreset: (presetId) =>
          selectThemePreset(presetId as CanvasThemePresetId),
        onToggleThemeMode: () =>
          setActiveThemeMode(
            document.documentElement.classList.contains("dark")
              ? "light"
              : "dark"
          ),
        themePresetIds: themePresets.map((preset) => preset.id),
      })
    }

    window.addEventListener("message", handleDesktopNavigationMessage)
    return () => {
      window.removeEventListener("message", handleDesktopNavigationMessage)
    }
  }, [
    artifacts,
    canvases,
    desktopNavigationSnapshot,
    requestDeleteArtifact,
    renameExistingArtifactTitle,
    selectArtifactSurface,
    selectCanvas,
    selectCreateArtifact,
    selectThemePreset,
    selectArtifactMode,
    openCodexThreadManager,
    openWorkspaceTab,
    themePresets,
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
    activeThemeEditorSectionId,
    activeThemeMode,
    activeThemePresetId,
    createArtifactJob,
    workspaceTabSession,
  })

  const activeCodexThreadLabel = resolveActiveCodexThreadLabel({
    activeThreadId: selectedCodexThreadId,
    threads: codexThreads,
  })

  return (
    <TooltipProvider>
      <HostI18nProvider language={activeLanguage}>
        <>
          <div
            className="canvas-host-shell"
            data-toolbar={desktopNavigationOrigin ? "absent" : "present"}
          >
            {!desktopNavigationOrigin ? (
              <div className="canvas-host-toolbar">
                <HostAgentMenu
                  activeLanguage={activeLanguage}
                  activeThemePresetId={activeThemePresetId}
                  activeThemeMode={activeThemeMode}
                  activeThreadLabel={activeCodexThreadLabel}
                  onOpenAppearance={openAppearance}
                  onOpenSearch={() => setArtifactSearchOpen(true)}
                  onOpenThreads={openCodexThreadManager}
                  onSelectLanguage={setActiveLanguage}
                  onSelectThemeMode={setActiveThemeMode}
                  onSelectThemePreset={selectThemePreset}
                  themePresets={themePresets}
                />
              </div>
            ) : null}
            <div className="canvas-host-workspace">
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
              ) : activeWorkspaceTab?.kind === "appearance" ? (
                <AppearanceSurface
                  activePresetId={activeThemePresetId}
                  activeSectionId={activeThemeEditorSectionId}
                  draft={themeDraft}
                  onResetPreview={resetThemePreview}
                  onSelectPreset={selectThemePreset}
                  onSelectSection={setActiveThemeEditorSectionId}
                  onVariableChange={updateThemeVariable}
                  presets={themePresets}
                  preview={
                    <ArtifactSurface
                      activeFilePath={resolvedActiveFilePath}
                      artifactCount={artifacts.length}
                      artifactRegistryVersion={artifactRegistryVersion}
                      artifactsLoading={artifactsLoading}
                      blocks={previewArtifact?.blocks}
                      diagnostics={previewDiagnostics}
                      loadError={loadError}
                    />
                  }
                  previewDirty={isCanvasThemeDraftDirty(themeDraft)}
                  runtimeVariables={themeRuntimeVariables}
                />
              ) : activeWorkspaceTab?.kind === "thread-manager" ? (
                <CodexThreadManagerSurface
                  activeThreadId={selectedCodexThreadId}
                  error={codexThreadsError}
                  loading={codexThreadsLoading}
                  onRefresh={() => void refreshCodexThreads()}
                  onSelectThread={selectCodexThread}
                  threads={codexThreads}
                />
              ) : activeWorkspaceTab?.kind === "thread" ? (
                <CodexThreadSurface
                  key={activeWorkspaceTab.threadId}
                  thread={
                    codexThreads.find(
                      (thread) => thread.id === activeWorkspaceTab.threadId
                    ) ?? {
                      id: activeWorkspaceTab.threadId,
                      name: null,
                      status: null,
                    }
                  }
                />
              ) : activeWorkspaceTab?.kind === "canvas" ? (
                <CanvasSurface
                  activeFilePath={activeWorkspaceTab.filePath}
                  canvasCount={canvases.length}
                  canvasRegistryVersion={canvasRegistryVersion}
                  canvasesLoading={canvasesLoading}
                  loadError={canvasLoadError}
                />
              ) : activeWorkspaceTab?.kind === "artifact" ? (
                <ArtifactSurface
                  activeFilePath={activeWorkspaceTab.filePath}
                  blocks={activeArtifact?.blocks}
                  artifactCount={artifacts.length}
                  artifactRegistryVersion={artifactRegistryVersion}
                  artifactsLoading={artifactsLoading}
                  diagnostics={activeDiagnostics}
                  loadError={loadError}
                />
              ) : (
                <main className="canvas-surface-root canvas-workspace-empty">
                  <p>{t("artifact.noArtifactsTitle")}</p>
                </main>
              )}
            </div>
          </div>
          <ArtifactSearchDialog
            artifacts={artifacts}
            canvases={canvases}
            onOpenChange={setArtifactSearchOpen}
            onSelectArtifact={selectArtifactSurface}
            onSelectCanvas={selectCanvas}
            open={artifactSearchOpen}
          />
          {pendingDeleteArtifact ? (
            <ArtifactDeleteDialog
              artifact={pendingDeleteArtifact}
              key={pendingDeleteArtifact.filePath}
              onDelete={async (filePath) => {
                await deleteExistingArtifact(filePath)
                dispatchWorkspaceTab({
                  tabId: createWorkspaceTab({
                    filePath,
                    kind: "artifact",
                  }).id,
                  type: "close",
                })
              }}
              onDismiss={() => setPendingDeleteArtifact(null)}
            />
          ) : null}
        </>
      </HostI18nProvider>
    </TooltipProvider>
  )
}
