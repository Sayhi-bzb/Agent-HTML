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
import {
  buildProjectThreadPickerItems,
  getThreadSummaryById,
  type ThreadPreviewState,
} from "@/app/workspace/thread-picker-model"
import type { CodexThreadSummary } from "@/app/codex/connection"
import type { ProjectCodexThreadLink } from "@/app/workspace/types"

export type { ThreadPreviewState }
export {
  formatThreadRelativeTime,
  readFirstThreadRequestText,
  sortProjectThreadLinksByRecent,
} from "@/app/workspace/thread-picker-model"

function copyThreadId(threadId: string) {
  void navigator.clipboard?.writeText(threadId).catch(() => {
    return undefined
  })
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
  const threadItems = React.useMemo(
    () =>
      buildProjectThreadPickerItems({
        optimisticThreadNames,
        projectThreadLinks,
        selectedProjectThreadId,
        threadRequestPreviews,
        threadSummaries,
      }),
    [
      optimisticThreadNames,
      projectThreadLinks,
      selectedProjectThreadId,
      threadRequestPreviews,
      threadSummaries,
    ]
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
          ) : threadItems.length > 0 ? (
            threadItems.map((item) => {
              const summary = getThreadSummaryById(
                threadSummaries,
                item.threadId
              )
              const isEditing = editingThreadId === item.threadId
              const isRenaming = renamingThreadId === item.threadId

              return (
                <div
                  key={item.threadId}
                  className={[
                    "group min-w-0 overflow-hidden rounded-md border px-3 py-2 text-xs transition-colors",
                    item.isCurrentThread
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
                            threadId: item.threadId,
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
                        aria-current={item.isCurrentThread ? "true" : undefined}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        disabled={!canSelectThread || isSelectingThread}
                        onClick={() => onResumeThread(item.threadId)}
                        type="button"
                      >
                        <span className="min-w-0 shrink-0 truncate font-medium text-foreground">
                          {item.displayName}
                        </span>
                        <span className="shrink-0 text-muted-foreground">
                          {item.timestamp}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-muted-foreground">
                          {item.previewText}
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
                            onSelect={() => copyThreadId(item.threadId)}
                          >
                            Copy thread id
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={
                              !canSelectThread || isSelectingThread || isRenaming
                            }
                            onSelect={() => {
                              setEditingThreadId(item.threadId)
                              setEditingName(
                                optimisticThreadNames[item.threadId] ??
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
