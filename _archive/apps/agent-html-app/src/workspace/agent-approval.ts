import * as React from "react"
import { isTauri } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"

import type {
  CodexApprovalDecision,
  CodexApprovalRequest,
  CodexConnectionContextValue,
  CodexServerRequest,
} from "@/app/codex/connection/types"
import {
  codexNotificationEventName,
  type AgentActivityTurnContext,
  type CodexNotification,
} from "@/app/workspace/agent-activity"

const codexServerRequestEventName = "codex://server-request"

export type CodexApprovalState = {
  items: CodexApprovalRequest[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readString(value: unknown, path: string[]) {
  let current = value
  for (const key of path) {
    if (!isRecord(current)) {
      return undefined
    }
    current = current[key]
  }

  return typeof current === "string" ? current : undefined
}

function readNumber(value: unknown, path: string[]) {
  let current = value
  for (const key of path) {
    if (!isRecord(current)) {
      return undefined
    }
    current = current[key]
  }

  return typeof current === "number" ? current : undefined
}

function readDecisionList(value: unknown): CodexApprovalDecision[] {
  if (!Array.isArray(value)) {
    return ["accept", "decline", "cancel"]
  }

  return value.filter((item): item is CodexApprovalDecision =>
    item === "accept" ||
    item === "acceptForSession" ||
    item === "decline" ||
    item === "cancel"
  )
}

function getThreadId(params: unknown) {
  return readString(params, ["threadId"])
}

function getTurnId(params: unknown) {
  return readString(params, ["turnId"])
}

function getCommand(params: unknown) {
  const command = readString(params, ["command"])
  if (command) {
    return command
  }

  if (isRecord(params) && Array.isArray(params.command)) {
    return params.command.filter((part) => typeof part === "string").join(" ")
  }

  return undefined
}

function getNetworkTarget(params: unknown) {
  const host = readString(params, ["networkApprovalContext", "host"])
  if (!host) {
    return undefined
  }

  const protocol = readString(params, ["networkApprovalContext", "protocol"])
  const port = readNumber(params, ["networkApprovalContext", "port"])
  return `${protocol ? `${protocol}://` : ""}${host}${port ? `:${port}` : ""}`
}

function createApprovalRequest(
  request: CodexServerRequest
): CodexApprovalRequest | undefined {
  const { method, params } = request
  const availableDecisions = readDecisionList(
    isRecord(params) ? params.availableDecisions : undefined
  )
  const shared = {
    availableDecisions,
    id: `${request.id}:${method}`,
    itemId: readString(params, ["itemId"]),
    reason: readString(params, ["reason"]),
    requestId: request.id,
    status: "pending" as const,
    threadId: getThreadId(params),
    turnId: getTurnId(params),
  }

  if (method === "item/commandExecution/requestApproval") {
    const networkTarget = getNetworkTarget(params)
    return {
      ...shared,
      command: getCommand(params),
      cwd: readString(params, ["cwd"]),
      kind: "command",
      networkTarget,
      title: networkTarget
        ? "Network access needs approval"
        : "Command needs approval",
    }
  }

  if (method === "item/fileChange/requestApproval") {
    return {
      ...shared,
      cwd: readString(params, ["grantRoot"]),
      kind: "fileChange",
      title: "File change needs approval",
    }
  }

  if (method === "tool/requestUserInput" || method === "item/tool/requestUserInput") {
    return {
      ...shared,
      kind: "toolInput",
      title:
        readString(params, ["title"]) ??
        readString(params, ["prompt"]) ??
        "Tool needs input",
    }
  }

  return undefined
}

function shouldShowForContext(
  item: CodexApprovalRequest,
  context: AgentActivityTurnContext
) {
  if (context.threadId && item.threadId && context.threadId !== item.threadId) {
    return false
  }

  if (context.turnId && item.turnId && context.turnId !== item.turnId) {
    return false
  }

  return true
}

export function reduceCodexServerRequest(
  state: CodexApprovalState,
  request: CodexServerRequest
): CodexApprovalState {
  const approval = createApprovalRequest(request)
  if (!approval) {
    return state
  }

  return {
    items: [
      ...state.items.filter((item) => item.requestId !== approval.requestId),
      approval,
    ],
  }
}

export function reduceCodexApprovalNotification(
  state: CodexApprovalState,
  notification: CodexNotification
): CodexApprovalState {
  if (notification.method === "serverRequest/resolved") {
    const requestId = readNumber(notification.params, ["requestId"])
    if (requestId === undefined) {
      return state
    }

    return {
      items: state.items.filter((item) => item.requestId !== requestId),
    }
  }

  if (
    notification.method === "turn/completed" ||
    notification.method === "turn/interrupted"
  ) {
    const threadId = getThreadId(notification.params)
    const turnId = getTurnId(notification.params)
    return {
      items: state.items.filter(
        (item) =>
          (threadId && item.threadId !== threadId) ||
          (turnId && item.turnId !== turnId)
      ),
    }
  }

  return state
}

export function useCodexApprovals({
  codexConnection,
  context,
}: {
  codexConnection: CodexConnectionContextValue
  context: AgentActivityTurnContext
}) {
  const [state, setState] = React.useState<CodexApprovalState>({ items: [] })
  const [responseError, setResponseError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isTauri()) {
      return undefined
    }

    let isCurrent = true
    let cleanupServerRequest: (() => void) | undefined
    let cleanupNotification: (() => void) | undefined

    void listen<CodexServerRequest>(codexServerRequestEventName, (event) => {
      if (!isCurrent || !event.payload?.method) {
        return
      }

      setState((current) => reduceCodexServerRequest(current, event.payload))
    }).then((unlisten) => {
      if (isCurrent) {
        cleanupServerRequest = unlisten
        return
      }
      unlisten()
    })

    void listen<CodexNotification>(codexNotificationEventName, (event) => {
      if (!isCurrent || !event.payload?.method) {
        return
      }

      setState((current) =>
        reduceCodexApprovalNotification(current, event.payload)
      )
    }).then((unlisten) => {
      if (isCurrent) {
        cleanupNotification = unlisten
        return
      }
      unlisten()
    })

    return () => {
      isCurrent = false
      cleanupServerRequest?.()
      cleanupNotification?.()
    }
  }, [])

  const activeApproval = React.useMemo(
    () => state.items.find((item) => shouldShowForContext(item, context)) ?? null,
    [context, state.items]
  )

  const respondToApproval = React.useCallback(
    async (decision: CodexApprovalDecision) => {
      if (!activeApproval || activeApproval.status === "responding") {
        return
      }

      setResponseError(null)
      setState((current) => ({
        items: current.items.map((item) =>
          item.requestId === activeApproval.requestId
            ? { ...item, status: "responding" }
            : item
        ),
      }))

      try {
        await codexConnection.respond({
          requestId: activeApproval.requestId,
          result: decision,
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        setResponseError(message)
        setState((current) => ({
          items: current.items.map((item) =>
            item.requestId === activeApproval.requestId
              ? { ...item, status: "error" }
              : item
          ),
        }))
      }
    },
    [activeApproval, codexConnection]
  )

  return {
    activeApproval,
    approvalError: responseError,
    respondToApproval,
  }
}
