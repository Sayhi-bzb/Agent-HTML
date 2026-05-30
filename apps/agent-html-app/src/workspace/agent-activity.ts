import * as React from "react"
import { isTauri } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"

import type {
  PetActionKind,
  PetPresence,
  PetSpeechBubble,
} from "@/app/workspace/agent-presence"

export const codexNotificationEventName = "codex://notification"

const MAX_ACTIVITY_EVENTS = 100
const MAX_SPEECH_BUBBLES = 2
const MAX_STREAMING_MESSAGE_LENGTH = 4000

export type AgentActivityScope =
  | { blockPath: string; sectionId?: string; type: "block" }
  | { documentId: string; type: "document" }
  | { type: "system" }
  | { type: "workspace" }

export type AgentActivityTurnContext = {
  blockPath?: string | null
  sectionId?: string | null
  threadId?: string | null
  turnId?: string | null
}

export type CodexNotification = {
  method: string
  params?: unknown
}

export type AgentActivityEvent = {
  id: string
  itemId?: string
  method: string
  receivedAt: string
  scope: AgentActivityScope
  status?: string
  threadId?: string
  turnId?: string
}

export type AgentActivityState = {
  activeItemId?: string
  activeThreadId?: string
  activeTurnId?: string
  events: AgentActivityEvent[]
  latestError?: string
  latestStatus?: string
  presence?: PetPresence
  speechBubbles: PetSpeechBubble[]
  streamingMessage?: string
}

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

function getThreadId(params: unknown) {
  return (
    readString(params, ["threadId"]) ??
    readString(params, ["thread", "id"]) ??
    readString(params, ["item", "threadId"])
  )
}

function getTurnId(params: unknown) {
  return (
    readString(params, ["turnId"]) ??
    readString(params, ["turn", "id"]) ??
    readString(params, ["item", "turnId"])
  )
}

function getItemId(params: unknown) {
  return readString(params, ["itemId"]) ?? readString(params, ["item", "id"])
}

function getItemType(params: unknown) {
  return readString(params, ["item", "type"]) ?? readString(params, ["type"])
}

function getStatus(params: unknown) {
  return (
    readString(params, ["status"]) ??
    readString(params, ["turn", "status"]) ??
    readString(params, ["thread", "status"]) ??
    readString(params, ["item", "status"])
  )
}

function getError(params: unknown) {
  return (
    readString(params, ["error"]) ??
    readString(params, ["error", "message"]) ??
    readString(params, ["item", "error"]) ??
    readString(params, ["item", "error", "message"])
  )
}

function getAgentMessageDelta(params: unknown) {
  return (
    readString(params, ["delta"]) ??
    readString(params, ["text"]) ??
    readString(params, ["message"]) ??
    readString(params, ["content", "text"])
  )
}

function getCommandLabel(params: unknown) {
  const command = readString(params, ["item", "command"])
  if (command) {
    return command
  }

  if (isRecord(params) && isRecord(params.item)) {
    const commandValue = params.item.command
    if (Array.isArray(commandValue)) {
      return commandValue.filter((part) => typeof part === "string").join(" ")
    }
  }

  return undefined
}

function appendStreamingMessage(current: string | undefined, delta: string) {
  const next = `${current ?? ""}${delta}`
  if (next.length <= MAX_STREAMING_MESSAGE_LENGTH) {
    return next
  }

  return next.slice(next.length - MAX_STREAMING_MESSAGE_LENGTH)
}

function appendBubbleText(current: string, delta: string) {
  const next = `${current}${delta}`
  if (next.length <= MAX_STREAMING_MESSAGE_LENGTH) {
    return next
  }

  return next.slice(next.length - MAX_STREAMING_MESSAGE_LENGTH)
}

function createSpeechBubble(id: string, createdAt: string): PetSpeechBubble {
  return {
    createdAt,
    id,
    mode: "streaming",
    text: "",
  }
}

function appendSpeechBubble(
  bubbles: PetSpeechBubble[],
  bubble: PetSpeechBubble
) {
  const withoutDuplicate = bubbles.filter((item) => item.id !== bubble.id)
  return [...withoutDuplicate, bubble].slice(-MAX_SPEECH_BUBBLES)
}

function updateSpeechBubblesForNotification({
  eventId,
  itemId,
  notification,
  receivedAt,
  shouldUpdate,
  state,
}: {
  eventId: string
  itemId?: string
  notification: CodexNotification
  receivedAt: string
  shouldUpdate: boolean
  state: AgentActivityState
}): PetSpeechBubble[] {
  if (!shouldUpdate) {
    return state.speechBubbles
  }

  if (
    notification.method === "item/started" &&
    getItemType(notification.params) === "agentMessage"
  ) {
    return appendSpeechBubble(
      state.speechBubbles,
      createSpeechBubble(itemId ?? eventId, receivedAt)
    )
  }

  if (notification.method === "item/agentMessage/delta") {
    const delta = getAgentMessageDelta(notification.params)
    if (!delta) {
      return state.speechBubbles
    }

    const targetId =
      itemId ??
      state.activeItemId ??
      state.speechBubbles[state.speechBubbles.length - 1]?.id ??
      eventId
    const existingIndex = state.speechBubbles.findIndex(
      (bubble) => bubble.id === targetId
    )
    if (existingIndex === -1) {
      return appendSpeechBubble(state.speechBubbles, {
        ...createSpeechBubble(targetId, receivedAt),
        text: appendBubbleText("", delta),
      })
    }

    return state.speechBubbles.map((bubble, index) =>
      index === existingIndex
        ? {
            ...bubble,
            mode: "streaming" as const,
            text: appendBubbleText(bubble.text, delta),
          }
        : bubble
    )
  }

  if (
    notification.method === "item/completed" &&
    getItemType(notification.params) === "agentMessage"
  ) {
    const targetId =
      itemId ?? state.activeItemId ?? state.speechBubbles.at(-1)?.id
    if (!targetId) {
      return state.speechBubbles
    }

    return state.speechBubbles.map((bubble) =>
      bubble.id === targetId ? { ...bubble, mode: "final" as const } : bubble
    )
  }

  return state.speechBubbles
}

function createEventId(method: string, receivedAt: string, index: number) {
  return `${receivedAt}:${index}:${method}`
}

function scopeForEvent(
  context: AgentActivityTurnContext,
  threadId?: string,
  turnId?: string
): AgentActivityScope {
  const matchesActiveTurn =
    (!context.threadId || context.threadId === threadId) &&
    (!context.turnId || context.turnId === turnId)

  if (matchesActiveTurn && context.blockPath) {
    return {
      blockPath: context.blockPath,
      sectionId: context.sectionId ?? undefined,
      type: "block",
    }
  }

  if (threadId || turnId) {
    return { type: "workspace" }
  }

  return { type: "system" }
}

function shouldUpdatePresence(
  context: AgentActivityTurnContext,
  threadId?: string,
  turnId?: string
) {
  if (context.threadId && threadId && context.threadId !== threadId) {
    return false
  }

  if (context.turnId && turnId && context.turnId !== turnId) {
    return false
  }

  return true
}

function actionFromItem(params: unknown): {
  kind: PetActionKind
  label: string
} {
  const itemType = getItemType(params)

  if (itemType === "commandExecution") {
    return {
      kind: "running",
      label: getCommandLabel(params) ?? "running command",
    }
  }

  if (itemType === "fileChange") {
    return {
      kind: "editing",
      label: "editing files",
    }
  }

  if (itemType === "mcpToolCall" || itemType === "dynamicToolCall") {
    return {
      kind: "running",
      label: readString(params, ["item", "tool"]) ?? "using tool",
    }
  }

  if (itemType === "agentMessage") {
    return {
      kind: "speaking",
      label: "writing response",
    }
  }

  if (itemType === "reasoning") {
    return {
      kind: "thinking",
      label: "thinking",
    }
  }

  return {
    kind: "thinking",
    label: itemType ?? "working",
  }
}

function presenceForNotification(
  state: AgentActivityState,
  notification: CodexNotification
): PetPresence | undefined {
  const { method, params } = notification

  if (
    method.includes("requestApproval") ||
    method === "tool/requestUserInput" ||
    method.includes("requestUserInput")
  ) {
    return {
      action: {
        kind: "waiting",
        label: "waiting for approval",
      },
      message: {
        mode: "transient",
        text: "Codex needs input.",
      },
      mood: "waiting",
    }
  }

  if (method === "turn/started") {
    return {
      action: {
        kind: "thinking",
        label: "starting turn",
      },
      message: {
        mode: "transient",
        text: "Codex is working.",
      },
      mood: "working",
    }
  }

  if (method === "turn/completed") {
    const error = getError(params)
    const status = getStatus(params)
    if (error || status === "failed" || status === "error") {
      return {
        message: {
          mode: "final",
          text: error ?? "Codex turn failed.",
        },
        mood: "failed",
      }
    }

    return {
      message: {
        mode: "final",
        text: "Codex finished.",
      },
      mood: "review",
    }
  }

  if (method === "thread/status/changed") {
    const status = getStatus(params)
    if (status === "running" || status === "working") {
      return {
        action: {
          kind: "thinking",
          label: "working",
        },
        message: state.presence?.message,
        mood: "working",
      }
    }

    if (status === "waiting") {
      return {
        action: {
          kind: "waiting",
          label: "waiting",
        },
        message: state.presence?.message,
        mood: "waiting",
      }
    }
  }

  if (method === "item/started") {
    return {
      action: actionFromItem(params),
      message: state.presence?.message,
      mood: "working",
    }
  }

  if (method === "item/completed") {
    const error = getError(params)
    const status = getStatus(params)
    if (error || status === "failed" || status === "error") {
      return {
        message: {
          mode: "final",
          text: error ?? "Codex item failed.",
        },
        mood: "failed",
      }
    }

    return state.presence
  }

  if (method === "item/agentMessage/delta") {
    const delta = getAgentMessageDelta(params)
    const streamingMessage = delta
      ? appendStreamingMessage(state.streamingMessage, delta)
      : state.streamingMessage

    return {
      action: {
        kind: "speaking",
        label: "writing response",
      },
      message: streamingMessage
        ? {
            mode: "streaming",
            text: streamingMessage,
          }
        : state.presence?.message,
      mood: "working",
    }
  }

  return undefined
}

export function createInitialAgentActivityState(): AgentActivityState {
  return {
    events: [],
    speechBubbles: [],
  }
}

export function reduceCodexNotification(
  state: AgentActivityState,
  notification: CodexNotification,
  context: AgentActivityTurnContext = {},
  receivedAt = new Date().toISOString()
): AgentActivityState {
  const threadId = getThreadId(notification.params)
  const turnId = getTurnId(notification.params)
  const itemId = getItemId(notification.params)
  const eventId = createEventId(
    notification.method,
    receivedAt,
    state.events.length
  )
  const event: AgentActivityEvent = {
    id: eventId,
    itemId,
    method: notification.method,
    receivedAt,
    scope: scopeForEvent(context, threadId, turnId),
    status: getStatus(notification.params) ?? getError(notification.params),
    threadId,
    turnId,
  }
  const events = [...state.events, event].slice(-MAX_ACTIVITY_EVENTS)
  const shouldMapPresence = shouldUpdatePresence(context, threadId, turnId)
  const nextPresence = shouldMapPresence
    ? presenceForNotification(state, notification)
    : undefined
  const speechBubbles = updateSpeechBubblesForNotification({
    eventId,
    itemId,
    notification,
    receivedAt,
    shouldUpdate: shouldMapPresence,
    state,
  })
  const delta =
    notification.method === "item/agentMessage/delta"
      ? getAgentMessageDelta(notification.params)
      : undefined

  return {
    ...state,
    activeItemId: itemId ?? state.activeItemId,
    activeThreadId: threadId ?? state.activeThreadId,
    activeTurnId: turnId ?? state.activeTurnId,
    events,
    latestError: getError(notification.params) ?? state.latestError,
    latestStatus: getStatus(notification.params) ?? state.latestStatus,
    presence: nextPresence ?? state.presence,
    speechBubbles,
    streamingMessage: delta
      ? appendStreamingMessage(state.streamingMessage, delta)
      : state.streamingMessage,
  }
}

export function useAgentActivity(context: AgentActivityTurnContext) {
  const [state, setState] = React.useState<AgentActivityState>(
    createInitialAgentActivityState
  )
  const contextRef = React.useRef(context)

  React.useEffect(() => {
    contextRef.current = context
  }, [context])

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

      setState((current) =>
        reduceCodexNotification(current, event.payload, contextRef.current)
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
  }, [])

  return state
}
