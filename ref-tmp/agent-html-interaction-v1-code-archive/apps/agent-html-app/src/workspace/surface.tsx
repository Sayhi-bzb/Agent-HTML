import * as React from "react"

import { deliverAgentHtmlIntent } from "@/app/workspace/agent-intent"
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
}: {
  activeProject: WorkspaceProjectView | null
  activeSection: WorkspaceSection | null
}) {
  const [documentState, setDocumentState] =
    React.useState<WorkspaceDocumentState>({ status: "idle" })
  const [agentDeliveryState, setAgentDeliveryState] =
    React.useState<AgentDeliveryState>({ status: "idle" })
  const lastInteractionRef =
    React.useRef<AgentHtmlAgentInteractionEvent | null>(null)

  const handleDropIntent = React.useCallback(
    ({
      intent,
      sourcePath,
    }: {
      intent: AgentHtmlDropIntent
      sourcePath: string
    }) => {
      setDocumentState((current) => {
        if (current.status !== "ready") {
          return current
        }

        try {
          const parsedDocument = parseAgentHtml(current.document.ahtmlSource)
          const nextDocument = applyAgentHtmlDropIntent(parsedDocument, {
            intent,
            sourcePath,
          })

          return {
            document: {
              ...current.document,
              ahtmlSource: serializeAgentHtml(nextDocument),
            },
            status: "ready",
          }
        } catch {
          return current
        }
      })
    },
    []
  )

  const handlePromptSubmit = React.useCallback(
    (submit: AgentHtmlAgentPromptSubmitInput) => {
      if (!activeProject || !activeSection || documentState.status !== "ready") {
        return
      }

      setAgentDeliveryState({ status: "sending" })
      deliverAgentHtmlIntent({
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
            detail: "Sent to local agent bridge.",
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
    [activeProject, activeSection, documentState]
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
      return
    }

    let isCurrent = true
    setDocumentState({ status: "loading" })

    workspaceRepository
      .getProjectSectionDocument(activeProject.id, activeSection.id)
      .then((document) => {
        if (isCurrent) {
          setDocumentState({ document, status: "ready" })
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

  if (!activeProject || !activeSection) {
    return (
      <WorkspaceStatus
        detail="Open a project section from the sidebar to render its current AHTML document."
        title="No workspace section selected"
      />
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
      {agentDeliveryState.status !== "idle" ? (
        <div
          className="fixed bottom-4 right-4 z-50 rounded-lg border bg-background px-3 py-2 text-xs text-foreground shadow-lg"
          role="status"
        >
          {agentDeliveryState.status === "sending"
            ? "Sending to agent..."
            : agentDeliveryState.detail}
        </div>
      ) : null}
    </AgentHtmlRuntimeTheme>
  )
}

export function WorkspaceLoadErrorState({ detail }: { detail: string }) {
  return <WorkspaceStatus detail={detail} title="Unable to load workspace" />
}
