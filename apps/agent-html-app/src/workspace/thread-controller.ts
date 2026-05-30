import * as React from "react"

import { useCodexConnection } from "@/app/codex/connection"
import type { CodexConnectionContextValue } from "@/app/codex/connection/types"
import { createWorkspaceStore } from "@/app/workspace/store"
import type { WorkspaceProjectView } from "./types"

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

export function useWorkspaceThreadController({
  activeProject: _activeProject,
}: {
  activeProject: WorkspaceProjectView | null
}) {
  const codexConnection = useCodexConnection()
  const [companyAgentError, setCompanyAgentError] = React.useState<
    string | null
  >(null)
  const [isCompanyAgentStateLoading, setIsCompanyAgentStateLoading] =
    React.useState(false)
  const [threadRenameError, setThreadRenameError] = React.useState<string | null>(
    null
  )
  const [renamingThreadId, setRenamingThreadId] = React.useState<string | null>(
    null
  )
  const [optimisticThreadNames, setOptimisticThreadNames] = React.useState<
    Record<string, string>
  >({})
  const [isThreadPickerOpen, setIsThreadPickerOpen] = React.useState(false)
  const [activeThreadId, setActiveThreadId] = React.useState<string | null>(null)
  const [threadSelectionError, setThreadSelectionError] = React.useState<
    string | null
  >(null)
  const [isSelectingThread, setIsSelectingThread] = React.useState(false)

  const persistActiveThreadId = React.useCallback(async (threadId: string | null) => {
    const state = await workspaceStore.updateCompanyAgentState({
      activeThreadId: threadId,
    })
    setActiveThreadId(state.activeThreadId ?? null)
    return state.activeThreadId ?? null
  }, [])

  React.useEffect(() => {
    let isCurrent = true
    setIsCompanyAgentStateLoading(true)
    setCompanyAgentError(null)

    workspaceStore
      .getCompanyAgentState()
      .then((state) => {
        if (!isCurrent) {
          return
        }
        setActiveThreadId(state.activeThreadId ?? null)
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return
        }
        setCompanyAgentError(
          `Unable to load company agent state: ${getErrorMessage(error)}`
        )
      })
      .finally(() => {
        if (isCurrent) {
          setIsCompanyAgentStateLoading(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const startNewThread = React.useCallback(() => {
    setThreadSelectionError(null)
    setIsSelectingThread(true)
    codexConnection
      .startNewThread()
      .then((threadId) => persistActiveThreadId(threadId))
      .then(() => setIsThreadPickerOpen(false))
      .catch((error: unknown) => {
        setThreadSelectionError(
          `Unable to start Codex thread: ${getErrorMessage(error)}`
        )
      })
      .finally(() => setIsSelectingThread(false))
  }, [codexConnection, persistActiveThreadId])

  const resumeThread = React.useCallback(
    (threadId: string) => {
      setThreadSelectionError(null)
      setIsSelectingThread(true)
      codexConnection
        .request("thread/read", { includeTurns: false, threadId })
        .then(() => codexConnection.resumeThread(threadId))
        .then(() => persistActiveThreadId(threadId))
        .then(() => setIsThreadPickerOpen(false))
        .catch((error: unknown) => {
          setThreadSelectionError(
            `Unable to resume Codex thread: ${getErrorMessage(error)}`
          )
        })
        .finally(() => setIsSelectingThread(false))
    },
    [codexConnection, persistActiveThreadId]
  )

  const ensureCompanyAgentThread = React.useCallback(async () => {
    const threadId = await codexConnection.startNewThread()
    await persistActiveThreadId(threadId)
    return threadId
  }, [codexConnection, persistActiveThreadId])

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
    activeThreadId,
    codexConnection,
    ensureCompanyAgentThread,
    isThreadPickerOpen,
    setIsThreadPickerOpen,
    threadPickerProps: {
      activeThreadId,
      canSelectThread: codexConnection.status === "connected",
      codexThreadError: codexConnection.threadList.error,
      companyAgentError,
      isLoading:
        codexConnection.threadList.isLoading ||
        isCompanyAgentStateLoading,
      isSelectingThread,
      onNewThread: startNewThread,
      onRenameThread: renameThread,
      onResumeThread: resumeThread,
      optimisticThreadNames,
      renameError: threadRenameError,
      renamingThreadId,
      threadRequestPreviews: {},
      threadSelectionError,
      threadSummaries,
    },
  }
}

export type WorkspaceThreadController = ReturnType<
  typeof useWorkspaceThreadController
>

export type WorkspaceCodexConnection = CodexConnectionContextValue
