import * as React from "react"

import {
  deleteArtifact,
  fetchArtifacts,
  renameArtifact,
  type CodexThread,
} from "./api/api"
import { CreateArtifactSurface } from "./artifact/create-artifact-surface"
import { ArtifactSurface } from "./artifact/artifact-surface"
import { resolveArtifactRefreshState } from "./artifact/artifact-refresh-state"
import {
  readCanvasHostPreferences,
  readCanvasMessageDraft,
  writeCanvasHostPreferences,
  writeCanvasMessageDraft,
  type CanvasCreateArtifactJob,
  type CanvasHostLanguage,
  type CanvasHostThemeMode,
  type CanvasSidebarView,
} from "./preferences/canvas-host-preferences"
import {
  clearCanvasMessageHost,
  publishCanvasMessageHost,
} from "./prompt/canvas-message-store"
import {
  failBlockMessageThread,
  finishBlockMessageThread,
  getBlockMessageStoreSnapshot,
  setBlockMessageThreadOpen,
  startBlockMessageThread,
  subscribeBlockMessageStore,
} from "./prompt/block-message-events"
import {
  canvasInteractionEventName,
  clearCanvasInteractionSnapshots,
  createCanvasInteractionEventListener,
} from "./interaction/interaction-store"
import {
  fetchPipelineThreads,
  submitBlockPromptToPipeline,
  submitCreateArtifactToPipeline,
} from "./pipeline"
import { ReactCanvasSidebar } from "./navigation/sidebar"
import {
  canvasHostMobileDocsUrl,
  shouldRedirectCanvasHostToDocs,
} from "./mobile-docs-redirect"
import {
  createEmptyCanvasThemeDraft,
  isCanvasThemeDraftDirty,
  readCanvasThemeRuntimeVariables,
  updateCanvasThemeDraftVariable,
  type CanvasThemeDraft,
  type CanvasThemeResolvedVariables,
  type CanvasThemeVariableName,
} from "./theme/theme-draft"
import { applyCanvasThemeEditorPreview } from "./theme/theme-preview"
import { applyCanvasThemePresetLayout } from "./theme/theme-layout"
import {
  applyCanvasThemeMode,
  applyCanvasThemePreset,
  watchCanvasSystemThemeMode,
} from "./theme/theme-preset"
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
import {
  canvasThemePresets,
  type CanvasThemePresetId,
} from "#agent-html-playground/theme/presets"
import { PanelLeftIcon } from "lucide-react"
import { createArtifactFilePath } from "../react-canvas/prompt.mjs"
import { HostIconButton } from "./ui/icon-button"
import type {
  Artifact,
  FloatingPromptTarget,
  GuardIssue,
} from "./host-contracts"

type CanvasHostMode = "artifact" | "create-artifact"

const artifactsUpdatedEventName = "agent-html:artifacts-updated"

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
  const [activeFilePath, setActiveFilePath] = React.useState<string | null>(null)
  const [artifacts, setArtifacts] = React.useState<Artifact[]>([])
  const [artifactRegistryVersion, setArtifactRegistryVersion] = React.useState(0)
  const [guardIssues, setGuardIssues] = React.useState<GuardIssue[]>([])
  const [artifactsLoading, setArtifactsLoading] = React.useState(true)
  const [leftSidebarOpen, setLeftSidebarOpen] = React.useState(
    initialPreferences.leftSidebarOpen
  )
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [messageDraft, setMessageDraft] = React.useState("")
  const [promptStatus, setPromptStatus] = React.useState("")
  const [blockMessages, setBlockMessages] = React.useState(
    getBlockMessageStoreSnapshot
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
  const [activeHostMode, setActiveHostMode] =
    React.useState<CanvasHostMode>("artifact")
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
  const [themeDraft, setThemeDraft] = React.useState<CanvasThemeDraft>(() =>
    createEmptyCanvasThemeDraft()
  )
  const [themeRuntimeVariables, setThemeRuntimeVariables] =
    React.useState<CanvasThemeResolvedVariables>({})
  const [promptTarget, setPromptTarget] =
    React.useState<FloatingPromptTarget | null>(null)
  const [activeCodexThreadId, setActiveCodexThreadId] =
    React.useState<string | null>(initialPreferences.activeCodexThreadId)
  const [codexThreads, setCodexThreads] = React.useState<CodexThread[]>([])
  const [codexThreadsLoading, setCodexThreadsLoading] = React.useState(true)
  const [codexThreadsError, setCodexThreadsError] =
    React.useState<string | null>(null)
  const activeFilePathRef = React.useRef<string | null>(null)
  const createArtifactJobRef = React.useRef<CanvasCreateArtifactJob | null>(null)

  const activeArtifact =
    artifacts.find((artifact) => artifact.filePath === activeFilePath) ??
    artifacts[0] ??
    null
  const resolvedActiveFilePath = activeFilePath ?? activeArtifact?.filePath ?? null
  const activeIssues = resolvedActiveFilePath
    ? guardIssues.filter((issue) => issue.filePath === resolvedActiveFilePath)
    : []
  const activeThemePreset =
    canvasThemePresets.find((preset) => preset.id === activeThemePresetId) ??
    canvasThemePresets[0]
  const t = React.useMemo(
    () =>
      createHostTranslator(
        resolveCanvasHostLocale({
          language: activeLanguage,
        })
      ),
    [activeLanguage]
  )

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

  const refreshArtifacts = React.useCallback(async () => {
    try {
      const data = await fetchArtifacts()
      const pendingJob = createArtifactJobRef.current
      const pendingFilePath = pendingJob?.filePath ?? null
      const pendingReady = Boolean(
        pendingFilePath &&
          data.artifacts.some(
            (artifact) => artifact.filePath === pendingFilePath
          )
      )

      setArtifacts(data.artifacts ?? [])
      setArtifactRegistryVersion(data.version ?? 0)
      setGuardIssues(data.guardIssues ?? [])
      setLoadError(null)
      setActiveFilePath((current) => {
        const storedPreferences = readCanvasHostPreferences({
          artifacts: data.artifacts,
        })

        return resolveArtifactRefreshState({
          artifacts: data.artifacts ?? [],
          currentFilePath: current,
          pendingFilePath,
          storedFilePath: storedPreferences.activeFilePath,
        }).activeFilePath
      })

      if (pendingReady) {
        createArtifactJobRef.current = null
        setActiveHostMode("artifact")
        setCreateArtifactJob(null)
        setCreateArtifactStatus(t("app.artifactReady"))
      }
    } finally {
      setArtifactsLoading(false)
    }
  }, [t])

  React.useEffect(() => {
    void refreshArtifacts().catch((refreshError: unknown) => {
      setLoadError(
        refreshError instanceof Error
          ? refreshError.message
          : String(refreshError)
      )
    })
  }, [refreshArtifacts])

  React.useEffect(() => {
    applyCanvasThemePreset(activeThemePreset)
    applyCanvasThemePresetLayout(activeThemePreset)
  }, [activeThemePreset])

  React.useEffect(() => {
    applyCanvasThemeMode(activeThemeMode)

    if (activeThemeMode !== "system") {
      return
    }

    return watchCanvasSystemThemeMode(() => applyCanvasThemeMode(activeThemeMode))
  }, [activeThemeMode])

  React.useEffect(() => {
    setThemeRuntimeVariables(
      readCanvasThemeRuntimeVariables(
        window.getComputedStyle(document.documentElement)
      )
    )
  }, [activeThemePreset])

  React.useEffect(() => {
    applyCanvasThemeEditorPreview(themeDraft)
  }, [themeDraft])

  React.useEffect(() => {
    if (!import.meta.hot) {
      return
    }

    const onArtifactsUpdated = () => {
      void refreshArtifacts().catch((refreshError: unknown) => {
        setLoadError(
          refreshError instanceof Error
            ? refreshError.message
            : String(refreshError)
        )
      })
    }

    import.meta.hot.on(artifactsUpdatedEventName, onArtifactsUpdated)

    return () => {
      import.meta.hot?.off(artifactsUpdatedEventName, onArtifactsUpdated)
    }
  }, [refreshArtifacts])

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

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "b" || (!event.metaKey && !event.ctrlKey)) {
        return
      }

      event.preventDefault()
      setLeftSidebarOpen((open) => !open)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const openPrompt = React.useCallback((target: FloatingPromptTarget) => {
    setPromptStatus("")
    setMessageDraft(
      resolvedActiveFilePath
        ? readCanvasMessageDraft({
            blockId: target.id,
            filePath: resolvedActiveFilePath,
          })
        : ""
    )
    setPromptTarget(target)
  }, [resolvedActiveFilePath])

  const closePrompt = React.useCallback(() => {
    setPromptStatus("")
    setPromptTarget(null)
  }, [])

  function selectThemePreset(presetId: CanvasThemePresetId) {
    setActiveThemePresetId(presetId)
    setThemeDraft(createEmptyCanvasThemeDraft())
  }

  function resetThemePreview() {
    setThemeDraft(createEmptyCanvasThemeDraft())
  }

  function updateThemeVariable(name: CanvasThemeVariableName, value: string) {
    setThemeDraft((current) =>
      updateCanvasThemeDraftVariable({
        draft: current,
        name,
        value,
      })
    )
  }

  const selectArtifact = React.useCallback((filePath: string) => {
    setActiveHostMode("artifact")
    setActiveFilePath(filePath)
  }, [])

  const selectCreateArtifact = React.useCallback(() => {
    setPromptTarget(null)
    setPromptStatus("")
    setActiveHostMode("create-artifact")
  }, [])

  const renameExistingArtifact = React.useCallback(async ({
    filePath,
    nextFileName,
  }: {
    filePath: string
    nextFileName: string
  }) => {
    const renamed = await renameArtifact({ filePath, nextFileName })
    setActiveHostMode("artifact")
    setActiveFilePath(renamed.filePath)
    await refreshArtifacts()
  }, [refreshArtifacts])

  const deleteExistingArtifact = React.useCallback(async (filePath: string) => {
    await deleteArtifact({ filePath })
    setActiveFilePath((current) => (current === filePath ? null : current))
    await refreshArtifacts()
  }, [refreshArtifacts])

  const submitBlockPrompt = React.useCallback(async ({
    request,
    target,
  }: {
    request: string
    target: FloatingPromptTarget
  }) => {
    if (!resolvedActiveFilePath) {
      setPromptStatus(t("app.noActiveArtifact"))
      return
    }

    setPromptStatus("")

    try {
      const messageTarget = {
        blockId: target.id,
        filePath: resolvedActiveFilePath,
        title: target.title,
      }

      startBlockMessageThread({
        request,
        t,
        target: messageTarget,
      })

      const turn = await submitBlockPromptToPipeline({
        activeThreadId: activeCodexThreadId,
        blockId: target.id,
        filePath: resolvedActiveFilePath,
        request,
      })

      finishBlockMessageThread({
        t,
        target: messageTarget,
        threadId: turn.threadId,
        turnId: turn.turnId,
      })
      setActiveCodexThreadId(turn.threadId)
      void refreshCodexThreads()
      writeCanvasMessageDraft({
        blockId: target.id,
        draft: "",
        filePath: resolvedActiveFilePath,
      })
    } catch (submitError: unknown) {
      const errorMessage =
        submitError instanceof Error ? submitError.message : String(submitError)
      failBlockMessageThread({
        error: errorMessage,
        t,
        target: {
          blockId: target.id,
          filePath: resolvedActiveFilePath,
          title: target.title,
        },
      })
      setPromptStatus(errorMessage)
    }
  }, [
    activeCodexThreadId,
    refreshCodexThreads,
    resolvedActiveFilePath,
    t,
  ])

  const updateMessageDraft = React.useCallback((draft: string) => {
    setMessageDraft(draft)

    if (!resolvedActiveFilePath || !promptTarget) {
      return
    }

    writeCanvasMessageDraft({
      blockId: promptTarget.id,
      draft,
      filePath: resolvedActiveFilePath,
    })
  }, [promptTarget, resolvedActiveFilePath])

  const submitCreateArtifactPrompt = React.useCallback(async (request: string) => {
    const artifactFilePath = createArtifactFilePath({
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
      const turn = await submitCreateArtifactToPipeline({
        activeThreadId: activeCodexThreadId,
        filePath: artifactFilePath,
        request,
      })
      const waitingJob: CanvasCreateArtifactJob = {
        ...nextJob,
        phase: "waiting-for-artifact",
        threadId: turn.threadId,
        turnId: turn.turnId,
      }

      createArtifactJobRef.current = waitingJob
      setCreateArtifactJob(waitingJob)
      setActiveCodexThreadId(turn.threadId)
      setCreateArtifactStatus(t("app.waitingForArtifact"))
      void refreshArtifacts()
      void refreshCodexThreads()
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
  }, [activeCodexThreadId, artifacts, refreshArtifacts, refreshCodexThreads, t])

  React.useEffect(() => {
    writeCanvasHostPreferences({
      createArtifactJob,
    })
  }, [createArtifactJob])

  React.useEffect(() => {
    if (artifacts.length === 0) {
      return
    }

    writeCanvasHostPreferences({
      activeFilePath: resolvedActiveFilePath,
    })
  }, [artifacts.length, resolvedActiveFilePath])

  React.useEffect(() => {
    writeCanvasHostPreferences({
      leftSidebarOpen,
    })
  }, [leftSidebarOpen])

  React.useEffect(() => {
    writeCanvasHostPreferences({
      activeSidebarView,
    })
  }, [activeSidebarView])

  React.useEffect(() => {
    writeCanvasHostPreferences({
      activeThemeEditorSectionId,
    })
  }, [activeThemeEditorSectionId])

  React.useEffect(() => {
    writeCanvasHostPreferences({
      activeThemePresetId,
    })
  }, [activeThemePresetId])

  React.useEffect(() => {
    writeCanvasHostPreferences({
      activeThemeMode,
    })
  }, [activeThemeMode])

  React.useEffect(() => {
    writeCanvasHostPreferences({
      activeLanguage,
    })
  }, [activeLanguage])

  React.useEffect(() => {
    writeCanvasHostPreferences({
      activeCodexThreadId,
    })
  }, [activeCodexThreadId])

  React.useEffect(() => {
    return subscribeBlockMessageStore(() => {
      setBlockMessages(getBlockMessageStoreSnapshot())
    })
  }, [])

  React.useEffect(() => {
    publishCanvasMessageHost({
      activeFilePath: resolvedActiveFilePath,
      activeTarget: promptTarget,
      blockMessages,
      draft: messageDraft,
      enabled: true,
      onClose: closePrompt,
      onDraftChange: updateMessageDraft,
      onOpenTarget: openPrompt,
      onPromptSubmit: submitBlockPrompt,
      onThreadOpenChange: setBlockMessageThreadOpen,
      status: promptStatus,
    })
  }, [
    blockMessages,
    closePrompt,
    messageDraft,
    openPrompt,
    promptStatus,
    promptTarget,
    resolvedActiveFilePath,
    submitBlockPrompt,
    updateMessageDraft,
  ])

  React.useEffect(() => {
    return () => clearCanvasMessageHost()
  }, [])

  return (
    <TooltipProvider>
      <HostI18nProvider language={activeLanguage}>
        <div className="canvas-host-shell">
          <SidebarProvider
            className="contents"
            keyboardShortcut={false}
            open={leftSidebarOpen}
            onOpenChange={setLeftSidebarOpen}
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
              themePresets={canvasThemePresets}
              themeRuntimeVariables={themeRuntimeVariables}
            />
          </SidebarProvider>
          <SidebarInset className="min-h-svh min-w-0 overflow-hidden">
          <div className="canvas-host-toolbar">
            <HostIconButton
              icon={PanelLeftIcon}
              label={
                leftSidebarOpen
                  ? t("app.collapseArtifactSidebar")
                  : t("app.expandArtifactSidebar")
              }
              onClick={() => setLeftSidebarOpen((open) => !open)}
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
