import * as React from "react"

import { useCodexConnection } from "@/app/codex/connection"
import type { CodexConnectionContextValue } from "@/app/codex/connection/types"
import { useProjectThreadLinks } from "@/app/workspace/thread-links-controller"
import { useThreadPreviews } from "@/app/workspace/thread-previews-controller"
import type { WorkspaceProjectView } from "./types"

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
  activeProject,
}: {
  activeProject: WorkspaceProjectView | null
}) {
  const codexConnection = useCodexConnection()
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
  const threadLinks = useProjectThreadLinks({
    activeProject,
    codexConnection,
    onThreadPickerOpenChange: setIsThreadPickerOpen,
  })
  const threadRequestPreviews = useThreadPreviews({
    codexConnection,
    projectThreadLinks: threadLinks.projectThreadLinks,
  })

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

  React.useEffect(() => {
    if (!activeProject) {
      setOptimisticThreadNames({})
    }
  }, [activeProject])

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
    createThreadForProject: threadLinks.createThreadForProject,
    isThreadPickerOpen,
    selectedProjectThreadId: threadLinks.selectedProjectThreadId,
    setIsThreadPickerOpen,
    threadPickerProps: {
      canSelectThread: codexConnection.status === "connected",
      codexThreadError: codexConnection.threadList.error,
      isLoading:
        codexConnection.threadList.isLoading ||
        threadLinks.projectThreadListIsLoading,
      isSelectingThread: threadLinks.isSelectingThread,
      onNewThread: threadLinks.startNewThread,
      onRenameThread: renameThread,
      onResumeThread: threadLinks.resumeThread,
      optimisticThreadNames,
      projectThreadError: threadLinks.projectThreadError,
      projectThreadLinks: threadLinks.projectThreadLinks,
      renameError: threadRenameError,
      renamingThreadId,
      selectedProjectThreadId: threadLinks.selectedProjectThreadId,
      threadRequestPreviews,
      threadSelectionError: threadLinks.threadSelectionError,
      threadSummaries,
    },
    touchProjectThread: threadLinks.touchProjectThread,
  }
}

export type WorkspaceThreadController = ReturnType<
  typeof useWorkspaceThreadController
>

export type WorkspaceCodexConnection = CodexConnectionContextValue
