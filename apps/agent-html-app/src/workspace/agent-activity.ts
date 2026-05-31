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
const SPEECH_BUBBLE_EXIT_MS = 300
const SPEECH_BUBBLE_FINAL_TTL_MS = 4000
const MAX_STREAMING_MESSAGE_LENGTH = 4000

type AgentActivityScope =
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

type AgentActivityEvent = {
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

export function markSpeechBubbleExiting(
  state: AgentActivityState,
  bubbleId: string
): AgentActivityState {
  return {
    ...state,
    speechBubbles: state.speechBubbles.map((bubble) =>
      bubble.id === bubbleId && bubble.mode === "final"
        ? { ...bubble, mode: "exiting" as const }
        : bubble
    ),
  }
}

export function removeSpeechBubble(
  state: AgentActivityState,
  bubbleId: string
): AgentActivityState {
  return {
    ...state,
    speechBubbles: state.speechBubbles.filter(
      (bubble) => bubble.id !== bubbleId
    ),
  }
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
      label: "running command",
    }
  }

  if (itemType === "fileChange") {
    return {
      kind: "editing",
      label: "editing files",
    }
  }

  if (
    itemType === "mcpToolCall" ||
    itemType === "dynamicToolCall" ||
    itemType === "collabToolCall"
  ) {
    return {
      kind: "running",
      label: "using tool",
    }
  }

  if (itemType === "webSearch") {
    return {
      kind: "searching",
      label: "searching web",
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

  if (itemType === "plan") {
    return {
      kind: "thinking",
      label: "updating plan",
    }
  }

  if (itemType === "contextCompaction") {
    return {
      kind: "thinking",
      label: "compacting context",
    }
  }

  if (itemType === "imageView") {
    return {
      kind: "reading",
      label: "viewing image",
    }
  }

  if (itemType === "enteredReviewMode" || itemType === "exitedReviewMode") {
    return {
      kind: "thinking",
      label: "reviewing",
    }
  }

  return {
    kind: "thinking",
    label: "working",
  }
}

function presenceForNotification(
  state: AgentActivityState,
  notification: CodexNotification
): PetPresence | null | undefined {
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
    return undefined
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

    return null
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
    const itemType = getItemType(params)
    return {
      action: actionFromItem(params),
      message: itemType === "agentMessage" ? undefined : state.presence?.message,
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

    if (getItemType(params) === "agentMessage") {
      return null
    }

    return state.presence
  }

  if (method === "item/agentMessage/delta") {
    return {
      action: {
        kind: "speaking",
        label: "writing response",
      },
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
  const presence =
    nextPresence === null
      ? undefined
      : nextPresence !== undefined
        ? nextPresence
        : state.presence
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
    presence,
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
  const speechBubbleTimersRef = React.useRef(new Map<string, number[]>())

  React.useEffect(() => {
    contextRef.current = context
  }, [context])

  React.useEffect(() => {
    const currentIds = new Set(state.speechBubbles.map((bubble) => bubble.id))
    for (const [bubbleId, timers] of speechBubbleTimersRef.current) {
      if (!currentIds.has(bubbleId)) {
        for (const timer of timers) {
          window.clearTimeout(timer)
        }
        speechBubbleTimersRef.current.delete(bubbleId)
      }
    }

    for (const bubble of state.speechBubbles) {
      if (bubble.mode !== "final" || speechBubbleTimersRef.current.has(bubble.id)) {
        continue
      }

      const exitTimer = window.setTimeout(() => {
        setState((current) => markSpeechBubbleExiting(current, bubble.id))
      }, SPEECH_BUBBLE_FINAL_TTL_MS)
      const removeTimer = window.setTimeout(() => {
        setState((current) => removeSpeechBubble(current, bubble.id))
        speechBubbleTimersRef.current.delete(bubble.id)
      }, SPEECH_BUBBLE_FINAL_TTL_MS + SPEECH_BUBBLE_EXIT_MS)
      speechBubbleTimersRef.current.set(bubble.id, [exitTimer, removeTimer])
    }
  }, [state.speechBubbles])

  React.useEffect(
    () => () => {
      for (const timers of speechBubbleTimersRef.current.values()) {
        for (const timer of timers) {
          window.clearTimeout(timer)
        }
      }
      speechBubbleTimersRef.current.clear()
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
