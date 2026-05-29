import * as React from "react"

import {
  useCodexConnection,
} from "@/app/codex/connection"
import type { CodexConnectionContextValue } from "@/app/codex/connection/types"
import { createWorkspaceRepository } from "@/app/workspace/repository"
import {
  readFirstThreadRequestText,
  type ThreadPreviewState,
} from "@/app/workspace/thread-picker"
import type { ProjectCodexThreadLink, WorkspaceProjectView } from "./types"

const workspaceRepository = createWorkspaceRepository()

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

export function useWorkspaceThreadController({
  activeProject,
}: {
  activeProject: WorkspaceProjectView | null
}) {
  const codexConnection = useCodexConnection()
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
        setProjectThreadLinks((currentLinks) => mergeProjectThreadLink(link, currentLinks))
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
          setProjectThreadLinks((currentLinks) =>
            mergeProjectThreadLink(link, currentLinks)
          )
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
      setProjectThreadLinks((currentLinks) =>
        mergeProjectThreadLink(link, currentLinks)
      )
      setSelectedProjectThreadId(link.threadId)
      return link.threadId
    },
    [codexConnection]
  )

  const touchProjectThread = React.useCallback(
    (input: {
      ahtmlPath?: string | null
      documentPath?: string | null
      projectId: string
      sectionId?: string | null
      threadId: string
    }) =>
      workspaceRepository.touchProjectCodexThreadLink(input).then((link) => {
        setProjectThreadLinks((currentLinks) =>
          mergeProjectThreadLink(link, currentLinks)
        )
        return link
      }),
    []
  )

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
    if (
      codexConnection.status !== "connected" ||
      projectThreadLinks.length === 0
    ) {
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

  const threadSummaries = React.useMemo(
    () =>
      codexConnection.threadList.items.map((thread) =>
        optimisticThreadNames[thread.id]
          ? { ...thread, name: optimisticThreadNames[thread.id] }
          : thread
      ),
    [codexConnection.threadList.items, optimisticThreadNames]
  )

  return {
    codexConnection,
    createThreadForProject,
    isThreadPickerOpen,
    selectedProjectThreadId,
    setIsThreadPickerOpen,
    startNewThread,
    threadPickerProps: {
      canSelectThread: codexConnection.status === "connected",
      codexThreadError: codexConnection.threadList.error,
      isLoading:
        codexConnection.threadList.isLoading ||
        projectThreadListState.isLoading,
      isSelectingThread,
      onNewThread: startNewThread,
      onRenameThread: renameThread,
      onResumeThread: resumeThread,
      optimisticThreadNames,
      projectThreadError: projectThreadListState.error,
      projectThreadLinks,
      renameError: threadRenameError,
      renamingThreadId,
      selectedProjectThreadId,
      threadRequestPreviews,
      threadSelectionError,
      threadSummaries,
    },
    touchProjectThread,
  }
}

function mergeProjectThreadLink(
  link: ProjectCodexThreadLink,
  currentLinks: ProjectCodexThreadLink[]
) {
  return [
    link,
    ...currentLinks.filter(
      (currentLink) => currentLink.threadId !== link.threadId
    ),
  ]
}

export type WorkspaceThreadController = ReturnType<
  typeof useWorkspaceThreadController
>

export type WorkspaceCodexConnection = CodexConnectionContextValue
