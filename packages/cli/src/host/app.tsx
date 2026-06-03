import * as React from "react"

import {
  actionEventName,
  fetchArtifacts,
  fetchBlockSource,
} from "./api"
import { ArtifactSurface } from "./artifact-surface"
import { PromptPanel } from "./prompt-panel"
import { ReactCanvasSidebar } from "./sidebar"
import { SidebarProvider } from "#agent-html-playground/ui/sidebar"
import { formatBlockPrompt } from "../react-canvas/prompt.mjs"
import type { Artifact, GuardIssue, PromptTarget } from "./host-contracts"

export function ReactCanvasHostApp() {
  const [activeFilePath, setActiveFilePath] = React.useState<string | null>(
    null
  )
  const [artifacts, setArtifacts] = React.useState<Artifact[]>([])
  const [guardIssues, setGuardIssues] = React.useState<GuardIssue[]>([])
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [promptOutput, setPromptOutput] = React.useState("")
  const [promptStatus, setPromptStatus] = React.useState("")
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
    <SidebarProvider className="overflow-hidden bg-background text-foreground">
      <ReactCanvasSidebar
        activeFilePath={resolvedActiveFilePath}
        artifacts={artifacts}
        guardIssues={guardIssues}
        onSelectArtifact={setActiveFilePath}
      />
      <main className="min-h-svh min-w-0 flex-1 overflow-hidden">
        <ArtifactSurface
          activeFilePath={resolvedActiveFilePath}
          artifactCount={artifacts.length}
          guardIssues={activeIssues}
          loadError={loadError}
          onMessageBlock={openPrompt}
        />
      </main>
      {promptTarget ? (
        <PromptPanel
          activeFilePath={resolvedActiveFilePath}
          output={promptOutput}
          status={promptStatus}
          target={promptTarget}
          onClose={() => setPromptTarget(null)}
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
      ) : null}
    </SidebarProvider>
  )
}
