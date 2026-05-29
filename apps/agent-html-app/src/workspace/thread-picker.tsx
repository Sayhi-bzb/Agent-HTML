import * as React from "react"
import { CheckIcon, MoreHorizontalIcon, PlusIcon, XIcon } from "lucide-react"

import { Badge } from "@/app/shared/ui/badge"
import { Button } from "@/app/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/shared/ui/dropdown-menu"
import { Input } from "@/app/shared/ui/input"
import { ScrollArea } from "@/app/shared/ui/scroll-area"
import type { CodexThreadSummary } from "@/app/codex/connection"
import type { ProjectCodexThreadLink } from "@/app/workspace/types"

export type ThreadPreviewState = {
  error?: string | null
  isLoading: boolean
  requestText?: string | null
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

function getThreadSortTimestamp(
  link: ProjectCodexThreadLink,
  summary: ReturnType<typeof getThreadSummaryById>
) {
  for (const value of [
    summary?.updatedAt,
    link.lastUsedAt,
    summary?.createdAt,
    link.createdAt,
  ]) {
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

export function sortProjectThreadLinksByRecent(
  links: ProjectCodexThreadLink[],
  summaries: CodexThreadSummary[]
) {
  return [...links].sort((left, right) => {
    const leftSummary = getThreadSummaryById(summaries, left.threadId)
    const rightSummary = getThreadSummaryById(summaries, right.threadId)
    return (
      getThreadSortTimestamp(right, rightSummary) -
      getThreadSortTimestamp(left, leftSummary)
    )
  })
}

function getThreadDisplayName(
  link: ProjectCodexThreadLink,
  summary: ReturnType<typeof getThreadSummaryById>
) {
  return summary?.name?.trim() || link.threadId.slice(0, 8)
}

function copyThreadId(threadId: string) {
  void navigator.clipboard?.writeText(threadId).catch(() => {
    return undefined
  })
}

function getThreadSummaryById(
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

export function ProjectThreadPickerContent({
  canSelectThread,
  codexThreadError,
  isLoading,
  isSelectingThread,
  onNewThread,
  onRenameThread,
  onResumeThread,
  optimisticThreadNames,
  projectThreadError,
  projectThreadLinks,
  renameError,
  renamingThreadId,
  selectedProjectThreadId,
  threadSelectionError,
  threadRequestPreviews,
  threadSummaries,
}: {
  canSelectThread: boolean
  codexThreadError?: string | null
  isLoading: boolean
  isSelectingThread: boolean
  onNewThread: () => void
  onRenameThread: (input: { name: string; threadId: string }) => Promise<void>
  onResumeThread: (threadId: string) => void
  optimisticThreadNames: Record<string, string>
  projectThreadError?: string | null
  projectThreadLinks: ProjectCodexThreadLink[]
  renameError?: string | null
  renamingThreadId?: string | null
  selectedProjectThreadId?: string | null
  threadSelectionError?: string | null
  threadRequestPreviews: Record<string, ThreadPreviewState>
  threadSummaries: CodexThreadSummary[]
}) {
  const [editingThreadId, setEditingThreadId] = React.useState<string | null>(
    null
  )
  const [editingName, setEditingName] = React.useState("")
  const sortedProjectThreadLinks = React.useMemo(
    () => sortProjectThreadLinksByRecent(projectThreadLinks, threadSummaries),
    [projectThreadLinks, threadSummaries]
  )

  return (
    <div className="flex min-w-0 flex-col gap-3 text-sm">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">Codex threads</p>
        </div>
        <Badge asChild variant="outline">
          <button
            className="cursor-pointer hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50"
            disabled={!canSelectThread || isSelectingThread}
            onClick={onNewThread}
            title={canSelectThread ? undefined : "Codex is starting"}
            type="button"
          >
            <PlusIcon data-icon="inline-start" />
            <span>New</span>
          </button>
        </Badge>
      </div>
      {codexThreadError ? (
        <p className="text-xs text-destructive">{codexThreadError}</p>
      ) : null}
      {projectThreadError ? (
        <p className="text-xs text-destructive">{projectThreadError}</p>
      ) : null}
      {threadSelectionError ? (
        <p className="text-xs text-destructive">{threadSelectionError}</p>
      ) : null}
      {renameError ? (
        <p className="text-xs text-destructive">{renameError}</p>
      ) : null}
      <ScrollArea
        className="min-w-0"
        data-thread-picker-no-drag=""
        viewportClassName="max-h-60"
      >
        <div className="grid min-w-0 gap-2 pr-3">
          {!canSelectThread ? (
            <p className="text-xs text-muted-foreground">
              Connecting to Codex...
            </p>
          ) : isLoading ? (
            <p className="text-xs text-muted-foreground">Loading threads...</p>
          ) : projectThreadLinks.length > 0 ? (
            sortedProjectThreadLinks.map((link) => {
              const summary = getThreadSummaryById(
                threadSummaries,
                link.threadId
              )
              const displayName =
                optimisticThreadNames[link.threadId] ??
                getThreadDisplayName(link, summary)
              const timestamp = formatThreadRelativeTime(
                summary?.updatedAt ??
                  link.lastUsedAt ??
                  summary?.createdAt ??
                  link.createdAt
              )
              const preview = threadRequestPreviews[link.threadId]
              const previewText = preview?.isLoading
                ? "Loading request..."
                : preview?.requestText || "No request yet"
              const isEditing = editingThreadId === link.threadId
              const isRenaming = renamingThreadId === link.threadId
              const isCurrentThread = selectedProjectThreadId === link.threadId

              return (
                <div
                  key={link.threadId}
                  className={[
                    "group min-w-0 overflow-hidden rounded-md border px-3 py-2 text-xs transition-colors",
                    isCurrentThread
                      ? "border-border bg-background text-foreground"
                      : "border-border/60 bg-transparent hover:bg-muted/50",
                  ].join(" ")}
                >
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    {isEditing ? (
                      <form
                        className="flex min-w-0 flex-1 items-center gap-1.5"
                        onSubmit={(event) => {
                          event.preventDefault()
                          const nextName = editingName.trim()
                          if (!nextName || isRenaming) {
                            return
                          }
                          void onRenameThread({
                            name: nextName,
                            threadId: link.threadId,
                          }).then(() => setEditingThreadId(null))
                        }}
                      >
                        <Input
                          autoFocus
                          className="h-7 min-w-0 flex-1 px-2 text-xs"
                          disabled={isRenaming}
                          onChange={(event) =>
                            setEditingName(event.target.value)
                          }
                          value={editingName}
                        />
                        <Button
                          className="size-7 p-0"
                          disabled={isRenaming || !editingName.trim()}
                          type="submit"
                          variant="ghost"
                        >
                          <CheckIcon className="size-3.5" />
                        </Button>
                        <Button
                          className="size-7 p-0"
                          disabled={isRenaming}
                          onClick={() => setEditingThreadId(null)}
                          type="button"
                          variant="ghost"
                        >
                          <XIcon className="size-3.5" />
                        </Button>
                      </form>
                    ) : (
                      <button
                        aria-current={isCurrentThread ? "true" : undefined}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        disabled={!canSelectThread || isSelectingThread}
                        onClick={() => onResumeThread(link.threadId)}
                        type="button"
                      >
                        <span className="min-w-0 shrink-0 truncate font-medium text-foreground">
                          {displayName}
                        </span>
                        <span className="shrink-0 text-muted-foreground">
                          {timestamp}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-muted-foreground">
                          {previewText}
                        </span>
                      </button>
                    )}
                    {!isEditing ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-label="Thread actions"
                            className="size-7 shrink-0 p-0 opacity-70 hover:opacity-100"
                            title="Thread actions"
                            type="button"
                            variant="ghost"
                          >
                            <MoreHorizontalIcon className="size-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={6}>
                          <DropdownMenuItem
                            onSelect={() => copyThreadId(link.threadId)}
                          >
                            Copy thread id
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={
                              !canSelectThread || isSelectingThread || isRenaming
                            }
                            onSelect={() => {
                              setEditingThreadId(link.threadId)
                              setEditingName(
                                optimisticThreadNames[link.threadId] ??
                                  summary?.name?.trim() ??
                                  ""
                              )
                            }}
                          >
                            Rename
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-xs text-muted-foreground">
              No previous threads for this project.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
