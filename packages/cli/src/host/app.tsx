import * as React from "react"

import {
  fetchCodexThreads,
  fetchArtifacts,
  fetchBlockImplementation,
  type CodexThread,
  startCodexTurn,
} from "./api/api"
import { CreateArtifactSurface } from "./artifact/create-artifact-surface"
import { ArtifactSurface } from "./artifact/artifact-surface"
import {
  readCanvasHostPreferences,
  readCanvasMessageDraft,
  writeCanvasHostPreferences,
  writeCanvasMessageDraft,
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
  getCanvasInteractionSnapshot,
} from "./interaction/interaction-store"
import { publishCanvasPromptDebug } from "./prompt/prompt-debug"
import { ReactCanvasSidebar } from "./navigation/sidebar"
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
import { applyCanvasThemePreset } from "./theme/theme-preset"
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
import {
  createArtifactFilePath,
  formatBlockPrompt,
  formatCreateArtifactPrompt,
} from "../react-canvas/prompt.mjs"
import { HostIconButton } from "./ui/icon-button"
import type {
  Artifact,
  FloatingPromptTarget,
  GuardIssue,
} from "./host-contracts"

type CanvasHostMode = "artifact" | "create-artifact"
const blockPromptPipelineMode = "test" as "test" | "real"
const testBlockPromptPipelineDelayMs = 1400

function waitForTestBlockPromptPipeline() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, testBlockPromptPipelineDelayMs)
  })
}

export function ReactCanvasHostApp() {
  const initialPreferences = React.useMemo(
    () => readCanvasHostPreferences(),
    []
  )
  const [activeFilePath, setActiveFilePath] = React.useState<string | null>(null)
  const [artifacts, setArtifacts] = React.useState<Artifact[]>([])
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
  const [createArtifactStatus, setCreateArtifactStatus] = React.useState("")
  const [pendingArtifactFilePath, setPendingArtifactFilePath] =
    React.useState<string | null>(null)
  const [activeHostMode, setActiveHostMode] =
    React.useState<CanvasHostMode>("artifact")
  const [activeThemePresetId, setActiveThemePresetId] =
    React.useState<CanvasThemePresetId>(initialPreferences.activeThemePresetId)
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

  const refreshArtifacts = React.useCallback(async () => {
    try {
      const data = await fetchArtifacts()

      setArtifacts(data.artifacts ?? [])
      setGuardIssues(data.guardIssues ?? [])
      setLoadError(null)
      setActiveFilePath((current) => {
        if (
          pendingArtifactFilePath &&
          data.artifacts.some(
            (artifact) => artifact.filePath === pendingArtifactFilePath
          )
        ) {
          return pendingArtifactFilePath
        }

        if (
          current &&
          data.artifacts.some((artifact) => artifact.filePath === current)
        ) {
          return current
        }

        const storedPreferences = readCanvasHostPreferences({
          artifacts: data.artifacts,
        })

        return (
          storedPreferences.activeFilePath ?? data.artifacts[0]?.filePath ?? null
        )
      })

      if (
        pendingArtifactFilePath &&
        data.artifacts.some(
          (artifact) => artifact.filePath === pendingArtifactFilePath
        )
      ) {
        setActiveHostMode("artifact")
        setPendingArtifactFilePath(null)
        setCreateArtifactStatus("Artifact ready.")
      }
    } finally {
      setArtifactsLoading(false)
    }
  }, [pendingArtifactFilePath])

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
    const interval = window.setInterval(() => {
      void refreshArtifacts().catch((refreshError: unknown) => {
        setLoadError(
          refreshError instanceof Error
            ? refreshError.message
            : String(refreshError)
        )
      })
    }, 2000)

    return () => window.clearInterval(interval)
  }, [refreshArtifacts])

  const refreshCodexThreads = React.useCallback(async () => {
    setCodexThreadsLoading(true)
    try {
      const data = await fetchCodexThreads()
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

  const submitBlockPrompt = React.useCallback(async ({
    request,
    target,
  }: {
    request: string
    target: FloatingPromptTarget
  }) => {
    if (!resolvedActiveFilePath) {
      setPromptStatus("No active artifact.")
      return
    }

    try {
      const messageTarget = {
        blockId: target.id,
        filePath: resolvedActiveFilePath,
        title: target.title,
      }

      startBlockMessageThread({
        request,
        target: messageTarget,
      })

      if (blockPromptPipelineMode === "test") {
        setPromptStatus("Sending to test pipeline...")
        await waitForTestBlockPromptPipeline()
        finishBlockMessageThread({
          target: messageTarget,
          threadId: "test-thread",
          turnId: "test-turn",
        })
        writeCanvasMessageDraft({
          blockId: target.id,
          draft: "",
          filePath: resolvedActiveFilePath,
        })
        setPromptStatus("Sent to test pipeline.")
        return
      }

      const blockImplementation = await fetchBlockImplementation({
        blockId: target.id,
        filePath: resolvedActiveFilePath,
      })
      const formatted = formatBlockPrompt({
        blockId: target.id,
        filePath: resolvedActiveFilePath,
        implementationPath: blockImplementation.implementationPath ?? undefined,
        interactionSnapshot: getCanvasInteractionSnapshot({
          blockId: target.id,
          filePath: resolvedActiveFilePath,
        }),
        request,
      })

      publishCanvasPromptDebug(formatted)
      const turn = await startCodexTurn({
        prompt: formatted,
        threadId: activeCodexThreadId,
      })

      finishBlockMessageThread({
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
      setPromptStatus(
        turn.startedNewThread
          ? "Started a new Codex thread."
          : "Sent to Codex thread."
      )
    } catch (submitError: unknown) {
      const errorMessage =
        submitError instanceof Error ? submitError.message : String(submitError)
      failBlockMessageThread({
        error: errorMessage,
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
    const formatted = formatCreateArtifactPrompt({
      filePath: artifactFilePath,
      request,
    })

    try {
      setCreateArtifactStatus("Sending to Codex...")
      publishCanvasPromptDebug(formatted)
      const turn = await startCodexTurn({
        prompt: formatted,
        threadId: activeCodexThreadId,
      })

      setActiveCodexThreadId(turn.threadId)
      setPendingArtifactFilePath(artifactFilePath)
      setCreateArtifactStatus(`Waiting for ${artifactFilePath}...`)
      void refreshArtifacts()
      void refreshCodexThreads()
    } catch (submitError: unknown) {
      setCreateArtifactStatus(
        submitError instanceof Error ? submitError.message : String(submitError)
      )
      throw submitError
    }
  }, [activeCodexThreadId, artifacts, refreshArtifacts, refreshCodexThreads])

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
            activeSidebarView={activeSidebarView}
            activeThemePresetId={activeThemePresetId}
            createArtifactActive={activeHostMode === "create-artifact"}
            artifactsLoading={artifactsLoading}
            artifacts={artifacts}
            codexThreads={codexThreads}
            codexThreadsError={codexThreadsError}
            codexThreadsLoading={codexThreadsLoading}
            guardIssues={guardIssues}
            onSelectArtifact={selectArtifact}
            onSelectCodexThread={setActiveCodexThreadId}
            onSelectCreateArtifact={selectCreateArtifact}
            onSelectSection={setActiveThemeEditorSectionId}
            onSelectSidebarView={setActiveSidebarView}
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
                  ? "Collapse artifact sidebar"
                  : "Expand artifact sidebar"
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
              draft={createArtifactDraft}
              onDraftChange={setCreateArtifactDraft}
              onSubmit={submitCreateArtifactPrompt}
              status={createArtifactStatus}
            />
          ) : (
            <ArtifactSurface
              activeFilePath={resolvedActiveFilePath}
              blocks={activeArtifact?.blocks}
              artifactCount={artifacts.length}
              artifactsLoading={artifactsLoading}
              guardIssues={activeIssues}
              loadError={loadError}
            />
          )}
        </SidebarInset>
      </div>
    </TooltipProvider>
  )
}
