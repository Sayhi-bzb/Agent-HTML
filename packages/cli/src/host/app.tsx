import * as React from "react"

import {
  fetchArtifacts,
  fetchBlockImplementation,
  startCodexTurn,
} from "./api"
import { ArtifactSurface } from "./artifact-surface"
import {
  readCanvasHostPreferences,
  readCanvasMessageDraft,
  writeCanvasHostPreferences,
  writeCanvasMessageDraft,
} from "./canvas-host-preferences"
import {
  clearCanvasMessageHost,
  publishCanvasMessageHost,
} from "./canvas-message-store"
import {
  canvasInteractionEventName,
  clearCanvasInteractionSnapshots,
  createCanvasInteractionEventListener,
  getCanvasInteractionSnapshot,
} from "./interaction-store"
import { publishCanvasPromptDebug } from "./prompt-debug"
import { ReactCanvasSidebar } from "./sidebar"
import {
  createEmptyCanvasThemeDraft,
  isCanvasThemeDraftDirty,
  readCanvasThemeRuntimeVariables,
  updateCanvasThemeDraftVariable,
  type CanvasThemeDraft,
  type CanvasThemeResolvedVariables,
  type CanvasThemeVariableName,
} from "./theme-draft"
import { applyCanvasThemeEditorPreview } from "./theme-preview"
import { applyCanvasThemePreset } from "./theme-preset"
import type { CanvasThemeEditorSectionId } from "./theme-editor-sections"
import {
  SidebarInset,
  SidebarProvider,
} from "#agent-html-playground/components/ui/sidebar"
import { TooltipProvider } from "#agent-html-playground/components/ui/tooltip"
import { Button } from "#agent-html-playground/components/ui/button"
import {
  canvasThemePresets,
  type CanvasThemePresetId,
} from "#agent-html-playground/theme/presets"
import { PanelLeftIcon } from "lucide-react"
import { formatBlockPrompt } from "../react-canvas/prompt.mjs"
import type {
  Artifact,
  FloatingPromptTarget,
  GuardIssue,
} from "./host-contracts"

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
  const [activeThemePresetId, setActiveThemePresetId] =
    React.useState<CanvasThemePresetId>(initialPreferences.activeThemePresetId)
  const [activeSidebarView, setActiveSidebarView] = React.useState<
    "artifacts" | "theme"
  >(initialPreferences.activeSidebarView)
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
    } finally {
      setArtifactsLoading(false)
    }
  }, [])

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

      setActiveCodexThreadId(turn.threadId)
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
      setPromptStatus(
        submitError instanceof Error ? submitError.message : String(submitError)
      )
    }
  }, [
    activeCodexThreadId,
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
    publishCanvasMessageHost({
      activeTarget: promptTarget,
      draft: messageDraft,
      enabled: true,
      onClose: closePrompt,
      onDraftChange: updateMessageDraft,
      onOpenTarget: openPrompt,
      onPromptSubmit: submitBlockPrompt,
      status: promptStatus,
    })
  }, [
    closePrompt,
    messageDraft,
    openPrompt,
    promptStatus,
    promptTarget,
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
            activeSidebarView={activeSidebarView}
            activeThemePresetId={activeThemePresetId}
            artifactsLoading={artifactsLoading}
            artifacts={artifacts}
            guardIssues={guardIssues}
            onSelectArtifact={setActiveFilePath}
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
            <Button
              aria-label={
                leftSidebarOpen
                  ? "Collapse artifact sidebar"
                  : "Expand artifact sidebar"
              }
              className="pointer-events-auto"
              onClick={() => setLeftSidebarOpen((open) => !open)}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <PanelLeftIcon data-icon="inline-start" />
            </Button>
          </div>
          <ArtifactSurface
            activeFilePath={resolvedActiveFilePath}
            artifactCount={artifacts.length}
            artifactsLoading={artifactsLoading}
            guardIssues={activeIssues}
            loadError={loadError}
          />
        </SidebarInset>
      </div>
    </TooltipProvider>
  )
}
