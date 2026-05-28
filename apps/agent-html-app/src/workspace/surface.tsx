import * as React from "react"

import { markCodexStartupEvent } from "@/app/codex/connection"
import {
  useAgentActivity,
  type AgentActivityTurnContext,
} from "@/app/workspace/agent-activity"
import { deliverAgentHtmlIntent } from "@/app/workspace/agent-intent"
import {
  useCodexConnection,
  type CodexThreadSummary,
} from "@/app/codex/connection"
import { Button } from "@/app/shared/ui/button"
import { WorkspaceGhostPet } from "@/app/pet/ghost"
import type { PetPresence } from "@/app/workspace/agent-presence"
import { createWorkspaceRepository } from "@/app/workspace/repository"
import type {
  ProjectCodexThreadLink,
  ProjectSectionDocument,
  WorkspaceProjectView,
  WorkspaceSection,
} from "@/app/workspace/types"
import {
  AgentHtmlBlockRuntimeProvider,
  type AgentHtmlDocument,
  type AgentHtmlColorCssVariables,
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
  | {
      content: React.ReactNode
      document: ProjectSectionDocument
      parsedDocument: AgentHtmlDocument
      status: "ready"
    }
  | { errors: AgentHtmlValidationError[]; status: "invalid" }
  | { message: string; status: "error" }

type AgentDeliveryState =
  | { status: "idle" }
  | { status: "sending" }
  | { detail: string; status: "sent" }
  | { detail: string; status: "error" }

type SaveState =
  | { status: "clean" }
  | { status: "dirty" }
  | { status: "saving" }
  | { status: "saved" }
  | { detail: string; status: "error" }

const workspaceRepository = createWorkspaceRepository()

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

function formatThreadLabel(thread: {
  createdAt?: string
  id: string
  name?: string | null
  updatedAt?: string
}) {
  const label = thread.name?.trim() || thread.id
  const timestamp = thread.updatedAt ?? thread.createdAt
  return timestamp ? `${label} - ${timestamp}` : label
}

function getThreadSummaryById(
  threads: CodexThreadSummary[],
  threadId: string
) {
  return threads.find((thread) => thread.id === threadId) ?? null
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

function isMissingCodexThreadError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase()
  return (
    message.includes("not found") ||
    message.includes("missing") ||
    message.includes("no such thread") ||
    message.includes("unknown thread") ||
    message.includes("archived")
  )
}

function formatProjectThreadLabel(
  link: ProjectCodexThreadLink,
  summary: ReturnType<typeof getThreadSummaryById>
) {
  return formatThreadLabel({
    createdAt: summary?.createdAt ?? link.createdAt,
    id: link.threadId,
    name: summary?.name,
    updatedAt: summary?.updatedAt ?? link.lastUsedAt,
  })
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
      parsedDocument,
      status: "ready",
    }
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Unable to render AHTML.",
      status: "error",
    }
  }
}

function ProjectThreadPickerContent({
  canSelectThread,
  codexThreadError,
  isLoading,
  isSelectingThread,
  onNewThread,
  onResumeThread,
  projectThreadError,
  projectThreadLinks,
  threadSelectionError,
  threadSummaries,
}: {
  canSelectThread: boolean
  codexThreadError?: string | null
  isLoading: boolean
  isSelectingThread: boolean
  onNewThread: () => void
  onResumeThread: (threadId: string) => void
  projectThreadError?: string | null
  projectThreadLinks: ProjectCodexThreadLink[]
  threadSelectionError?: string | null
  threadSummaries: CodexThreadSummary[]
}) {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">Codex threads</p>
          <p className="text-xs text-muted-foreground">
            Continue a project thread or start fresh.
          </p>
        </div>
        <Button
          disabled={!canSelectThread || isSelectingThread}
          onClick={onNewThread}
          title={canSelectThread ? undefined : "Codex is starting"}
          type="button"
          variant="outline"
        >
          New
        </Button>
      </div>
      {codexThreadError ? (
        <p className="text-xs text-destructive">{codexThreadError}</p>
      ) : null}
      {projectThreadError ? (
        <p className="text-xs text-destructive">{projectThreadError}</p>
      ) : null}
      {threadSelectionError ? (
        <p className="text-xs text-destructive">{threadSelectionError}</p>
      ) : null}
      <div className="grid max-h-60 gap-2 overflow-auto">
        {!canSelectThread ? (
          <p className="text-xs text-muted-foreground">
            Connecting to Codex...
          </p>
        ) : isLoading ? (
          <p className="text-xs text-muted-foreground">Loading threads...</p>
        ) : projectThreadLinks.length > 0 ? (
          projectThreadLinks.map((link) => {
            const summary = getThreadSummaryById(threadSummaries, link.threadId)
            return (
              <button
                key={link.threadId}
                className="rounded-md border px-2 py-1.5 text-left text-xs hover:bg-muted disabled:opacity-50"
                disabled={!canSelectThread || isSelectingThread}
                onClick={() => onResumeThread(link.threadId)}
                type="button"
              >
                <span className="block truncate font-medium">
                  {formatProjectThreadLabel(link, summary)}
                </span>
                <span className="block truncate text-muted-foreground">
                  {summary ? link.threadId : `${link.threadId} - verify on resume`}
                </span>
              </button>
            )
          })
        ) : (
          <p className="text-xs text-muted-foreground">
            No previous threads for this project.
          </p>
        )}
      </div>
    </div>
  )
}

export function WorkspaceSurface({
  activeProject,
  activeSection,
  canEditStructure,
  canSave,
  colorCssVariables,
  onCreateSection,
  onDirtyChange,
  saveAttentionToken,
  workspaceActionError,
}: {
  activeProject: WorkspaceProjectView | null
  activeSection: WorkspaceSection | null
  canEditStructure: boolean
  canSave: boolean
  colorCssVariables: AgentHtmlColorCssVariables
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
  const [threadSelectionError, setThreadSelectionError] = React.useState<
    string | null
  >(null)
  const [isThreadPickerOpen, setIsThreadPickerOpen] = React.useState(false)
  const [isSelectingThread, setIsSelectingThread] = React.useState(false)
  const [projectThreadLinks, setProjectThreadLinks] = React.useState<
    ProjectCodexThreadLink[]
  >([])
  const [projectThreadListState, setProjectThreadListState] = React.useState<{
    error: string | null
    isLoading: boolean
  }>({ error: null, isLoading: false })
  const [selectedProjectThreadId, setSelectedProjectThreadId] = React.useState<
    string | null
  >(null)
  const [activeTurnContext, setActiveTurnContext] =
    React.useState<AgentActivityTurnContext>({})
  const agentActivity = useAgentActivity(activeTurnContext)
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

  const runtime = React.useMemo(() => {
    if (documentState.status !== "ready") {
      return null
    }

    return renderWorkspaceDocument(documentState.document)
  }, [documentState])

  const handleDropIntent = React.useCallback(
    ({
      intent,
      sourcePath,
    }: {
      intent: AgentHtmlDropIntent
      sourcePath: string
    }) => {
      if (documentState.status !== "ready" || runtime?.status !== "ready") {
        return
      }

      try {
        const nextDocument = applyAgentHtmlDropIntent(runtime.parsedDocument, {
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
    [documentState, runtime]
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

  const startNewThread = React.useCallback(() => {
    if (!activeProject) {
      return
    }

    setThreadSelectionError(null)
    setIsSelectingThread(true)
    codexConnection
      .startNewThread()
      .then((threadId) =>
        workspaceRepository.upsertProjectCodexThreadLink({
          projectId: activeProject.id,
          threadId,
        })
      )
      .then((link) => {
        setSelectedProjectThreadId(link.threadId)
        setIsThreadPickerOpen(false)
        setProjectThreadLinks((currentLinks) => [
          link,
          ...currentLinks.filter(
            (currentLink) => currentLink.threadId !== link.threadId
          ),
        ])
      })
      .catch((error: unknown) => {
        setThreadSelectionError(
          `Unable to start Codex thread: ${getErrorMessage(error)}`
        )
      })
      .finally(() => setIsSelectingThread(false))
  }, [activeProject, codexConnection])

  const resumeThread = React.useCallback(
    (threadId: string) => {
      if (!activeProject) {
        return
      }

      setThreadSelectionError(null)
      setIsSelectingThread(true)
      codexConnection
        .request("thread/read", { includeTurns: false, threadId })
        .then(() => codexConnection.resumeThread(threadId))
        .then(() =>
          workspaceRepository.touchProjectCodexThreadLink({
            projectId: activeProject.id,
            threadId,
          })
        )
        .then((link) => {
          setSelectedProjectThreadId(link.threadId)
          setIsThreadPickerOpen(false)
          setProjectThreadLinks((currentLinks) => [
            link,
            ...currentLinks.filter(
              (currentLink) => currentLink.threadId !== link.threadId
            ),
          ])
        })
        .catch((error: unknown) => {
          if (isMissingCodexThreadError(error)) {
            void workspaceRepository
              .deleteProjectCodexThreadLink({
                projectId: activeProject.id,
                threadId,
              })
              .then(() => {
                setProjectThreadLinks((currentLinks) =>
                  currentLinks.filter((link) => link.threadId !== threadId)
                )
                if (selectedProjectThreadId === threadId) {
                  setSelectedProjectThreadId(null)
                }
              })
          }
          setThreadSelectionError(
            `Unable to resume Codex thread: ${getErrorMessage(error)}`
          )
        })
        .finally(() => setIsSelectingThread(false))
    },
    [activeProject, codexConnection, selectedProjectThreadId]
  )

  const createThreadForProject = React.useCallback(
    async (input: {
      ahtmlPath: string
      documentPath: string
      projectId: string
      sectionId: string
    }) => {
      const threadId = await codexConnection.startNewThread()
      const link = await workspaceRepository.upsertProjectCodexThreadLink({
        ahtmlPath: input.ahtmlPath,
        documentPath: input.documentPath,
        projectId: input.projectId,
        sectionId: input.sectionId,
        threadId,
      })
      setProjectThreadLinks((currentLinks) => [
        link,
        ...currentLinks.filter(
          (currentLink) => currentLink.threadId !== link.threadId
        ),
      ])
      setSelectedProjectThreadId(link.threadId)
      return link.threadId
    },
    [codexConnection]
  )

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
      const threadPromise = selectedProjectThreadId
        ? Promise.resolve(selectedProjectThreadId)
        : createThreadForProject({
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
            void workspaceRepository
              .touchProjectCodexThreadLink({
                ahtmlPath: submit.path,
                documentPath: document.filePath,
                projectId: activeProject.id,
                sectionId: activeSection.id,
                threadId: result.threadId,
              })
              .then((link) => {
                setProjectThreadLinks((currentLinks) => [
                  link,
                  ...currentLinks.filter(
                    (currentLink) => currentLink.threadId !== link.threadId
                  ),
                ])
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
      createThreadForProject,
      documentState,
      runtime,
      selectedProjectThreadId,
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
          markCodexStartupEvent("workspace-document-ready", {
            filePath: document.filePath,
            projectId: activeProject.id,
            sectionId: activeSection.id,
          })
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

  React.useEffect(() => {
    if (!activeProject) {
      setProjectThreadLinks([])
      setProjectThreadListState({ error: null, isLoading: false })
      setSelectedProjectThreadId(null)
      setIsThreadPickerOpen(false)
      return
    }

    let isCurrent = true
    setProjectThreadLinks([])
    setSelectedProjectThreadId(null)
    setProjectThreadListState({ error: null, isLoading: true })

    workspaceRepository
      .listProjectCodexThreads(activeProject.id)
      .then((links) => {
        if (!isCurrent) {
          return
        }

        setProjectThreadLinks(links)
        setProjectThreadListState({ error: null, isLoading: false })
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return
        }

        setProjectThreadListState({
          error:
            error instanceof Error
              ? error.message
              : "Unable to load project Codex threads.",
          isLoading: false,
        })
      })

    return () => {
      isCurrent = false
    }
  }, [activeProject])

  const petPresence = React.useMemo(
    () => agentActivity.presence ?? getAgentDeliveryPresence(agentDeliveryState),
    [agentActivity.presence, agentDeliveryState]
  )

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

  const canSelectThread = codexConnection.status === "connected"
  const threadPickerContent = (
    <ProjectThreadPickerContent
      canSelectThread={canSelectThread}
      codexThreadError={codexConnection.threadList.error}
      isLoading={
        codexConnection.threadList.isLoading ||
        projectThreadListState.isLoading
      }
      isSelectingThread={isSelectingThread}
      onNewThread={startNewThread}
      onResumeThread={resumeThread}
      projectThreadError={projectThreadListState.error}
      projectThreadLinks={projectThreadLinks}
      threadSelectionError={threadSelectionError}
      threadSummaries={codexConnection.threadList.items}
    />
  )

  return (
    <AgentHtmlRuntimeTheme
      className="h-full w-full"
      colorCssVariables={colorCssVariables}
    >
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
      <WorkspaceGhostPet
        isThreadPickerOpen={isThreadPickerOpen}
        onThreadPickerOpenChange={setIsThreadPickerOpen}
        presence={petPresence}
        threadPickerContent={threadPickerContent}
      />
    </AgentHtmlRuntimeTheme>
  )
}

export function WorkspaceLoadErrorState({ detail }: { detail: string }) {
  return <WorkspaceStatus detail={detail} title="Unable to load workspace" />
}
