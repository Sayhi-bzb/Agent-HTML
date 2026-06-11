import * as React from "react"

import type { CodexThread } from "./api/api"
import { createArtifact } from "./api/api"
import { CreateArtifactSurface } from "./artifact/create-artifact-surface"
import { ArtifactSurface } from "./artifact/artifact-surface"
import {
  createArtifactPendingTimeoutMs,
  failCreateArtifactJob,
  shouldFailCreateArtifactJob,
} from "./artifact/create-artifact-job"
import { useArtifactRegistry } from "./artifact/use-artifact-registry"
import {
  readCanvasHostPreferences,
  type CanvasCreateArtifactJob,
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
import {
  createArtifactFilePathForRequest,
  fetchPipelineThreads,
} from "./pipeline"
import { ReactCanvasSidebar } from "./navigation/sidebar"
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

type CanvasHostMode = "artifact" | "create-artifact"

export function resolveInitialCanvasHostMode(
  createArtifactJob: CanvasCreateArtifactJob | null
): CanvasHostMode {
  return createArtifactJob && createArtifactJob.phase !== "failed"
    ? "create-artifact"
    : "artifact"
}

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
  const initialHostTranslator = React.useMemo(
    () =>
      createHostTranslator(
        resolveCanvasHostLocale({
          language: initialPreferences.activeLanguage,
        })
      ),
    [initialPreferences.activeLanguage]
  )
  const [leftSidebarOpen, setLeftSidebarOpen] = React.useState(
    initialPreferences.leftSidebarOpen
  )
  const [leftSidebarAutoCollapsed, setLeftSidebarAutoCollapsed] =
    React.useState(() =>
      shouldAutoCollapseCanvasHostSidebar(
        typeof window === "undefined" ? null : window
      )
    )
  const [createArtifactDraft, setCreateArtifactDraft] = React.useState("")
  const [createArtifactStatus, setCreateArtifactStatus] = React.useState(() => {
    const job = initialPreferences.createArtifactJob

    if (!job) {
      return ""
    }

    if (job.phase === "failed") {
      return job.error ?? initialHostTranslator("app.artifactCreationFailed")
    }

    return job.phase === "starting"
      ? initialHostTranslator("app.creatingArtifact")
      : initialHostTranslator("app.waitingForArtifact")
  })
  const [createArtifactJob, setCreateArtifactJob] =
    React.useState<CanvasCreateArtifactJob | null>(
      initialPreferences.createArtifactJob
    )
  const [activeHostMode, setActiveHostMode] = React.useState<CanvasHostMode>(
    () => resolveInitialCanvasHostMode(initialPreferences.createArtifactJob)
  )
  const [activeThemePresetId, setActiveThemePresetId] =
    React.useState<CanvasThemePresetId>(initialPreferences.activeThemePresetId)
  const [activeThemeMode, setActiveThemeMode] =
    React.useState<CanvasHostThemeMode>(initialPreferences.activeThemeMode)
  const [activeLanguage, setActiveLanguage] =
    React.useState<CanvasHostLanguage>(initialPreferences.activeLanguage)
  const [activeSidebarView, setActiveSidebarView] =
    React.useState<CanvasSidebarView>(initialPreferences.activeSidebarView)
  const [activeThemeEditorSectionId, setActiveThemeEditorSectionId] =
    React.useState<CanvasThemeEditorSectionId>(
      initialPreferences.activeThemeEditorSectionId
    )
  const [activeCodexThreadId, setActiveCodexThreadId] =
    React.useState<string | null>(initialPreferences.activeCodexThreadId)
  const [codexThreads, setCodexThreads] = React.useState<CodexThread[]>([])
  const [codexThreadsLoading, setCodexThreadsLoading] = React.useState(true)
  const [codexThreadsError, setCodexThreadsError] =
    React.useState<string | null>(null)
  const activeFilePathRef = React.useRef<string | null>(null)
  const createArtifactJobRef = React.useRef<CanvasCreateArtifactJob | null>(null)
  const t = React.useMemo(
    () =>
      createHostTranslator(
        resolveCanvasHostLocale({
          language: activeLanguage,
        })
      ),
    [activeLanguage]
  )

  const selectArtifactMode = React.useCallback(() => {
    setActiveHostMode("artifact")
  }, [])
  const effectiveLeftSidebarOpen =
    leftSidebarOpen && !leftSidebarAutoCollapsed
  const setEffectiveLeftSidebarOpen = React.useCallback((open: boolean) => {
    setLeftSidebarAutoCollapsed(false)
    setLeftSidebarOpen(open)
  }, [])
  const handlePendingArtifactReady = React.useCallback(() => {
    createArtifactJobRef.current = null
    setActiveHostMode("artifact")
    setCreateArtifactJob(null)
    setCreateArtifactStatus(t("app.artifactReady"))
  }, [t])
  const handlePendingArtifactFailure = React.useCallback((error: string) => {
    setCreateArtifactJob((currentJob) => {
      if (!currentJob || currentJob.phase === "failed") {
        return currentJob
      }

      const failedJob = failCreateArtifactJob({
        error,
        job: currentJob,
      })
      createArtifactJobRef.current = failedJob
      setCreateArtifactStatus(error)
      return failedJob
    })
  }, [])
  const clearCreateArtifactJob = React.useCallback(() => {
    createArtifactJobRef.current = null
    setCreateArtifactJob(null)
    setCreateArtifactStatus("")
  }, [])
  const {
    activeArtifact,
    activeIssues,
    artifactRegistryVersion,
    artifacts,
    artifactsLoading,
    deleteExistingArtifact,
    guardIssues,
    loadError,
    refreshArtifacts,
    renameExistingArtifact,
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
  const {
    resetThemePreview,
    themeDraft,
    themePresets,
    themeRuntimeVariables,
    updateThemeVariable,
  } = useCanvasHostTheme({
    activeThemeMode,
    activeThemePresetId,
  })

  activeFilePathRef.current = resolvedActiveFilePath
  createArtifactJobRef.current = createArtifactJob

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

  React.useEffect(() => {
    if (!createArtifactJob || createArtifactJob.phase === "failed") {
      return
    }

    const failExpiredJob = () => {
      setCreateArtifactJob((currentJob) => {
        if (
          !currentJob ||
          !shouldFailCreateArtifactJob({
            job: currentJob,
            now: Date.now(),
          })
        ) {
          return currentJob
        }

        const error = t("app.artifactCreationTimedOut", {
          filePath: currentJob.filePath,
        })
        const failedJob = failCreateArtifactJob({
          error,
          job: currentJob,
        })
        createArtifactJobRef.current = failedJob
        setCreateArtifactStatus(error)
        return failedJob
      })
    }
    const remainingMs = Math.max(
      0,
      createArtifactPendingTimeoutMs - (Date.now() - createArtifactJob.startedAt)
    )
    const timeoutId = window.setTimeout(failExpiredJob, remainingMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [createArtifactJob, t])

  const refreshCodexThreads = React.useCallback(async () => {
    setCodexThreadsLoading(true)
    try {
      const data = await fetchPipelineThreads()
      setCodexThreads(data.threads ?? [])
      setCodexThreadsError(null)
    } catch (error) {
      setCodexThreadsError(error instanceof Error ? error.message : String(error))
    } finally {
      setCodexThreadsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void refreshCodexThreads()
  }, [refreshCodexThreads])

  const {
    setPromptStatus,
    setPromptTarget,
  } = useCanvasPromptLifecycle({
    activeCodexThreadId,
    onCodexThreadChange: setActiveCodexThreadId,
    onThreadsRefresh: refreshCodexThreads,
    resolvedActiveFilePath,
    t,
  })

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
    setActiveHostMode("create-artifact")
  }, [])

  const submitCreateArtifactPrompt = React.useCallback(async (request: string) => {
    const artifactFilePath = createArtifactFilePathForRequest({
      existingFilePaths: artifacts.map((artifact) => artifact.filePath),
      request,
    })
    const nextJob: CanvasCreateArtifactJob = {
      filePath: artifactFilePath,
      phase: "starting",
      request,
      startedAt: Date.now(),
    }

    try {
      createArtifactJobRef.current = nextJob
      setCreateArtifactJob(nextJob)
      setCreateArtifactStatus(t("app.creatingArtifact"))
      const createdArtifact = await createArtifact({
        filePath: artifactFilePath,
        request,
      })
      const waitingJob: CanvasCreateArtifactJob = {
        ...nextJob,
        phase: "waiting-for-artifact",
      }

      createArtifactJobRef.current = waitingJob
      setCreateArtifactJob(waitingJob)
      setCreateArtifactStatus(t("app.waitingForArtifact"))
      await refreshArtifacts({
        currentFilePath: createdArtifact.filePath,
        forceRefresh: true,
      })
      createArtifactJobRef.current = null
      setCreateArtifactJob(null)
      setCreateArtifactDraft("")
      setActiveHostMode("artifact")
      setCreateArtifactStatus(t("app.artifactReady"))
    } catch (submitError: unknown) {
      const errorMessage =
        submitError instanceof Error ? submitError.message : String(submitError)
      const failedJob: CanvasCreateArtifactJob = {
        ...nextJob,
        error: errorMessage,
        phase: "failed",
      }

      createArtifactJobRef.current = failedJob
      setCreateArtifactJob(failedJob)
      setCreateArtifactStatus(errorMessage)
      throw submitError
    }
  }, [
    artifacts,
    refreshArtifacts,
    t,
  ])

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
        <div className="canvas-host-shell">
          <SidebarProvider
            className="contents"
            keyboardShortcut={false}
            open={effectiveLeftSidebarOpen}
            onOpenChange={setEffectiveLeftSidebarOpen}
          >
            <ReactCanvasSidebar
              activeFilePath={resolvedActiveFilePath}
              activeSectionId={activeThemeEditorSectionId}
              activeCodexThreadId={activeCodexThreadId}
              activeLanguage={activeLanguage}
              activeSidebarView={activeSidebarView}
              activeThemeMode={activeThemeMode}
              activeThemePresetId={activeThemePresetId}
              createArtifactActive={activeHostMode === "create-artifact"}
              createArtifactPending={
                createArtifactJob !== null && createArtifactJob.phase !== "failed"
              }
              artifactsLoading={artifactsLoading}
              artifacts={artifacts}
              codexThreads={codexThreads}
              codexThreadsError={codexThreadsError}
              codexThreadsLoading={codexThreadsLoading}
              guardIssues={guardIssues}
              onDeleteArtifact={deleteExistingArtifact}
              onRenameArtifact={renameExistingArtifact}
              onSelectArtifact={selectArtifact}
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
            />
          </SidebarProvider>
          <SidebarInset className="min-h-svh min-w-0 overflow-hidden">
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
              guardIssues={activeIssues}
              loadError={loadError}
            />
          )}
          </SidebarInset>
        </div>
      </HostI18nProvider>
    </TooltipProvider>
  )
}
