import type { CodexThreadSummary } from "@/app/codex/connection"

export type ThreadPreviewState = {
  error?: string | null
  isLoading: boolean
  requestText?: string | null
}

export type CodexThreadPickerItem = {
  displayName: string
  isCurrentThread: boolean
  previewText: string
  threadId: string
  timestamp: string
}

const THREAD_REQUEST_PREVIEW_LIMIT = 160

export function formatThreadRelativeTime(
  value?: string | null,
  now = Date.now()
) {
  if (!value) {
    return "unknown"
  }

  const timestamp = readTimestampMs(value)
  if (timestamp === null) {
    return "unknown"
  }

  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000))
  if (seconds < 45) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

function readTimestampMs(value: string) {
  if (/^\d+$/.test(value)) {
    const numeric = Number(value)
    return numeric < 10_000_000_000 ? numeric * 1000 : numeric
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.getTime()
}

function getThreadSortTimestamp(summary: CodexThreadSummary) {
  for (const value of [summary.updatedAt, summary.createdAt]) {
    if (!value) {
      continue
    }

    const timestamp = readTimestampMs(value)
    if (timestamp !== null) {
      return timestamp
    }
  }

  return 0
}

export function sortThreadSummariesByRecent(summaries: CodexThreadSummary[]) {
  return [...summaries].sort(
    (left, right) => getThreadSortTimestamp(right) - getThreadSortTimestamp(left)
  )
}

function getThreadDisplayName(summary: CodexThreadSummary) {
  return summary.name?.trim() || summary.id.slice(0, 8)
}

export function getThreadSummaryById(
  threads: CodexThreadSummary[],
  threadId: string
) {
  return threads.find((thread) => thread.id === threadId) ?? null
}

function readObject(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null
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

function truncateThreadPreview(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim()
  return normalized.length > THREAD_REQUEST_PREVIEW_LIMIT
    ? `${normalized.slice(0, THREAD_REQUEST_PREVIEW_LIMIT - 3)}...`
    : normalized
}

function extractAgentHtmlRequest(text: string) {
  const marker = /\nRequest:\s*/.exec(text)
  if (!marker) {
    return text
  }

  return text.slice(marker.index + marker[0].length)
}

function readTextFromUserInput(value: unknown): string | null {
  if (typeof value === "string") {
    return value
  }

  const object = readObject(value)
  if (!object) {
    return null
  }

  for (const key of ["text", "content", "value"]) {
    const child = object[key]
    if (typeof child === "string") {
      return child
    }
  }

  return null
}

export function readFirstThreadRequestText(value: unknown) {
  const turns =
    readArrayFromKeys(value, ["data", "turns", "items"]) ??
    (Array.isArray(value) ? value : [])

  for (const rawTurn of turns) {
    const turn = readObject(rawTurn)
    const rawItems =
      readArrayFromKeys(turn, ["items", "summaries", "events"]) ??
      (turn ? [turn] : [])

    for (const rawItem of rawItems) {
      const item = readObject(rawItem)
      const type = item?.type
      if (type && type !== "userMessage" && type !== "user_message") {
        continue
      }

      const content = readArrayFromKeys(item, ["content", "input"])
      if (content) {
        const joined = content
          .map(readTextFromUserInput)
          .filter((text): text is string => Boolean(text?.trim()))
          .join(" ")
        if (joined.trim()) {
          return truncateThreadPreview(extractAgentHtmlRequest(joined))
        }
      }

      const text = readTextFromUserInput(item)
      if (text?.trim()) {
        return truncateThreadPreview(extractAgentHtmlRequest(text))
      }
    }
  }

  return null
}

export function buildCodexThreadPickerItems({
  optimisticThreadNames,
  activeThreadId,
  threadRequestPreviews,
  threadSummaries,
}: {
  activeThreadId?: string | null
  optimisticThreadNames: Record<string, string>
  threadRequestPreviews: Record<string, ThreadPreviewState>
  threadSummaries: CodexThreadSummary[]
}): CodexThreadPickerItem[] {
  return sortThreadSummariesByRecent(threadSummaries).map((summary) => {
    const preview = threadRequestPreviews[summary.id]

    return {
      displayName:
        optimisticThreadNames[summary.id] ?? getThreadDisplayName(summary),
      isCurrentThread: activeThreadId === summary.id,
      previewText: preview?.isLoading
        ? "Loading request..."
        : preview?.requestText || "No request yet",
      threadId: summary.id,
      timestamp: formatThreadRelativeTime(summary.updatedAt ?? summary.createdAt),
    }
  })
}
