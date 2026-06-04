import * as React from "react"

import {
  actionEventName,
  fetchArtifacts,
  fetchBlockSource,
} from "./api"
import { ArtifactSurface } from "./artifact-surface"
import { PromptPanel } from "./prompt-panel"
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
} from "#agent-html-playground/ui/sidebar"
import { TooltipProvider } from "#agent-html-playground/ui/tooltip"
import { Button } from "#agent-html-playground/ui/button"
import {
  canvasThemePresets,
  type CanvasThemePresetId,
} from "#agent-html-playground/theme/presets"
import { MessageSquareIcon, PanelLeftIcon } from "lucide-react"
import { formatBlockPrompt } from "../react-canvas/prompt.mjs"
import type { Artifact, GuardIssue, PromptTarget } from "./host-contracts"

export function ReactCanvasHostApp() {
  const [activeFilePath, setActiveFilePath] = React.useState<string | null>(
    null
  )
  const [artifacts, setArtifacts] = React.useState<Artifact[]>([])
  const [guardIssues, setGuardIssues] = React.useState<GuardIssue[]>([])
  const [leftSidebarOpen, setLeftSidebarOpen] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [promptOutput, setPromptOutput] = React.useState("")
  const [rightSidebarOpen, setRightSidebarOpen] = React.useState(true)
  const [promptStatus, setPromptStatus] = React.useState("")
  const [activeThemePresetId, setActiveThemePresetId] =
    React.useState<CanvasThemePresetId>("default")
  const [activeSidebarView, setActiveSidebarView] = React.useState<
    "artifacts" | "theme"
  >("artifacts")
  const [activeThemeEditorSectionId, setActiveThemeEditorSectionId] =
    React.useState<CanvasThemeEditorSectionId>("color")
  const [themeDraft, setThemeDraft] = React.useState<CanvasThemeDraft>(() =>
    createEmptyCanvasThemeDraft()
  )
  const [themeRuntimeVariables, setThemeRuntimeVariables] =
    React.useState<CanvasThemeResolvedVariables>({})
  const [promptTarget, setPromptTarget] = React.useState<PromptTarget | null>(
    null
  )

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

  const refreshArtifacts = React.useCallback(async () => {
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

      return data.artifacts[0]?.filePath ?? null
    })
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
      const nextOpen = !(leftSidebarOpen && rightSidebarOpen)
      setLeftSidebarOpen(nextOpen)
      setRightSidebarOpen(nextOpen)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [leftSidebarOpen, rightSidebarOpen])

  React.useEffect(() => {
    const handleAction = (event: Event) => {
      const detail = (
        event as CustomEvent<{ prompt?: string; target?: string }>
      ).detail
      if (!detail?.target) {
        return
      }

      openPrompt({
        id: detail.target,
        initialRequest: detail.prompt ?? "",
        title: detail.target,
      })
    }

    window.addEventListener(actionEventName, handleAction)
    return () => window.removeEventListener(actionEventName, handleAction)
  }, [])

  function openPrompt(target: PromptTarget) {
    setPromptOutput("")
    setPromptStatus("")
    setPromptTarget(target)
    setRightSidebarOpen(true)
  }

  function closePrompt() {
    setPromptOutput("")
    setPromptStatus("")
    setPromptTarget(null)
  }

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

  async function submitPrompt(request: string) {
    if (!promptTarget || !resolvedActiveFilePath) {
      return
    }

    const data = await fetchBlockSource({
      blockId: promptTarget.id,
      filePath: resolvedActiveFilePath,
    })
    const formatted = formatBlockPrompt({
      blockPath: promptTarget.id,
      filePath: resolvedActiveFilePath,
      request,
      selectedSource: data.selectedSource ?? null,
      targetStatus: data.selectedSource ? "selected_block" : "missing_block",
    })

    setPromptOutput(formatted)
    await navigator.clipboard.writeText(formatted)
    setPromptStatus("Prompt copied to clipboard.")
  }

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
            <Button
              aria-label={
                rightSidebarOpen
                  ? "Collapse AI sidebar"
                  : "Expand AI sidebar"
              }
              className="pointer-events-auto"
              onClick={() => setRightSidebarOpen((open) => !open)}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <MessageSquareIcon data-icon="inline-start" />
            </Button>
          </div>
          <ArtifactSurface
            activeFilePath={resolvedActiveFilePath}
            artifactCount={artifacts.length}
            guardIssues={activeIssues}
            loadError={loadError}
            onMessageBlock={openPrompt}
          />
        </SidebarInset>
        <SidebarProvider
          className="contents"
          keyboardShortcut={false}
          open={rightSidebarOpen}
          onOpenChange={setRightSidebarOpen}
        >
          <PromptPanel
            activeFilePath={resolvedActiveFilePath}
            output={promptOutput}
            status={promptStatus}
            target={promptTarget}
            onClose={closePrompt}
            onSubmit={(request) => {
              void submitPrompt(request).catch((submitError: unknown) => {
                setPromptStatus(
                  submitError instanceof Error
                    ? submitError.message
                    : String(submitError)
                )
              })
            }}
          />
        </SidebarProvider>
      </div>
    </TooltipProvider>
  )
}
