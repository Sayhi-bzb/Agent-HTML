import * as React from "react"

import { deliverAgentHtmlIntent } from "@/app/workspace/agent-intent"
import { useCodexConnection } from "@/app/codex/connection"
import { Button } from "@/app/shared/ui/button"
import { WorkspaceGhostPet } from "@/app/workspace/ghost-pet"
import { createWorkspaceRepository } from "@/app/workspace/repository"
import type {
  ProjectSectionDocument,
  WorkspaceProjectView,
  WorkspaceSection,
} from "@/app/workspace/types"
import {
  AgentHtmlBlockRuntimeProvider,
  AgentHtmlRuntimeTheme,
  AgentHtmlRuntimeViewport,
  applyAgentHtmlDropIntent,
  agentHtmlInteractionEventName,
  parseAgentHtml,
  renderInteractiveAgentHtml,
  serializeAgentHtml,
  validateAgentHtml,
  type AgentHtmlAgentInteractionEvent,
  type AgentHtmlAgentPromptSubmitInput,
  type AgentHtmlDropIntent,
  type AgentHtmlValidationError,
} from "@/agent-html"

type WorkspaceDocumentState =
  | { status: "idle" | "loading" }
  | { message: string; status: "error" }
  | { document: ProjectSectionDocument; status: "ready" }

type RuntimeState =
  | { document: ProjectSectionDocument; content: React.ReactNode; status: "ready" }
  | { errors: AgentHtmlValidationError[]; status: "invalid" }
  | { message: string; status: "error" }

type AgentDeliveryState =
  | { status: "idle" }
  | { status: "sending" }
  | { detail: string; status: "sent" }
  | { detail: string; status: "copied" }
  | { detail: string; status: "error" }

type SaveState =
  | { status: "clean" }
  | { status: "dirty" }
  | { status: "saving" }
  | { status: "saved" }
  | { detail: string; status: "error" }

const workspaceRepository = createWorkspaceRepository()

function RuntimeValidationErrors({
  errors,
}: {
  errors: AgentHtmlValidationError[]
}) {
  return (
    <div className="flex flex-col gap-3 p-4 md:p-6">
      {errors.map((error) => (
        <article
          key={`${error.code}:${error.path}:${error.attr ?? ""}`}
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive"
        >
          <p className="text-sm font-medium">{error.code}</p>
          <p className="mt-1 text-xs leading-5">
            {error.path} - {error.message}
          </p>
        </article>
      ))}
    </div>
  )
}

function WorkspaceStatus({
  detail,
  title,
}: {
  detail: string
  title: string
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <section className="max-w-md rounded-xl border bg-background p-5 text-foreground shadow-sm">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
      </section>
    </div>
  )
}

function renderWorkspaceDocument(document: ProjectSectionDocument): RuntimeState {
  try {
    const parsedDocument = parseAgentHtml(document.ahtmlSource)
    const validation = validateAgentHtml(parsedDocument)

    if (!validation.ok) {
      return {
        errors: validation.errors,
        status: "invalid",
      }
    }

    return {
      content: renderInteractiveAgentHtml(parsedDocument),
      document,
      status: "ready",
    }
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Unable to render AHTML.",
      status: "error",
    }
  }
}

export function WorkspaceSurface({
  activeProject,
  activeSection,
  canEditStructure,
  canSave,
  onCreateSection,
  onDirtyChange,
  saveAttentionToken,
  workspaceActionError,
}: {
  activeProject: WorkspaceProjectView | null
  activeSection: WorkspaceSection | null
  canEditStructure: boolean
  canSave: boolean
  onCreateSection: (input: { projectId: string; title: string }) => Promise<void>
  onDirtyChange: (isDirty: boolean) => void
  saveAttentionToken: number
  workspaceActionError: string | null
}) {
  const codexConnection = useCodexConnection()
  const [documentState, setDocumentState] =
    React.useState<WorkspaceDocumentState>({ status: "idle" })
  const [agentDeliveryState, setAgentDeliveryState] =
    React.useState<AgentDeliveryState>({ status: "idle" })
  const [saveState, setSaveState] = React.useState<SaveState>({
    status: "clean",
  })
  const [isCreatingSection, setIsCreatingSection] = React.useState(false)
  const [createSectionError, setCreateSectionError] = React.useState<
    string | null
  >(null)
  const [isSaveAttentionActive, setIsSaveAttentionActive] =
    React.useState(false)
  const lastInteractionRef =
    React.useRef<AgentHtmlAgentInteractionEvent | null>(null)

  const handleCreateSection = React.useCallback(() => {
    if (!activeProject || isCreatingSection) {
      return
    }

    setCreateSectionError(null)
    setIsCreatingSection(true)
    onCreateSection({
      projectId: activeProject.id,
      title: "Untitled Section",
    })
      .catch((error: unknown) => {
        setCreateSectionError(
          error instanceof Error ? error.message : "Unable to create section."
        )
      })
      .finally(() => {
        setIsCreatingSection(false)
      })
  }, [activeProject, isCreatingSection, onCreateSection])

  React.useEffect(() => {
    onDirtyChange(saveState.status === "dirty" || saveState.status === "error")
  }, [onDirtyChange, saveState.status])

  React.useEffect(() => {
    if (
      saveAttentionToken === 0 ||
      (saveState.status !== "dirty" && saveState.status !== "error")
    ) {
      return
    }

    setIsSaveAttentionActive(true)
    const timeout = window.setTimeout(() => {
      setIsSaveAttentionActive(false)
    }, 1400)

    return () => window.clearTimeout(timeout)
  }, [saveAttentionToken, saveState.status])

  const handleDropIntent = React.useCallback(
    ({
      intent,
      sourcePath,
    }: {
      intent: AgentHtmlDropIntent
      sourcePath: string
    }) => {
      if (documentState.status !== "ready") {
        return
      }

      try {
        const parsedDocument = parseAgentHtml(documentState.document.ahtmlSource)
        const nextDocument = applyAgentHtmlDropIntent(parsedDocument, {
          intent,
          sourcePath,
        })

        setDocumentState({
          document: {
            ...documentState.document,
            ahtmlSource: serializeAgentHtml(nextDocument),
          },
          status: "ready",
        })
        setSaveState({ status: "dirty" })
      } catch {
        return
      }
    },
    [documentState]
  )

  const handleSaveDocument = React.useCallback(() => {
    if (!canSave || documentState.status !== "ready") {
      return
    }

    const document = documentState.document
    setSaveState({ status: "saving" })
    workspaceRepository
      .updateProjectSectionDocument({
        ahtmlSource: document.ahtmlSource,
        projectId: document.projectId,
        sectionId: document.sectionId,
      })
      .then((nextDocument) => {
        setDocumentState({ document: nextDocument, status: "ready" })
        setSaveState({ status: "saved" })
      })
      .catch((error: unknown) => {
        setSaveState({
          detail:
            error instanceof Error
              ? error.message
              : "Unable to save workspace document.",
          status: "error",
        })
      })
  }, [canSave, documentState])

  const handlePromptSubmit = React.useCallback(
    (submit: AgentHtmlAgentPromptSubmitInput) => {
      if (!activeProject || !activeSection || documentState.status !== "ready") {
        return
      }

      setAgentDeliveryState({ status: "sending" })
      deliverAgentHtmlIntent({
        bridgeUrl: codexConnection.bridgeUrl,
        document: documentState.document,
        project: activeProject,
        section: activeSection,
        submit: {
          ...submit,
          interaction: submit.interaction ?? lastInteractionRef.current,
        },
      }).then((result) => {
        if (result.ok) {
          setAgentDeliveryState({
            detail: "Sent to Codex.",
            status: "sent",
          })
          lastInteractionRef.current = null
          return
        }

        if (result.provider === "copy_prompt") {
          setAgentDeliveryState({
            detail: "Agent bridge unavailable. Prompt copied.",
            status: "copied",
          })
        }
      })
    },
    [activeProject, activeSection, codexConnection.bridgeUrl, documentState]
  )

  React.useEffect(() => {
    const handleInteraction = (event: Event) => {
      const customEvent = event as CustomEvent<AgentHtmlAgentInteractionEvent>
      lastInteractionRef.current = customEvent.detail
    }

    window.addEventListener(agentHtmlInteractionEventName, handleInteraction)

    return () => {
      window.removeEventListener(agentHtmlInteractionEventName, handleInteraction)
    }
  }, [])

  React.useEffect(() => {
    if (!activeProject || !activeSection) {
      setDocumentState({ status: "idle" })
      setSaveState({ status: "clean" })
      return
    }

    let isCurrent = true
    setDocumentState({ status: "loading" })

    workspaceRepository
      .getProjectSectionDocument(activeProject.id, activeSection.id)
      .then((document) => {
        if (isCurrent) {
          setDocumentState({ document, status: "ready" })
          setSaveState({ status: "clean" })
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setDocumentState({
            message:
              error instanceof Error
                ? error.message
                : "Unable to load workspace document.",
            status: "error",
          })
          setSaveState({ status: "clean" })
        }
      })

    return () => {
      isCurrent = false
    }
  }, [activeProject, activeSection])

  const runtime = React.useMemo(() => {
    if (documentState.status !== "ready") {
      return null
    }

    return renderWorkspaceDocument(documentState.document)
  }, [documentState])

  if (!activeProject) {
    return (
      <WorkspaceStatus
        detail="Open a project section from the sidebar to render its current AHTML document."
        title="No workspace section selected"
      />
    )
  }

  if (!activeSection) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <section className="max-w-md rounded-xl border bg-background p-5 text-foreground shadow-sm">
          <p className="text-sm font-medium">No sections in this project</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Create a section to start editing this workspace project.
          </p>
          {workspaceActionError || createSectionError ? (
            <p className="mt-3 text-sm text-destructive">
              {workspaceActionError ?? createSectionError}
            </p>
          ) : null}
          <Button
            className="mt-4"
            disabled={!canEditStructure || isCreatingSection}
            onClick={handleCreateSection}
            title={canEditStructure ? undefined : "Desktop runtime required"}
            type="button"
          >
            {isCreatingSection ? "Creating..." : "New Section"}
          </Button>
        </section>
      </div>
    )
  }

  if (documentState.status === "idle" || documentState.status === "loading") {
    return (
      <WorkspaceStatus
        detail={`${activeProject.name} / ${activeSection.title}`}
        title="Loading workspace document"
      />
    )
  }

  if (documentState.status === "error") {
    return (
      <WorkspaceStatus
        detail={documentState.message}
        title="Unable to load document"
      />
    )
  }

  if (!runtime) {
    return null
  }

  if (runtime.status === "invalid") {
    return <RuntimeValidationErrors errors={runtime.errors} />
  }

  if (runtime.status === "error") {
    return <WorkspaceStatus detail={runtime.message} title="Runtime error" />
  }

  return (
    <AgentHtmlRuntimeTheme className="h-full w-full">
      <AgentHtmlBlockRuntimeProvider
        onDropIntent={handleDropIntent}
        onPromptSubmit={handlePromptSubmit}
      >
        <AgentHtmlRuntimeViewport>{runtime.content}</AgentHtmlRuntimeViewport>
      </AgentHtmlBlockRuntimeProvider>
      {saveState.status !== "clean" ? (
        <div
          className={[
            "fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-xs text-foreground shadow-lg transition-[box-shadow,border-color,background-color]",
            isSaveAttentionActive
              ? "border-primary/70 bg-primary/5 shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
              : "",
          ].join(" ")}
          role="status"
        >
          <span>
            {saveState.status === "dirty"
              ? "Unsaved changes"
              : saveState.status === "saving"
                ? "Saving..."
                : saveState.status === "saved"
                  ? "Saved"
                  : saveState.detail}
          </span>
          {saveState.status === "dirty" || saveState.status === "error" ? (
            <button
              className="rounded-md bg-primary px-2 py-1 font-medium text-primary-foreground disabled:opacity-50"
              disabled={!canSave}
              onClick={handleSaveDocument}
              type="button"
            >
              Save
            </button>
          ) : null}
        </div>
      ) : null}
      {agentDeliveryState.status !== "idle" ? (
        <div
          className="fixed right-4 bottom-16 z-50 rounded-lg border bg-background px-3 py-2 text-xs text-foreground shadow-lg"
          role="status"
        >
          {agentDeliveryState.status === "sending"
            ? "Sending to agent..."
            : agentDeliveryState.detail}
        </div>
      ) : null}
      <WorkspaceGhostPet />
    </AgentHtmlRuntimeTheme>
  )
}

export function WorkspaceLoadErrorState({ detail }: { detail: string }) {
  return <WorkspaceStatus detail={detail} title="Unable to load workspace" />
}
