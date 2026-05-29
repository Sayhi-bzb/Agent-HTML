import * as React from "react"

import type { CodexConnectionContextValue } from "@/app/codex/connection/types"
import {
  readFirstThreadRequestText,
  type ThreadPreviewState,
} from "@/app/workspace/thread-picker"
import type { ProjectCodexThreadLink } from "./types"

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

export function useThreadPreviews({
  codexConnection,
  projectThreadLinks,
}: {
  codexConnection: CodexConnectionContextValue
  projectThreadLinks: ProjectCodexThreadLink[]
}) {
  const [threadRequestPreviews, setThreadRequestPreviews] = React.useState<
    Record<string, ThreadPreviewState>
  >({})

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

  return threadRequestPreviews
}
