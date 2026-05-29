import * as React from "react"

import type { CodexConnectionContextValue } from "@/app/codex/connection/types"
import { createWorkspaceStore } from "@/app/workspace/store"
import type { ProjectCodexThreadLink, WorkspaceProjectView } from "./types"

const workspaceStore = createWorkspaceStore()

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

export function useProjectThreadLinks({
  activeProject,
  codexConnection,
  onThreadPickerOpenChange,
}: {
  activeProject: WorkspaceProjectView | null
  codexConnection: CodexConnectionContextValue
  onThreadPickerOpenChange: (isOpen: boolean) => void
}) {
  const [threadSelectionError, setThreadSelectionError] = React.useState<
    string | null
  >(null)
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
        workspaceStore.upsertProjectCodexThreadLink({
          projectId: activeProject.id,
          threadId,
        })
      )
      .then((link) => {
        setSelectedProjectThreadId(link.threadId)
        onThreadPickerOpenChange(false)
        setProjectThreadLinks((currentLinks) =>
          mergeProjectThreadLink(link, currentLinks)
        )
      })
      .catch((error: unknown) => {
        setThreadSelectionError(
          `Unable to start Codex thread: ${getErrorMessage(error)}`
        )
      })
      .finally(() => setIsSelectingThread(false))
  }, [activeProject, codexConnection, onThreadPickerOpenChange])

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
          workspaceStore.touchProjectCodexThreadLink({
            projectId: activeProject.id,
            threadId,
          })
        )
        .then((link) => {
          setSelectedProjectThreadId(link.threadId)
          onThreadPickerOpenChange(false)
          setProjectThreadLinks((currentLinks) =>
            mergeProjectThreadLink(link, currentLinks)
          )
        })
        .catch((error: unknown) => {
          if (isMissingCodexThreadError(error)) {
            void workspaceStore
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
    [
      activeProject,
      codexConnection,
      onThreadPickerOpenChange,
      selectedProjectThreadId,
    ]
  )

  const createThreadForProject = React.useCallback(
    async (input: {
      blockPath: string
      documentPath: string
      projectId: string
      sectionId: string
    }) => {
      const threadId = await codexConnection.startNewThread()
      const link = await workspaceStore.upsertProjectCodexThreadLink({
        blockPath: input.blockPath,
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
      blockPath?: string | null
      documentPath?: string | null
      projectId: string
      sectionId?: string | null
      threadId: string
    }) =>
      workspaceStore.touchProjectCodexThreadLink(input).then((link) => {
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
      return
    }

    let isCurrent = true
    setProjectThreadLinks([])
    setSelectedProjectThreadId(null)
    setProjectThreadListState({ error: null, isLoading: true })

    workspaceStore
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

  return {
    createThreadForProject,
    isSelectingThread,
    projectThreadError: projectThreadListState.error,
    projectThreadLinks,
    projectThreadListIsLoading: projectThreadListState.isLoading,
    resumeThread,
    selectedProjectThreadId,
    startNewThread,
    threadSelectionError,
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
