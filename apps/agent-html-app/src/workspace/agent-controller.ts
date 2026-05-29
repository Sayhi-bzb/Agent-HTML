import * as React from "react"

import {
  useAgentActivity,
  type AgentActivityTurnContext,
} from "@/app/workspace/agent-activity"
import { deliverAgentHtmlIntent } from "@/app/workspace/agent-intent"
import type {
  RuntimeState,
  WorkspaceDocumentState,
} from "@/app/workspace/document-controller"
import type { PetPresence } from "@/app/workspace/agent-presence"
import type { WorkspaceThreadController } from "@/app/workspace/thread-controller"
import type {
  ProjectSectionDocument,
  WorkspaceProjectView,
  WorkspaceSection,
} from "@/app/workspace/types"
import {
  agentHtmlInteractionEventName,
  type AgentHtmlAgentInteractionEvent,
  type AgentHtmlAgentPromptSubmitInput,
} from "@/agent-html"

type AgentDeliveryState =
  | { status: "idle" }
  | { status: "sending" }
  | { detail: string; status: "sent" }
  | { detail: string; status: "error" }

function getAgentDeliveryPresence(
  agentDeliveryState: AgentDeliveryState
): PetPresence | undefined {
  if (agentDeliveryState.status === "idle") {
    return undefined
  }

  if (agentDeliveryState.status === "sending") {
    return {
      action: {
        kind: "running",
        label: "starting turn",
      },
      message: {
        mode: "transient",
        text: "Sending request to Codex.",
      },
      mood: "working",
    }
  }

  if (agentDeliveryState.status === "sent") {
    return {
      message: {
        mode: "final",
        text: agentDeliveryState.detail,
      },
      mood: "review",
    }
  }

  return {
    message: {
      mode: "final",
      text: agentDeliveryState.detail,
    },
    mood: "failed",
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof error.message === "string") {
      return error.message
    }
    if ("error" in error && typeof error.error === "string") {
      return error.error
    }
  }

  return String(error)
}

export function useWorkspaceAgentController({
  activeProject,
  activeSection,
  documentState,
  runtime,
  threadController,
}: {
  activeProject: WorkspaceProjectView | null
  activeSection: WorkspaceSection | null
  documentState: WorkspaceDocumentState
  runtime: RuntimeState | null
  threadController: WorkspaceThreadController
}) {
  const [agentDeliveryState, setAgentDeliveryState] =
    React.useState<AgentDeliveryState>({ status: "idle" })
  const [activeTurnContext, setActiveTurnContext] =
    React.useState<AgentActivityTurnContext>({})
  const agentActivity = useAgentActivity(activeTurnContext)
  const lastInteractionRef =
    React.useRef<AgentHtmlAgentInteractionEvent | null>(null)
  const { codexConnection } = threadController

  const handlePromptSubmit = React.useCallback(
    (submit: AgentHtmlAgentPromptSubmitInput) => {
      if (!activeProject || !activeSection || documentState.status !== "ready") {
        return
      }
      if (runtime?.status !== "ready") {
        return
      }

      setAgentDeliveryState({ status: "sending" })
      const document = documentState.document
      const threadPromise = threadController.selectedProjectThreadId
        ? Promise.resolve(threadController.selectedProjectThreadId)
        : threadController.createThreadForProject({
            ahtmlPath: submit.path,
            documentPath: document.filePath,
            projectId: activeProject.id,
            sectionId: activeSection.id,
          })

      threadPromise
        .then((threadId) =>
          deliverAgentHtmlIntent({
            document,
            parsedDocument: runtime.parsedDocument,
            project: activeProject,
            section: activeSection,
            startTurn: codexConnection.startTurn,
            submit: {
              ...submit,
              interaction: submit.interaction ?? lastInteractionRef.current,
            },
            threadId,
          })
        )
        .then((result) => {
          if (result.ok) {
            void touchThreadAfterDelivery({
              activeProject,
              activeSection,
              document,
              path: submit.path,
              result,
              threadController,
            })
            setActiveTurnContext({
              blockPath: submit.path,
              sectionId: activeSection.id,
              threadId: result.threadId,
              turnId: result.turnId,
            })
            setAgentDeliveryState({
              detail: "Sent to Codex.",
              status: "sent",
            })
            lastInteractionRef.current = null
            return
          }

          setAgentDeliveryState({
            detail: result.error,
            status: "error",
          })
        })
        .catch((error: unknown) => {
          setAgentDeliveryState({
            detail: `Unable to prepare Codex thread: ${getErrorMessage(error)}`,
            status: "error",
          })
        })
    },
    [
      activeProject,
      activeSection,
      codexConnection.startTurn,
      documentState,
      runtime,
      threadController,
    ]
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

  const petPresence = React.useMemo(
    () => agentActivity.presence ?? getAgentDeliveryPresence(agentDeliveryState),
    [agentActivity.presence, agentDeliveryState]
  )

  return {
    handlePromptSubmit,
    petPresence,
  }
}

function touchThreadAfterDelivery({
  activeProject,
  activeSection,
  document,
  path,
  result,
  threadController,
}: {
  activeProject: WorkspaceProjectView
  activeSection: WorkspaceSection
  document: ProjectSectionDocument
  path: string
  result: Extract<Awaited<ReturnType<typeof deliverAgentHtmlIntent>>, { ok: true }>
  threadController: WorkspaceThreadController
}) {
  return threadController.touchProjectThread({
    ahtmlPath: path,
    documentPath: document.filePath,
    projectId: activeProject.id,
    sectionId: activeSection.id,
    threadId: result.threadId,
  })
}
