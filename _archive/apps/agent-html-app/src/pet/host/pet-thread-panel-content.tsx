import type { CSSProperties, ReactNode } from "react"
import {
  CheckIcon,
  MoreHorizontalIcon,
  PanelLeftIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { useState } from "react"

import { cn } from "@/app/shared/lib/utils"
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
import { Skeleton } from "@/app/shared/ui/skeleton"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarStateProvider,
  useSidebar,
} from "@/app/shared/ui/sidebar"
import {
  getThreadSummaryById,
  type CodexThreadPickerItem,
  type ThreadPreviewState,
} from "@/app/workspace/thread-picker-model"
import type { CodexThreadSummary } from "@/app/codex/connection"
import type { AgentHtmlAgentPromptSubmitInput } from "@/agent-html"

export type ThreadPanelChatRender = (input: {
  onSearchOpenChange: (open: boolean) => void
  searchOpen: boolean
}) => ReactNode

export type ThreadPanelHeaderSlot = (header: ReactNode) => ReactNode

export type ThreadPanelSurfaceSnapshot = {
  activeThreadId?: string | null
  activeThreadName: string
  canSelectThread: boolean
  codexThreadError?: string | null
  companyAgentError?: string | null
  isLoading: boolean
  isSelectingThread: boolean
  items: CodexThreadPickerItem[]
  optimisticThreadNames: Record<string, string>
  renameError?: string | null
  renamingThreadId?: string | null
  searchOpen: boolean
  subtitle: string
  threadSelectionError?: string | null
  threadSummaries: CodexThreadSummary[]
}

export type ThreadPanelAction =
  | { type: "close" }
  | { draft: string; type: "set-message-draft" }
  | { submit: AgentHtmlAgentPromptSubmitInput; type: "submit-prompt" }
  | { type: "interrupt-turn" }
  | { type: "new-thread" }
  | { threadId: string; type: "resume-thread" }
  | { name: string; threadId: string; type: "rename-thread" }
  | { open: boolean; type: "set-search-open" }

export type ThreadPanelDispatch = (
  action: ThreadPanelAction
) => Promise<void> | void

export type ThreadPanelBridge = {
  dispatch: ThreadPanelDispatch
  snapshot: ThreadPanelSurfaceSnapshot
}

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
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const activeThread = items.find((item) => item.threadId === activeThreadId)
  const subtitle =
    activeThread?.previewText || activeThreadId || "No thread selected"

  const snapshot: ThreadPanelSurfaceSnapshot = {
    activeThreadId,
    activeThreadName: activeThread?.displayName ?? "Thread",
    canSelectThread,
    codexThreadError,
    companyAgentError,
    isLoading,
    isSelectingThread,
    items,
    optimisticThreadNames,
    renameError,
    renamingThreadId,
    searchOpen: isSearchOpen,
    subtitle,
    threadSelectionError,
    threadSummaries,
  }

  const dispatch: ThreadPanelDispatch = (action) => {
    switch (action.type) {
      case "close":
        onClose?.()
        return
      case "set-message-draft":
      case "submit-prompt":
      case "interrupt-turn":
        return
      case "new-thread":
        onNewThread()
        return
      case "resume-thread":
        onResumeThread(action.threadId)
        return
      case "rename-thread":
        return onRenameThread({
          name: action.name,
          threadId: action.threadId,
        })
      case "set-search-open":
        setIsSearchOpen(action.open)
        return
    }
  }

  const bridge: ThreadPanelBridge = {
    dispatch,
    snapshot,
  }

  return <ThreadPanelSurface bridge={bridge} chat={chat} />
}

export function ThreadPanelSurface({
  bridge,
  chat,
  headerSlot,
}: {
  bridge: ThreadPanelBridge
  chat: ReactNode | ThreadPanelChatRender
  headerSlot?: ThreadPanelHeaderSlot
}) {
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { dispatch, snapshot } = bridge

  return (
    <SidebarStateProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <ThreadPanelShell
        activeThreadName={snapshot.activeThreadName}
        chat={chat}
        dispatch={dispatch}
        headerSlot={headerSlot}
        isSearchOpen={snapshot.searchOpen}
        subtitle={snapshot.subtitle}
      >
        <ThreadPanelSidebar
          canSelectThread={snapshot.canSelectThread}
          codexThreadError={snapshot.codexThreadError}
          companyAgentError={snapshot.companyAgentError}
          editingName={editingName}
          editingThreadId={editingThreadId}
          isLoading={snapshot.isLoading}
          isSelectingThread={snapshot.isSelectingThread}
          items={snapshot.items}
          dispatch={dispatch}
          onEditingNameChange={setEditingName}
          onEditingThreadIdChange={setEditingThreadId}
          optimisticThreadNames={snapshot.optimisticThreadNames}
          renameError={snapshot.renameError}
          renamingThreadId={snapshot.renamingThreadId}
          threadSelectionError={snapshot.threadSelectionError}
          threadSummaries={snapshot.threadSummaries}
        />
      </ThreadPanelShell>
    </SidebarStateProvider>
  )
}

function ThreadPanelShell({
  activeThreadName,
  chat,
  children,
  dispatch,
  headerSlot,
  isSearchOpen,
  subtitle,
}: {
  activeThreadName: string
  chat: ReactNode | ThreadPanelChatRender
  children: ReactNode
  dispatch: ThreadPanelDispatch
  headerSlot?: ThreadPanelHeaderSlot
  isSearchOpen: boolean
  subtitle: string
}) {
  const { open, toggleSidebar } = useSidebar()
  const header = (
    <ThreadPanelHeader
      activeThreadName={activeThreadName}
      isSearchOpen={isSearchOpen}
      isSidebarOpen={open}
      onClose={() => dispatch({ type: "close" })}
      onSearchOpenChange={(nextOpen) =>
        dispatch({
          open: nextOpen,
          type: "set-search-open",
        })
      }
      onToggleSidebar={toggleSidebar}
      subtitle={subtitle}
    />
  )

  return (
    <section
      className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-lg border bg-background text-foreground shadow-sm"
      style={
        {
          "--sidebar": "var(--background)",
          "--sidebar-foreground": "var(--foreground)",
          "--sidebar-accent": "var(--muted)",
          "--sidebar-accent-foreground": "var(--foreground)",
          "--sidebar-border": "var(--border)",
          "--sidebar-ring": "var(--ring)",
        } as CSSProperties
      }
    >
      {headerSlot ? headerSlot(header) : header}
      <Separator />
      <main className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "group flex shrink-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground transition-[width] duration-200",
            open ? "w-72" : "w-0"
          )}
          data-collapsible={open ? "" : "icon"}
          data-state={open ? "expanded" : "collapsed"}
        >
          {open ? children : null}
        </aside>
        <div
          className="min-h-0 min-w-0 flex-1"
          data-thread-panel-search-open={isSearchOpen}
        >
          {typeof chat === "function"
            ? chat({
                onSearchOpenChange: (open) =>
                  dispatch({
                    open,
                    type: "set-search-open",
                  }),
                searchOpen: isSearchOpen,
              })
            : chat}
        </div>
      </main>
    </section>
  )
}

function ThreadPanelHeader({
  activeThreadName,
  isSearchOpen,
  isSidebarOpen,
  onClose,
  onSearchOpenChange,
  onToggleSidebar,
  subtitle,
}: {
  activeThreadName: string
  isSearchOpen: boolean
  isSidebarOpen: boolean
  onClose: () => void
  onSearchOpenChange: (open: boolean) => void
  onToggleSidebar: () => void
  subtitle: string
}) {
  return (
    <div
      className="flex min-h-14 w-full min-w-0 items-center gap-3 bg-muted/30 px-4"
      data-selection="none"
    >
      <Button
        aria-label="Toggle thread sidebar"
        aria-pressed={isSidebarOpen}
        data-popover-no-drag
        data-tauri-no-drag
        data-window-no-drag
        onClick={onToggleSidebar}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <PanelLeftIcon className="size-4" aria-hidden="true" />
      </Button>
      <Avatar size="default">
        <AvatarImage alt="Thread transcript" src="/avatars/ai.png" />
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-medium leading-5">
          {activeThreadName}
        </h2>
        <p className="truncate text-xs leading-4 text-muted-foreground">
          {subtitle}
        </p>
      </div>
      <div
        className="flex shrink-0 items-center gap-1"
        data-tauri-no-drag
        data-window-no-drag
      >
        <Button
          aria-label="Search transcript"
          aria-pressed={isSearchOpen}
          data-popover-no-drag
          onClick={() => onSearchOpenChange(!isSearchOpen)}
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
    </div>
  )
}

function ThreadPanelSidebar({
  canSelectThread,
  codexThreadError,
  companyAgentError,
  editingName,
  editingThreadId,
  dispatch,
  isLoading,
  isSelectingThread,
  items,
  onEditingNameChange,
  onEditingThreadIdChange,
  optimisticThreadNames,
  renameError,
  renamingThreadId,
  threadSelectionError,
  threadSummaries,
}: {
  canSelectThread: boolean
  codexThreadError?: string | null
  companyAgentError?: string | null
  editingName: string
  editingThreadId: string | null
  dispatch: ThreadPanelDispatch
  isLoading: boolean
  isSelectingThread: boolean
  items: CodexThreadPickerItem[]
  onEditingNameChange: (name: string) => void
  onEditingThreadIdChange: (threadId: string | null) => void
  optimisticThreadNames: Record<string, string>
  renameError?: string | null
  renamingThreadId?: string | null
  threadSelectionError?: string | null
  threadSummaries: CodexThreadSummary[]
}) {
  return (
    <>
      <ThreadPanelErrors
        codexThreadError={codexThreadError}
        companyAgentError={companyAgentError}
        renameError={renameError}
        threadSelectionError={threadSelectionError}
      />
      <SidebarContent data-popover-no-drag data-thread-picker-no-drag="">
        <SidebarGroup>
          <SidebarGroupLabel>Codex threads</SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="min-h-0 flex-1" viewportClassName="pr-1">
              <SidebarMenu className="gap-1">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    data-popover-no-drag
                    disabled={!canSelectThread || isSelectingThread}
                    onClick={() => dispatch({ type: "new-thread" })}
                    title={canSelectThread ? undefined : "Codex is starting"}
                    type="button"
                  >
                    <PlusIcon aria-hidden="true" />
                    <span className="truncate font-medium">New thread</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {!canSelectThread ? (
                  <ThreadPanelListSkeleton />
                ) : isLoading ? (
                  <ThreadPanelListSkeleton />
                ) : items.length > 0 ? (
                  items.map((item) => {
                    const summary = getThreadSummaryById(
                      threadSummaries,
                      item.threadId
                    )
                    const isEditing = editingThreadId === item.threadId
                    const isRenaming = renamingThreadId === item.threadId

                    return (
                      <SidebarMenuItem key={item.threadId}>
                        {isEditing ? (
                          <form
                            className="flex min-w-0 flex-1 items-center gap-1.5"
                            onSubmit={(event) => {
                              event.preventDefault()
                              const nextName = editingName.trim()
                              if (!nextName || isRenaming) {
                                return
                              }
                              void Promise.resolve(
                                dispatch({
                                  name: nextName,
                                  threadId: item.threadId,
                                  type: "rename-thread",
                                })
                              ).then(() => onEditingThreadIdChange(null))
                            }}
                          >
                            <Input
                              autoFocus
                              className="h-7 min-w-0 flex-1 px-2 text-xs"
                              disabled={isRenaming}
                              onChange={(event) =>
                                onEditingNameChange(event.target.value)
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
                              onClick={() => onEditingThreadIdChange(null)}
                              type="button"
                              variant="ghost"
                            >
                              <XIcon className="size-3.5" />
                            </Button>
                          </form>
                        ) : (
                          <>
                            <SidebarMenuButton
                              aria-current={
                                item.isCurrentThread ? "true" : undefined
                              }
                              disabled={!canSelectThread || isSelectingThread}
                              isActive={item.isCurrentThread}
                              onClick={() =>
                                dispatch({
                                  threadId: item.threadId,
                                  type: "resume-thread",
                                })
                              }
                              type="button"
                            >
                              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-sidebar-accent text-[10px] font-medium text-sidebar-accent-foreground">
                                {getThreadInitial(item.displayName)}
                              </span>
                              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <span className="flex min-w-0 items-center gap-2">
                                  <span className="min-w-0 flex-1 truncate font-medium">
                                    {item.displayName}
                                  </span>
                                  <span className="shrink-0 text-[10px] text-sidebar-foreground/50">
                                    {item.timestamp}
                                  </span>
                                </span>
                                <span className="truncate text-xs text-sidebar-foreground/60">
                                  {item.previewText}
                                </span>
                              </span>
                            </SidebarMenuButton>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction
                                  aria-label="Thread actions"
                                  data-popover-no-drag
                                  showOnHover
                                  title="Thread actions"
                                  type="button"
                                >
                                  <MoreHorizontalIcon className="size-3.5" />
                                </SidebarMenuAction>
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
                                    onEditingThreadIdChange(item.threadId)
                                    onEditingNameChange(
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
                      </SidebarMenuItem>
                    )
                  })
                ) : (
                  <ThreadPanelMutedText text="No Codex threads yet." />
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
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
        <Badge
          className="justify-start truncate"
          key={error}
          variant="destructive"
        >
          {error}
        </Badge>
      ))}
    </div>
  )
}

function ThreadPanelMutedText({ text }: { text: string }) {
  return <p className="px-2 py-2 text-xs text-sidebar-foreground/60">{text}</p>
}

function ThreadPanelListSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <SidebarMenuItem key={index}>
          <div className="flex min-h-11 items-center gap-2 rounded-md px-2 py-1.5">
            <Skeleton className="size-6 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 flex-1" />
                <Skeleton className="h-2.5 w-10 shrink-0" />
              </div>
              <Skeleton className="h-2.5 w-4/5" />
            </div>
          </div>
        </SidebarMenuItem>
      ))}
    </>
  )
}

function getThreadInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "T"
}
