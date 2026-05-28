import * as React from "react"
import { CheckIcon, CopyIcon, PencilIcon, XIcon } from "lucide-react"

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
import { Input } from "@/app/shared/ui/input"
import { ScrollArea } from "@/app/shared/ui/scroll-area"
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

type ThreadPreviewState = {
  error?: string | null
  isLoading: boolean
  requestText?: string | null
}

const workspaceRepository = createWorkspaceRepository()
const THREAD_REQUEST_PREVIEW_LIMIT = 160

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

export function formatThreadRelativeTime(value?: string | null, now = Date.now()) {
  if (!value) {
    return "unknown"
  }

  const timestamp = readTimestampMs(value)
  if (timestamp === null) {
    return "unknown"
  }

  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000))
  if (seconds < 45) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function readTimestampMs(value: string) {
  if (/^\d+$/.test(value)) {
    const numeric = Number(value)
    return numeric < 10_000_000_000 ? numeric * 1000 : numeric
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.getTime()
}

function getThreadSortTimestamp(
  link: ProjectCodexThreadLink,
  summary: ReturnType<typeof getThreadSummaryById>
) {
  for (const value of [
    summary?.updatedAt,
    link.lastUsedAt,
    summary?.createdAt,
    link.createdAt,
  ]) {
    if (!value) {
      continue
    }

    const timestamp = readTimestampMs(value)
    if (timestamp !== null) {
      return timestamp
    }
  }

  return 0
}

export function sortProjectThreadLinksByRecent(
  links: ProjectCodexThreadLink[],
  summaries: CodexThreadSummary[]
) {
  return [...links].sort((left, right) => {
    const leftSummary = getThreadSummaryById(summaries, left.threadId)
    const rightSummary = getThreadSummaryById(summaries, right.threadId)
    return (
      getThreadSortTimestamp(right, rightSummary) -
      getThreadSortTimestamp(left, leftSummary)
    )
  })
}

function getThreadDisplayName(
  link: ProjectCodexThreadLink,
  summary: ReturnType<typeof getThreadSummaryById>
) {
  return summary?.name?.trim() || `Thread ${link.threadId.slice(0, 8)}`
}

function copyThreadId(threadId: string) {
  void navigator.clipboard?.writeText(threadId).catch(() => {
    return undefined
  })
}

function getThreadSummaryById(
  threads: CodexThreadSummary[],
  threadId: string
) {
  return threads.find((thread) => thread.id === threadId) ?? null
}

function readObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null
}

function readArrayFromKeys(value: unknown, keys: string[]) {
  const object = readObject(value)
  if (!object) {
    return null
  }

  for (const key of keys) {
    const child = object[key]
    if (Array.isArray(child)) {
      return child
    }
  }

  return null
}

function truncateThreadPreview(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim()
  return normalized.length > THREAD_REQUEST_PREVIEW_LIMIT
    ? `${normalized.slice(0, THREAD_REQUEST_PREVIEW_LIMIT - 3)}...`
    : normalized
}

function extractAgentHtmlRequest(text: string) {
  const marker = /\nRequest:\s*/.exec(text)
  if (!marker) {
    return text
  }

  return text.slice(marker.index + marker[0].length)
}

function readTextFromUserInput(value: unknown): string | null {
  if (typeof value === "string") {
    return value
  }

  const object = readObject(value)
  if (!object) {
    return null
  }

  for (const key of ["text", "content", "value"]) {
    const child = object[key]
    if (typeof child === "string") {
      return child
    }
  }

  return null
}

export function readFirstThreadRequestText(value: unknown) {
  const turns =
    readArrayFromKeys(value, ["data", "turns", "items"]) ??
    (Array.isArray(value) ? value : [])

  for (const rawTurn of turns) {
    const turn = readObject(rawTurn)
    const rawItems =
      readArrayFromKeys(turn, ["items", "summaries", "events"]) ??
      (turn ? [turn] : [])

    for (const rawItem of rawItems) {
      const item = readObject(rawItem)
      const type = item?.type
      if (type && type !== "userMessage" && type !== "user_message") {
        continue
      }

      const content = readArrayFromKeys(item, ["content", "input"])
      if (content) {
        const joined = content
          .map(readTextFromUserInput)
          .filter((text): text is string => Boolean(text?.trim()))
          .join(" ")
        if (joined.trim()) {
          return truncateThreadPreview(extractAgentHtmlRequest(joined))
        }
      }

      const text = readTextFromUserInput(item)
      if (text?.trim()) {
        return truncateThreadPreview(extractAgentHtmlRequest(text))
      }
    }
  }

  return null
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
  onRenameThread,
  onResumeThread,
  optimisticThreadNames,
  projectThreadError,
  projectThreadLinks,
  renameError,
  renamingThreadId,
  threadSelectionError,
  threadRequestPreviews,
  threadSummaries,
}: {
  canSelectThread: boolean
  codexThreadError?: string | null
  isLoading: boolean
  isSelectingThread: boolean
  onNewThread: () => void
  onRenameThread: (input: { name: string; threadId: string }) => Promise<void>
  onResumeThread: (threadId: string) => void
  optimisticThreadNames: Record<string, string>
  projectThreadError?: string | null
  projectThreadLinks: ProjectCodexThreadLink[]
  renameError?: string | null
  renamingThreadId?: string | null
  threadSelectionError?: string | null
  threadRequestPreviews: Record<string, ThreadPreviewState>
  threadSummaries: CodexThreadSummary[]
}) {
  const [editingThreadId, setEditingThreadId] = React.useState<string | null>(null)
  const [editingName, setEditingName] = React.useState("")
  const sortedProjectThreadLinks = React.useMemo(
    () => sortProjectThreadLinksByRecent(projectThreadLinks, threadSummaries),
    [projectThreadLinks, threadSummaries]
  )

  return (
    <div className="flex min-w-0 flex-col gap-3 text-sm">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">Codex threads</p>
          <p className="truncate text-xs text-muted-foreground">
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
      {renameError ? (
        <p className="text-xs text-destructive">{renameError}</p>
      ) : null}
      <ScrollArea className="min-w-0" viewportClassName="max-h-60">
        <div className="grid min-w-0 gap-2 pr-3">
        {!canSelectThread ? (
          <p className="text-xs text-muted-foreground">
            Connecting to Codex...
          </p>
        ) : isLoading ? (
          <p className="text-xs text-muted-foreground">Loading threads...</p>
        ) : projectThreadLinks.length > 0 ? (
          sortedProjectThreadLinks.map((link) => {
            const summary = getThreadSummaryById(threadSummaries, link.threadId)
            const displayName =
              optimisticThreadNames[link.threadId] ??
              getThreadDisplayName(link, summary)
            const timestamp = formatThreadRelativeTime(
              summary?.updatedAt ?? link.lastUsedAt ?? summary?.createdAt ?? link.createdAt
            )
            const preview = threadRequestPreviews[link.threadId]
            const previewText = preview?.isLoading
              ? "Loading request..."
              : preview?.requestText || "No request yet"
            const isEditing = editingThreadId === link.threadId
            const isRenaming = renamingThreadId === link.threadId

            return (
              <div
                key={link.threadId}
                className="group min-w-0 overflow-hidden rounded-md border bg-background px-3 py-2 text-xs transition-colors hover:bg-muted/70"
              >
                <div className="flex min-w-0 items-center justify-between gap-2">
                  {isEditing ? (
                    <form
                      className="flex min-w-0 flex-1 items-center gap-1.5"
                      onSubmit={(event) => {
                        event.preventDefault()
                        const nextName = editingName.trim()
                        if (!nextName || isRenaming) {
                          return
                        }
                        void onRenameThread({
                          name: nextName,
                          threadId: link.threadId,
                        }).then(() => setEditingThreadId(null))
                      }}
                    >
                      <Input
                        autoFocus
                        className="h-7 min-w-0 flex-1 px-2 text-xs"
                        disabled={isRenaming}
                        onChange={(event) => setEditingName(event.target.value)}
                        value={editingName}
                      />
                      <Button
                        className="size-7 p-0"
                        disabled={isRenaming || !editingName.trim()}
                        type="submit"
                        variant="ghost"
                      >
                        <CheckIcon className="size-3.5" />
                      </Button>
                      <Button
                        className="size-7 p-0"
                        disabled={isRenaming}
                        onClick={() => setEditingThreadId(null)}
                        type="button"
                        variant="ghost"
                      >
                        <XIcon className="size-3.5" />
                      </Button>
                    </form>
                  ) : (
                    <button
                      className="min-w-0 flex-1 truncate text-left font-medium text-foreground"
                      disabled={!canSelectThread || isSelectingThread}
                      onClick={() => onResumeThread(link.threadId)}
                      type="button"
                    >
                      {displayName}
                    </button>
                  )}
                  {!isEditing ? (
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        className="size-7 p-0 opacity-70 hover:opacity-100"
                        onClick={() => copyThreadId(link.threadId)}
                        title="Copy thread id"
                        type="button"
                        variant="ghost"
                      >
                        <CopyIcon className="size-3.5" />
                      </Button>
                      <Button
                        className="size-7 p-0 opacity-70 hover:opacity-100"
                        disabled={!canSelectThread || isSelectingThread || isRenaming}
                        onClick={() => {
                          setEditingThreadId(link.threadId)
                          setEditingName(
                            optimisticThreadNames[link.threadId] ??
                              summary?.name?.trim() ??
                              ""
                          )
                        }}
                        title="Rename thread"
                        type="button"
                        variant="ghost"
                      >
                        <PencilIcon className="size-3.5" />
                      </Button>
                    </div>
                  ) : null}
                </div>
                <button
                  className="mt-1 flex w-full min-w-0 items-center gap-2 text-left text-muted-foreground"
                  disabled={!canSelectThread || isSelectingThread}
                  onClick={() => onResumeThread(link.threadId)}
                  type="button"
                >
                  <span className="shrink-0">{timestamp}</span>
                  <span aria-hidden="true">/</span>
                  <ScrollArea
                    className="min-w-0 flex-1"
                    viewportClassName="max-h-10"
                  >
                    <span className="block pr-2 text-muted-foreground">
                      {previewText}
                    </span>
                  </ScrollArea>
                </button>
              </div>
            )
          })
        ) : (
          <p className="text-xs text-muted-foreground">
            No previous threads for this project.
          </p>
        )}
        </div>
      </ScrollArea>
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
  const [threadRenameError, setThreadRenameError] = React.useState<string | null>(
    null
  )
  const [renamingThreadId, setRenamingThreadId] = React.useState<string | null>(
    null
  )
  const [optimisticThreadNames, setOptimisticThreadNames] = React.useState<
    Record<string, string>
  >({})
  const [threadRequestPreviews, setThreadRequestPreviews] = React.useState<
    Record<string, ThreadPreviewState>
  >({})
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

  const renameThread = React.useCallback(
    async ({ name, threadId }: { name: string; threadId: string }) => {
      const nextName = name.trim()
      if (!nextName) {
        return
      }

      setThreadRenameError(null)
      setRenamingThreadId(threadId)
      try {
        await codexConnection.request("thread/name/set", {
          name: nextName,
          threadId,
        })
        setOptimisticThreadNames((currentNames) => ({
          ...currentNames,
          [threadId]: nextName,
        }))
        void codexConnection.refreshThreads()
      } catch (error) {
        setThreadRenameError(
          `Unable to rename Codex thread: ${getErrorMessage(error)}`
        )
        throw error
      } finally {
        setRenamingThreadId(null)
      }
    },
    [codexConnection.refreshThreads, codexConnection.request]
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
      setThreadRequestPreviews({})
      setOptimisticThreadNames({})
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

  React.useEffect(() => {
    if (codexConnection.status !== "connected" || projectThreadLinks.length === 0) {
      setThreadRequestPreviews({})
      return
    }

    let isCurrent = true
    const threadIds = projectThreadLinks.map((link) => link.threadId)
    setThreadRequestPreviews((currentPreviews) => {
      const nextPreviews: Record<string, ThreadPreviewState> = {}
      for (const threadId of threadIds) {
        nextPreviews[threadId] = currentPreviews[threadId] ?? {
          isLoading: true,
        }
      }
      return nextPreviews
    })

    for (const threadId of threadIds) {
      void codexConnection
        .request("thread/turns/list", {
          itemsView: "summary",
          limit: 1,
          sortDirection: "asc",
          threadId,
        })
        .then((result) => {
          if (!isCurrent) {
            return
          }

          setThreadRequestPreviews((currentPreviews) => ({
            ...currentPreviews,
            [threadId]: {
              error: null,
              isLoading: false,
              requestText: readFirstThreadRequestText(result),
            },
          }))
        })
        .catch((error: unknown) => {
          if (!isCurrent) {
            return
          }

          setThreadRequestPreviews((currentPreviews) => ({
            ...currentPreviews,
            [threadId]: {
              error: getErrorMessage(error),
              isLoading: false,
              requestText: null,
            },
          }))
        })
    }

    return () => {
      isCurrent = false
    }
  }, [codexConnection.request, codexConnection.status, projectThreadLinks])

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
  const threadSummaries = codexConnection.threadList.items.map((thread) =>
    optimisticThreadNames[thread.id]
      ? { ...thread, name: optimisticThreadNames[thread.id] }
      : thread
  )
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
      onRenameThread={renameThread}
      onResumeThread={resumeThread}
      optimisticThreadNames={optimisticThreadNames}
      projectThreadError={projectThreadListState.error}
      projectThreadLinks={projectThreadLinks}
      renameError={threadRenameError}
      renamingThreadId={renamingThreadId}
      threadSelectionError={threadSelectionError}
      threadRequestPreviews={threadRequestPreviews}
      threadSummaries={threadSummaries}
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
