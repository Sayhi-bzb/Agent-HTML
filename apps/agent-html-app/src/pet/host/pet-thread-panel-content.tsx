import type { ReactNode } from "react"
import { CheckIcon, MoreHorizontalIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react"
import { useState } from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/shared/ui/avatar"
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
import { Separator } from "@/app/shared/ui/separator"
import {
  getThreadSummaryById,
  type CodexThreadPickerItem,
  type ThreadPreviewState,
} from "@/app/workspace/thread-picker-model"
import type { CodexThreadSummary } from "@/app/codex/connection"

type ThreadPanelChatRender = (input: {
  onSearchOpenChange: (open: boolean) => void
  searchOpen: boolean
}) => ReactNode

function copyThreadId(threadId: string) {
  void navigator.clipboard?.writeText(threadId).catch(() => {
    return undefined
  })
}

export function PetThreadPanelContent({
  activeThreadId,
  canSelectThread,
  chat,
  codexThreadError,
  companyAgentError,
  isLoading,
  isSelectingThread,
  items,
  onClose,
  onNewThread,
  onRenameThread,
  onResumeThread,
  optimisticThreadNames,
  renameError,
  renamingThreadId,
  threadSelectionError,
  threadSummaries,
}: {
  activeThreadId?: string | null
  canSelectThread: boolean
  chat: ReactNode | ThreadPanelChatRender
  codexThreadError?: string | null
  companyAgentError?: string | null
  isLoading: boolean
  isSelectingThread: boolean
  items: CodexThreadPickerItem[]
  onClose?: () => void
  onNewThread: () => void
  onRenameThread: (input: { name: string; threadId: string }) => Promise<void>
  onResumeThread: (threadId: string) => void
  optimisticThreadNames: Record<string, string>
  renameError?: string | null
  renamingThreadId?: string | null
  threadRequestPreviews: Record<string, ThreadPreviewState>
  threadSelectionError?: string | null
  threadSummaries: CodexThreadSummary[]
}) {
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const activeThread = items.find((item) => item.threadId === activeThreadId)
  const subtitle = activeThread?.previewText || activeThreadId || "No thread selected"

  return (
    <section className="flex h-[min(38rem,calc(100vh-5rem))] min-h-96 w-[min(58rem,calc(100vw-4rem))] overflow-hidden rounded-lg border bg-background text-foreground shadow-sm">
      <aside className="flex w-72 shrink-0 flex-col border-r bg-muted/20">
        <div className="flex min-h-14 items-center justify-between gap-3 px-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Threads</p>
          </div>
          <Button
            aria-label="New thread"
            data-popover-no-drag
            disabled={!canSelectThread || isSelectingThread}
            onClick={onNewThread}
            size="icon-sm"
            title={canSelectThread ? undefined : "Codex is starting"}
            type="button"
            variant="ghost"
          >
            <PlusIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>
        <Separator />
        <ThreadPanelErrors
          codexThreadError={codexThreadError}
          companyAgentError={companyAgentError}
          renameError={renameError}
          threadSelectionError={threadSelectionError}
        />
        <ScrollArea
          className="min-h-0 flex-1"
          data-popover-no-drag
          data-thread-picker-no-drag=""
          viewportClassName="p-2"
        >
          <div className="flex min-w-0 flex-col gap-1">
            {!canSelectThread ? (
              <ThreadPanelMutedText text="Connecting to Codex..." />
            ) : isLoading ? (
              <ThreadPanelMutedText text="Loading threads..." />
            ) : items.length > 0 ? (
              items.map((item) => {
                const summary = getThreadSummaryById(
                  threadSummaries,
                  item.threadId
                )
                const isEditing = editingThreadId === item.threadId
                const isRenaming = renamingThreadId === item.threadId

                return (
                  <div
                    className={[
                      "group min-w-0 rounded-md px-2.5 py-2 text-xs transition-colors",
                      item.isCurrentThread
                        ? "bg-background text-foreground shadow-sm"
                        : "bg-transparent hover:bg-background/70",
                    ].join(" ")}
                    key={item.threadId}
                  >
                    <div className="flex min-w-0 items-center gap-2">
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
                        <>
                          <button
                            aria-current={
                              item.isCurrentThread ? "true" : undefined
                            }
                            className="flex min-w-0 flex-1 flex-col gap-1 text-left"
                            disabled={!canSelectThread || isSelectingThread}
                            onClick={() => onResumeThread(item.threadId)}
                            type="button"
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="min-w-0 flex-1 truncate font-medium">
                                {item.displayName}
                              </span>
                              <span className="shrink-0 text-[10px] text-muted-foreground">
                                {item.timestamp}
                              </span>
                            </span>
                            <span className="truncate text-muted-foreground">
                              {item.previewText}
                            </span>
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-label="Thread actions"
                                className="size-7 shrink-0 p-0 opacity-70 hover:opacity-100"
                                data-popover-no-drag
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
                                  !canSelectThread ||
                                  isSelectingThread ||
                                  isRenaming
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
                        </>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <ThreadPanelMutedText text="No Codex threads yet." />
            )}
          </div>
        </ScrollArea>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex min-h-14 cursor-grab items-center gap-3 bg-muted/30 px-4 active:cursor-grabbing"
          data-selection="none"
        >
          <Avatar size="default">
            <AvatarImage alt="Thread transcript" src="/avatars/ai.png" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-medium leading-5">
              {activeThread?.displayName ?? "Thread"}
            </h2>
            <p className="truncate text-xs leading-4 text-muted-foreground">
              {subtitle}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              aria-label="Search transcript"
              aria-pressed={isSearchOpen}
              data-popover-no-drag
              onClick={() => setIsSearchOpen((current) => !current)}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <SearchIcon className="size-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="More thread actions"
              data-popover-no-drag
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <MoreHorizontalIcon className="size-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Close thread panel"
              data-popover-no-drag
              onClick={onClose}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </header>
        <Separator />
        <div
          className="min-h-0 flex-1"
          data-thread-panel-search-open={isSearchOpen}
        >
          {typeof chat === "function"
            ? chat({ onSearchOpenChange: setIsSearchOpen, searchOpen: isSearchOpen })
            : chat}
        </div>
      </div>
    </section>
  )
}

function ThreadPanelErrors({
  codexThreadError,
  companyAgentError,
  renameError,
  threadSelectionError,
}: {
  codexThreadError?: string | null
  companyAgentError?: string | null
  renameError?: string | null
  threadSelectionError?: string | null
}) {
  const errors = [
    codexThreadError,
    companyAgentError,
    threadSelectionError,
    renameError,
  ].filter(Boolean)

  if (errors.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-1 px-3 py-2">
      {errors.map((error) => (
        <Badge className="justify-start truncate" key={error} variant="destructive">
          {error}
        </Badge>
      ))}
    </div>
  )
}

function ThreadPanelMutedText({ text }: { text: string }) {
  return <p className="px-2 py-2 text-xs text-muted-foreground">{text}</p>
}
