import * as React from "react"
import { isTauri } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"

import {
  codexNotificationEventName,
  type AgentActivityTurnContext,
  type CodexNotification,
} from "@/app/workspace/agent-activity"

const REFRESH_DEBOUNCE_MS = 250

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readString(value: unknown, path: string[]): string | undefined {
  let current = value
  for (const key of path) {
    if (!isRecord(current)) {
      return undefined
    }
    current = current[key]
  }

  return typeof current === "string" ? current : undefined
}

function readThreadId(params: unknown) {
  return (
    readString(params, ["threadId"]) ??
    readString(params, ["thread", "id"]) ??
    readString(params, ["item", "threadId"])
  )
}

function readTurnId(params: unknown) {
  return (
    readString(params, ["turnId"]) ??
    readString(params, ["turn", "id"]) ??
    readString(params, ["item", "turnId"])
  )
}

function readItemType(params: unknown) {
  return readString(params, ["item", "type"]) ?? readString(params, ["type"])
}

export function shouldRefreshDocumentForCodexNotification({
  context,
  notification,
}: {
  context: AgentActivityTurnContext
  notification: CodexNotification
}) {
  const threadId = readThreadId(notification.params)
  const turnId = readTurnId(notification.params)
  if (context.threadId && threadId && context.threadId !== threadId) {
    return false
  }
  if (context.turnId && turnId && context.turnId !== turnId) {
    return false
  }

  if (
    notification.method === "item/completed" &&
    readItemType(notification.params) === "fileChange"
  ) {
    return true
  }

  return notification.method === "turn/completed"
}

export function useAgentDocumentRefresh({
  context,
  reloadDocumentFromDisk,
}: {
  context: AgentActivityTurnContext
  reloadDocumentFromDisk: (options?: { reason?: string }) => Promise<boolean>
}) {
  const contextRef = React.useRef(context)
  const reloadRef = React.useRef(reloadDocumentFromDisk)
  const pendingRefreshRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    contextRef.current = context
  }, [context])

  React.useEffect(() => {
    reloadRef.current = reloadDocumentFromDisk
  }, [reloadDocumentFromDisk])

  React.useEffect(
    () => () => {
      if (pendingRefreshRef.current !== null) {
        window.clearTimeout(pendingRefreshRef.current)
      }
    },
    []
  )

  React.useEffect(() => {
    if (!isTauri()) {
      return undefined
    }

    let isCurrent = true
    let unlisten: (() => void) | undefined

    void listen<CodexNotification>(codexNotificationEventName, (event) => {
      if (!isCurrent || !event.payload?.method) {
        return
      }
      if (
        !shouldRefreshDocumentForCodexNotification({
          context: contextRef.current,
          notification: event.payload,
        })
      ) {
        return
      }

      if (pendingRefreshRef.current !== null) {
        window.clearTimeout(pendingRefreshRef.current)
      }
      pendingRefreshRef.current = window.setTimeout(() => {
        pendingRefreshRef.current = null
        void reloadRef.current({ reason: "Reloading artifact after Codex edit." })
      }, REFRESH_DEBOUNCE_MS)
    }).then((nextUnlisten) => {
      if (isCurrent) {
        unlisten = nextUnlisten
        return
      }
      nextUnlisten()
    })

    return () => {
      isCurrent = false
      unlisten?.()
      if (pendingRefreshRef.current !== null) {
        window.clearTimeout(pendingRefreshRef.current)
        pendingRefreshRef.current = null
      }
    }
  }, [])
}
