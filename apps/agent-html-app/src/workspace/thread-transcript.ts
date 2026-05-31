import * as React from "react"
import { isTauri } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"

import type { CodexConnectionContextValue } from "@/app/codex/connection/types"
import { readObject, readString } from "@/app/codex/connection/object-readers"
import {
  codexNotificationEventName,
  type CodexNotification,
} from "@/app/workspace/agent-activity"

export type ThreadTranscriptItem = {
  aggregatedOutput?: string
  argumentsText?: string
  command?: string
  contentText?: string
  cwd?: string
  id: string
  phase?: string
  query?: string
  resultText?: string
  server?: string
  status?: string
  summaryText?: string
  tool?: string
  type: string
}

export type ThreadTranscriptTurn = {
  id: string
  items: ThreadTranscriptItem[]
  status?: string
}

export type ThreadTranscriptState = {
  error?: string | null
  isLoading: boolean
  threadId?: string | null
  turns: ThreadTranscriptTurn[]
}

const MAX_OUTPUT_LENGTH = 6000

export const emptyThreadTranscriptState: ThreadTranscriptState = {
  error: null,
  isLoading: false,
  threadId: null,
  turns: [],
}

export function getThreadTranscriptLoadKey({
  connectionStatus,
  threadId,
}: {
  connectionStatus: CodexConnectionContextValue["status"]
  threadId?: string | null
}) {
  return `${connectionStatus}:${threadId ?? ""}`
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

function readScalar(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return undefined
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

function readItemId(params: unknown) {
  return readString(params, ["itemId"]) ?? readString(params, ["item", "id"])
}

function readStatus(value: unknown) {
  return (
    readString(value, ["status"]) ??
    readString(value, ["turn", "status"]) ??
    readString(value, ["item", "status"])
  )
}

function createFallbackId(prefix: string, index: number) {
  return `${prefix}_${index}`
}

function normalizeTextContent(value: unknown): string | undefined {
  const scalar = readScalar(value)
  if (scalar) {
    return scalar
  }

  if (Array.isArray(value)) {
    const text = value
      .map(normalizeTextContent)
      .filter((item): item is string => Boolean(item?.trim()))
      .join("\n")
    return text || undefined
  }

  const object = readObject(value)
  if (!object) {
    return undefined
  }

  return (
    readString(object, ["text"]) ??
    readString(object, ["content"]) ??
    readString(object, ["value"]) ??
    readString(object, ["summary"])
  )
}

function normalizeCommand(value: unknown): string | undefined {
  const scalar = readScalar(value)
  if (scalar) {
    return scalar
  }
  if (Array.isArray(value)) {
    return value
      .map(readScalar)
      .filter((part): part is string => Boolean(part))
      .join(" ")
  }
  return undefined
}

function stringifyCompact(value: unknown): string | undefined {
  const scalar = readScalar(value)
  if (scalar) {
    return scalar
  }
  if (value === undefined || value === null) {
    return undefined
  }
  try {
    return JSON.stringify(value)
  } catch {
    return undefined
  }
}

function clampOutput(text: string | undefined) {
  if (!text || text.length <= MAX_OUTPUT_LENGTH) {
    return text
  }
  return text.slice(text.length - MAX_OUTPUT_LENGTH)
}

function normalizeTranscriptItem(
  rawItem: unknown,
  fallbackIndex = 0
): ThreadTranscriptItem | null {
  const item = readObject(rawItem)
  if (!item) {
    return null
  }

  const type = readString(item, ["type"]) ?? "unknown"
  const id =
    readString(item, ["id"]) ??
    readString(item, ["itemId"]) ??
    createFallbackId(type, fallbackIndex)
  const contentText =
    readString(item, ["text"]) ??
    normalizeTextContent(item.content) ??
    normalizeTextContent(item.input)
  const summaryText =
    normalizeTextContent(item.summary) ?? normalizeTextContent(item.content)

  return {
    aggregatedOutput: clampOutput(
      readString(item, ["aggregatedOutput"]) ??
        readString(item, ["output"]) ??
        normalizeTextContent(item.output)
    ),
    argumentsText: stringifyCompact(item.arguments),
    command: normalizeCommand(item.command),
    contentText,
    cwd: readString(item, ["cwd"]),
    id,
    phase: readString(item, ["phase"]),
    query:
      readString(item, ["query"]) ??
      readString(item, ["action", "query"]) ??
      normalizeTextContent(readObject(item.action)?.queries),
    resultText:
      normalizeTextContent(item.result) ?? normalizeTextContent(item.error),
    server: readString(item, ["server"]),
    status: readStatus(item),
    summaryText,
    tool: readString(item, ["tool"]),
    type,
  }
}

export function normalizeThreadTranscriptTurns(
  value: unknown
): ThreadTranscriptTurn[] {
  const turns =
    readArrayFromKeys(value, ["data", "turns", "items"]) ??
    (Array.isArray(value) ? value : [])

  return turns.flatMap((rawTurn, turnIndex) => {
    const turn = readObject(rawTurn)
    if (!turn) {
      return []
    }

    const id =
      readString(turn, ["id"]) ??
      readString(turn, ["turnId"]) ??
      createFallbackId("turn", turnIndex)
    const rawItems =
      readArrayFromKeys(turn, ["items", "summaries", "events"]) ?? []

    return [
      {
        id,
        items: rawItems
          .map((rawItem, itemIndex) =>
            normalizeTranscriptItem(rawItem, itemIndex)
          )
          .filter((item): item is ThreadTranscriptItem => item !== null),
        status: readStatus(turn),
      },
    ]
  })
}

function upsertTurn(
  turns: ThreadTranscriptTurn[],
  nextTurn: ThreadTranscriptTurn
) {
  const index = turns.findIndex((turn) => turn.id === nextTurn.id)
  if (index === -1) {
    return [...turns, nextTurn]
  }

  return turns.map((turn, turnIndex) =>
    turnIndex === index ? { ...turn, ...nextTurn } : turn
  )
}

function upsertItem(
  turns: ThreadTranscriptTurn[],
  turnId: string,
  item: ThreadTranscriptItem
) {
  const turnIndex = turns.findIndex((turn) => turn.id === turnId)
  const targetTurn =
    turnIndex === -1 ? { id: turnId, items: [] } : turns[turnIndex]
  const itemIndex = targetTurn.items.findIndex(
    (currentItem) => currentItem.id === item.id
  )
  const nextItems =
    itemIndex === -1
      ? [...targetTurn.items, item]
      : targetTurn.items.map((currentItem, index) =>
          index === itemIndex ? { ...currentItem, ...item } : currentItem
        )
  const nextTurn = { ...targetTurn, items: nextItems }

  return turnIndex === -1
    ? [...turns, nextTurn]
    : turns.map((turn, index) => (index === turnIndex ? nextTurn : turn))
}

function appendItemText(
  turns: ThreadTranscriptTurn[],
  turnId: string,
  itemId: string,
  itemType: string,
  key: "aggregatedOutput" | "contentText" | "summaryText",
  delta: string
) {
  const turnIndex = turns.findIndex((turn) => turn.id === turnId)
  const targetTurn =
    turnIndex === -1 ? { id: turnId, items: [] } : turns[turnIndex]
  const itemIndex = targetTurn.items.findIndex((item) => item.id === itemId)
  const currentItem =
    itemIndex === -1
      ? { id: itemId, type: itemType }
      : targetTurn.items[itemIndex]
  const nextItem = {
    ...currentItem,
    [key]: clampOutput(`${currentItem[key] ?? ""}${delta}`),
  }
  const nextItems =
    itemIndex === -1
      ? [...targetTurn.items, nextItem]
      : targetTurn.items.map((item, index) =>
          index === itemIndex ? nextItem : item
        )
  const nextTurn = { ...targetTurn, items: nextItems }

  return turnIndex === -1
    ? [...turns, nextTurn]
    : turns.map((turn, index) => (index === turnIndex ? nextTurn : turn))
}

export function reduceThreadTranscriptNotification(
  state: ThreadTranscriptState,
  notification: CodexNotification
): ThreadTranscriptState {
  const { method, params } = notification
  const threadId = readThreadId(params)
  if (state.threadId && threadId && state.threadId !== threadId) {
    return state
  }

  if (method === "turn/started") {
    const turnId = readTurnId(params)
    if (!turnId) {
      return state
    }
    return {
      ...state,
      turns: upsertTurn(state.turns, {
        id: turnId,
        items: [],
        status: "inProgress",
      }),
    }
  }

  if (method === "turn/completed") {
    const turnId = readTurnId(params)
    if (!turnId) {
      return state
    }
    return {
      ...state,
      turns: state.turns.map((turn) =>
        turn.id === turnId
          ? { ...turn, status: readStatus(params) ?? "completed" }
          : turn
      ),
    }
  }

  if (method === "item/started" || method === "item/completed") {
    const turnId = readTurnId(params)
    const item = normalizeTranscriptItem(readObject(params)?.item)
    if (!turnId || !item) {
      return state
    }
    return {
      ...state,
      turns: upsertItem(state.turns, turnId, item),
    }
  }

  if (method === "item/agentMessage/delta") {
    const turnId = readTurnId(params)
    const itemId = readItemId(params)
    const delta = readString(params, ["delta"]) ?? readString(params, ["text"])
    if (!turnId || !itemId || !delta) {
      return state
    }
    return {
      ...state,
      turns: appendItemText(
        state.turns,
        turnId,
        itemId,
        "agentMessage",
        "contentText",
        delta
      ),
    }
  }

  if (method === "item/plan/delta") {
    const turnId = readTurnId(params)
    const itemId = readItemId(params)
    const delta = readString(params, ["delta"]) ?? readString(params, ["text"])
    if (!turnId || !itemId || !delta) {
      return state
    }
    return {
      ...state,
      turns: appendItemText(
        state.turns,
        turnId,
        itemId,
        "plan",
        "contentText",
        delta
      ),
    }
  }

  if (method === "item/reasoning/summaryTextDelta") {
    const turnId = readTurnId(params)
    const itemId = readItemId(params)
    const delta = readString(params, ["delta"]) ?? readString(params, ["text"])
    if (!turnId || !itemId || !delta) {
      return state
    }
    return {
      ...state,
      turns: appendItemText(
        state.turns,
        turnId,
        itemId,
        "reasoning",
        "summaryText",
        delta
      ),
    }
  }

  if (method === "item/commandExecution/outputDelta") {
    const turnId = readTurnId(params)
    const itemId = readItemId(params)
    const delta =
      readString(params, ["delta"]) ??
      readString(params, ["output"]) ??
      readString(params, ["chunk"])
    if (!turnId || !itemId || !delta) {
      return state
    }
    return {
      ...state,
      turns: appendItemText(
        state.turns,
        turnId,
        itemId,
        "commandExecution",
        "aggregatedOutput",
        delta
      ),
    }
  }

  return state
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return String(error)
}

export function useThreadTranscript({
  codexConnection,
  threadId,
}: {
  codexConnection: CodexConnectionContextValue
  threadId?: string | null
}) {
  const codexConnectionRef = React.useRef(codexConnection)
  const [state, setState] = React.useState<ThreadTranscriptState>({
    ...emptyThreadTranscriptState,
    threadId,
  })
  const connectionStatus = codexConnection.status
  const loadKey = getThreadTranscriptLoadKey({
    connectionStatus,
    threadId,
  })

  React.useEffect(() => {
    codexConnectionRef.current = codexConnection
  }, [codexConnection])

  const reload = React.useCallback(() => {
    const currentConnection = codexConnectionRef.current
    if (!threadId || currentConnection.status !== "connected") {
      setState({
        ...emptyThreadTranscriptState,
        threadId,
      })
      return
    }

    let isCurrent = true
    setState((current) => ({
      ...current,
      error: null,
      isLoading: true,
      threadId,
    }))

    void loadThreadTurns({ codexConnection: currentConnection, threadId })
      .then((turns) => {
        if (!isCurrent) {
          return
        }
        setState({
          error: null,
          isLoading: false,
          threadId,
          turns,
        })
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return
        }
        setState({
          error: getErrorMessage(error),
          isLoading: false,
          threadId,
          turns: [],
        })
      })

    return () => {
      isCurrent = false
    }
  }, [threadId])

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      reload()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadKey, reload])

  React.useEffect(() => {
    if (!isTauri() || !threadId) {
      return undefined
    }

    let isCurrent = true
    let unlisten: (() => void) | undefined

    void listen<CodexNotification>(codexNotificationEventName, (event) => {
      if (!isCurrent || !event.payload?.method) {
        return
      }
      setState((current) =>
        reduceThreadTranscriptNotification(current, event.payload)
      )
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
    }
  }, [threadId])

  return { ...state, reload }
}

async function loadThreadTurns({
  codexConnection,
  threadId,
}: {
  codexConnection: CodexConnectionContextValue
  threadId: string
}) {
  const turns: ThreadTranscriptTurn[] = []
  let cursor: string | null | undefined

  do {
    const result = await codexConnection.request("thread/turns/list", {
      cursor,
      itemsView: "full",
      limit: 50,
      sortDirection: "asc",
      threadId,
    })
    turns.push(...normalizeThreadTranscriptTurns(result))
    cursor = readString(result, ["nextCursor"]) ?? null
  } while (cursor)

  return turns
}
