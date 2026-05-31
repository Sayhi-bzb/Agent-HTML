import type { ReactNode } from "react"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MoreHorizontalIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"
import { useMemo, useState } from "react"

import { Message, MessageContent } from "@/app/prompt-kit/message"
import { cn } from "@/app/shared/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/shared/ui/accordion"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/shared/ui/avatar"
import { Badge } from "@/app/shared/ui/badge"
import { Button } from "@/app/shared/ui/button"
import { Input } from "@/app/shared/ui/input"
import { ScrollArea } from "@/app/shared/ui/scroll-area"
import { Separator } from "@/app/shared/ui/separator"
import type {
  ThreadTranscriptItem,
  ThreadTranscriptState,
  ThreadTranscriptTurn,
} from "@/app/workspace/thread-transcript"

type TranscriptMessageView = {
  align: "left" | "right"
  fallbackName?: string
  isFallback?: boolean
  kind: "agent" | "command" | "system" | "user"
  markdown: boolean
  prelude?: string
  text: string
}

export function PetThreadTranscriptContent({
  composer,
  error,
  isLoading,
  onClose,
  threadId,
  turns,
}: Pick<
  ThreadTranscriptState,
  "error" | "isLoading" | "threadId" | "turns"
> & {
  composer?: ReactNode
  onClose?: () => void
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeMatchIndex, setActiveMatchIndex] = useState(0)
  const subtitle = getTranscriptSubtitle({ threadId })
  const transcriptSearch = useMemo(
    () => buildTranscriptSearch(turns, searchQuery),
    [searchQuery, turns]
  )
  const visibleTurns =
    transcriptSearch.query.length > 0 ? transcriptSearch.turns : turns
  const matchCount = transcriptSearch.matches.length
  const activeMatch =
    matchCount > 0
      ? transcriptSearch.matches[activeMatchIndex % matchCount]
      : undefined
  const canNavigateMatches = matchCount > 0

  function stepActiveMatch(direction: -1 | 1) {
    if (!canNavigateMatches) {
      return
    }
    setActiveMatchIndex((current) => (current + direction + matchCount) % matchCount)
  }

  return (
    <section className="flex h-[min(34rem,calc(100vh-5rem))] min-h-80 w-[34rem] flex-col overflow-hidden rounded-lg border bg-background text-foreground shadow-sm">
      <header
        className="flex cursor-grab items-center gap-3 bg-muted/30 px-4 py-3 active:cursor-grabbing"
        data-selection="none"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar size="default">
            <AvatarImage alt="Thread transcript" src="/avatars/ai.png" />
            <AvatarFallback>AI</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-medium leading-5">
              Thread Transcript
            </h2>
            <p className="truncate text-xs leading-4 text-muted-foreground">
              {subtitle}
            </p>
          </div>
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
            aria-label="More transcript actions"
            data-popover-no-drag
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <MoreHorizontalIcon className="size-4" aria-hidden="true" />
          </Button>
          <Button
            aria-label="Close transcript"
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
      {isSearchOpen ? (
        <>
          <Separator />
          <div
            className="flex items-center gap-2 bg-muted/20 px-3 py-2"
            data-popover-no-drag
            data-selection="none"
          >
            <SearchIcon
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              aria-label="Search transcript text"
              className="h-8 flex-1"
              onChange={(event) => {
                setSearchQuery(event.currentTarget.value)
                setActiveMatchIndex(0)
              }}
              placeholder="Search transcript"
              value={searchQuery}
            />
            <span className="w-16 text-right text-[10px] text-muted-foreground">
              {searchQuery.trim()
                ? `${matchCount ? activeMatchIndex + 1 : 0}/${matchCount}`
                : "0/0"}
            </span>
            <Button
              aria-label="Previous transcript match"
              data-popover-no-drag
              disabled={!canNavigateMatches}
              onClick={() => stepActiveMatch(-1)}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <ChevronUpIcon className="size-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Next transcript match"
              data-popover-no-drag
              disabled={!canNavigateMatches}
              onClick={() => stepActiveMatch(1)}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <ChevronDownIcon className="size-4" aria-hidden="true" />
            </Button>
            <Button
              aria-label="Close transcript search"
              data-popover-no-drag
              onClick={() => {
                setIsSearchOpen(false)
                setSearchQuery("")
                setActiveMatchIndex(0)
              }}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <XIcon className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </>
      ) : null}
      <Separator />

      <div className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
        <ScrollArea
          className="h-full min-w-0 w-full max-w-full"
          data-popover-no-drag
          data-selection="text"
          viewportClassName={cn(
            "min-w-0 w-full max-w-full p-3 [&>div]:!block [&>div]:!min-w-0 [&>div]:!w-full [&>div]:!max-w-full",
            composer && "pb-32"
          )}
        >
          <div
            className="flex min-w-0 w-full max-w-full flex-col gap-4"
            data-popover-no-drag
            data-selection="text"
          >
            {!threadId ? (
              <TranscriptEmptyState text="No thread selected." />
            ) : null}
            {threadId && error ? (
              <TranscriptEmptyState
                text={`Unable to load transcript: ${error}`}
              />
            ) : null}
            {threadId && !error && isLoading && turns.length === 0 ? (
              <TranscriptEmptyState text="Loading transcript..." />
            ) : null}
            {threadId && !error && !isLoading && turns.length === 0 ? (
              <TranscriptEmptyState text="No turns in this thread yet." />
            ) : null}
            {threadId &&
            !error &&
            transcriptSearch.query &&
            visibleTurns.length === 0 ? (
              <TranscriptEmptyState text="No matches in this transcript." />
            ) : null}
            {visibleTurns.map((turn, index) => (
              <TranscriptTurnView
                activeMatch={activeMatch}
                index={index}
                key={turn.id}
                searchQuery={transcriptSearch.query}
                turn={turn}
              />
            ))}
          </div>
        </ScrollArea>
        {composer ? (
          <div
            className="absolute inset-x-0 bottom-0 z-10 px-3 pb-3"
            data-popover-no-drag
          >
            {composer}
          </div>
        ) : null}
      </div>
      {!composer ? (
        <>
          <Separator />
          <footer
            className="flex min-h-9 items-center bg-muted/20 px-4 text-[10px] text-muted-foreground"
            data-selection="none"
          >
            <p className="truncate">
              {getTranscriptFooterText({ threadId, turns })}
            </p>
          </footer>
        </>
      ) : null}
    </section>
  )
}

function getTranscriptSubtitle({
  threadId,
}: Pick<ThreadTranscriptState, "threadId">) {
  if (!threadId) {
    return "No thread selected"
  }
  return threadId
}

function getTranscriptFooterText({
  threadId,
  turns,
}: Pick<ThreadTranscriptState, "threadId" | "turns">) {
  if (!threadId) {
    return "Read-only transcript"
  }
  if (turns.length === 0) {
    return "Read-only transcript"
  }
  return `${turns.length} ${turns.length === 1 ? "turn" : "turns"}`
}

function TranscriptEmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-32 items-center justify-center px-3 py-8 text-center text-xs text-muted-foreground">
      <p className="max-w-60" data-cursor="text">
        {text}
      </p>
    </div>
  )
}

function TranscriptTurnView({
  activeMatch,
  index,
  searchQuery,
  turn,
}: {
  activeMatch?: TranscriptSearchMatch
  index: number
  searchQuery: string
  turn: ThreadTranscriptTurn
}) {
  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-2">
      {turn.items.length > 0 ? (
        <div className="flex min-w-0 w-full max-w-full flex-col gap-2.5">
          {turn.items.map((item) => (
            <TranscriptItemView
              activeMatch={activeMatch}
              item={item}
              key={item.id}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      ) : (
        <p className="px-1 text-xs text-muted-foreground" data-cursor="text">
          No items reported.
        </p>
      )}
      <TurnDivider index={index} status={turn.status} />
    </div>
  )
}

function TurnDivider({
  index,
  status,
}: {
  index: number
  status?: string
}) {
  const visibleStatus = getVisibleTranscriptStatus(status)

  return (
    <div className="flex items-center gap-2 py-1" data-selection="none">
      <Separator className="flex-1" />
      <div className="flex shrink-0 items-center gap-2 text-[10px] font-medium text-muted-foreground">
        <span>Turn {index + 1}</span>
        {visibleStatus ? (
          <Badge variant="outline" className="h-5 text-[10px]">
            {visibleStatus}
          </Badge>
        ) : null}
      </div>
      <Separator className="flex-1" />
    </div>
  )
}

function TranscriptItemView({
  activeMatch,
  item,
  searchQuery,
}: {
  activeMatch?: TranscriptSearchMatch
  item: ThreadTranscriptItem
  searchQuery: string
}) {
  const view = getTranscriptMessageView(item)
  const isUser = view.align === "right"
  const hasCodeBlock = view.markdown && hasMarkdownCodeBlock(view.text)
  const isActiveMatch = activeMatch?.itemId === item.id
  const messageContentClassName = cn(
    hasCodeBlock
      ? "min-w-0 w-full max-w-full text-xs leading-5"
      : "max-w-full text-xs leading-5",
    isUser ? "bg-primary text-primary-foreground" : "bg-transparent p-0",
    isActiveMatch && "ring-1 ring-primary/40"
  )

  if (view.kind === "command") {
    return (
      <TranscriptSystemActivity
        prelude={view.prelude}
        status={item.status}
      >
        <pre
          className="max-h-48 overflow-auto rounded-md bg-muted/50 px-2.5 py-2 font-mono text-[10px] leading-4 whitespace-pre-wrap text-foreground"
          data-cursor="text"
          data-selection="text"
        >
          {view.text}
        </pre>
      </TranscriptSystemActivity>
    )
  }

  if (view.kind === "system") {
    return (
      <TranscriptSystemActivity status={item.status}>
        <TranscriptSystemContent view={view} />
      </TranscriptSystemActivity>
    )
  }

  return (
    <Message
      className={cn(
        "min-w-0 w-full",
        isUser ? "justify-end" : "justify-start"
      )}
      data-popover-no-drag
    >
      <div
        className={[
          hasCodeBlock
            ? "flex w-full max-w-[88%] flex-col gap-1.5"
            : "flex max-w-[88%] flex-col gap-1.5",
          isUser ? "items-end" : "items-start",
        ].join(" ")}
      >
        {view.prelude ? (
          <div
            className="max-w-full px-1 text-[10px] text-muted-foreground break-all"
            data-cursor="text"
          >
            {view.prelude}
          </div>
        ) : null}
        {view.markdown ? (
          <MessageContent
            className={messageContentClassName}
            data-cursor="text"
            markdown
          >
            {view.text}
          </MessageContent>
        ) : (
          <div
            className={cn(
              "rounded-lg p-2 text-foreground bg-secondary prose break-words whitespace-normal",
              messageContentClassName
            )}
            data-cursor="text"
          >
            {highlightTranscriptText(view.text, searchQuery)}
          </div>
        )}
      </div>
    </Message>
  )
}

function hasMarkdownCodeBlock(text: string) {
  return /(^|\n)\s*```/.test(text)
}

type TranscriptSearchMatch = {
  itemId: string
  turnId: string
}

function buildTranscriptSearch(
  turns: ThreadTranscriptTurn[],
  rawQuery: string
) {
  const query = rawQuery.trim()
  if (!query) {
    return {
      matches: [] as TranscriptSearchMatch[],
      query,
      turns,
    }
  }

  const lowerQuery = query.toLowerCase()
  const matches: TranscriptSearchMatch[] = []
  const matchedTurns = turns.flatMap((turn) => {
    const items = turn.items.filter((item) => {
      const text = getTranscriptMessageView(item).text
      const isMatch = text.toLowerCase().includes(lowerQuery)
      if (isMatch) {
        matches.push({ itemId: item.id, turnId: turn.id })
      }
      return isMatch
    })

    return items.length > 0 ? [{ ...turn, items }] : []
  })

  return {
    matches,
    query,
    turns: matchedTurns,
  }
}

function highlightTranscriptText(text: string, query: string) {
  if (!query) {
    return text
  }

  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const parts: ReactNode[] = []
  let cursor = 0
  let index = lowerText.indexOf(lowerQuery)

  while (index !== -1) {
    if (index > cursor) {
      parts.push(text.slice(cursor, index))
    }
    const end = index + query.length
    parts.push(
      <mark
        className="rounded-sm bg-primary/20 px-0.5 text-foreground"
        key={`${index}-${end}`}
      >
        {text.slice(index, end)}
      </mark>
    )
    cursor = end
    index = lowerText.indexOf(lowerQuery, cursor)
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor))
  }

  return parts
}

function TranscriptSystemActivity({
  children,
  prelude,
  status,
}: {
  children: ReactNode
  prelude?: string
  status?: string
}) {
  const visibleStatus = getVisibleTranscriptStatus(status)

  return (
    <div className="flex flex-col gap-1 px-1" data-popover-no-drag>
      {visibleStatus ? (
        <div className="flex min-w-0 items-center gap-2 text-[10px] font-medium text-muted-foreground">
          <Badge className="h-5 text-[10px]" variant="outline">
            {visibleStatus}
          </Badge>
        </div>
      ) : null}
      {prelude ? (
        <div
          className="text-[10px] text-muted-foreground break-all"
          data-cursor="text"
        >
          {prelude}
        </div>
      ) : null}
      {children}
    </div>
  )
}

function TranscriptSystemContent({ view }: { view: TranscriptMessageView }) {
  if (view.isFallback && view.fallbackName) {
    return (
      <Accordion className="text-muted-foreground" collapsible type="single">
        <AccordionItem className="border-0" value="fallback">
          <AccordionTrigger className="py-1 text-[10px] text-muted-foreground hover:no-underline">
            {view.fallbackName}
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <MessageContent
              className="max-w-full bg-transparent p-0 text-xs leading-5 text-muted-foreground"
              data-cursor="text"
              markdown={view.markdown}
            >
              {view.text}
            </MessageContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  return (
    <MessageContent
      className="max-w-full bg-transparent p-0 text-xs leading-5 text-muted-foreground"
      data-cursor="text"
      markdown={view.markdown}
    >
      {view.text}
    </MessageContent>
  )
}

function getVisibleTranscriptStatus(status: string | undefined) {
  return status === "completed" ? undefined : status
}

function getTranscriptMessageView(
  item: ThreadTranscriptItem
): TranscriptMessageView {
  if (item.type === "userMessage") {
    const text = item.contentText ?? "User message"
    return {
      align: "right",
      kind: "user",
      markdown: true,
      text,
    }
  }

  if (item.type === "agentMessage") {
    const text = item.contentText ?? "Writing response..."
    return {
      align: "left",
      kind: "agent",
      markdown: true,
      text,
    }
  }

  if (item.type === "commandExecution") {
    const text = item.aggregatedOutput ?? "Command running..."
    return {
      align: "left",
      kind: "command",
      markdown: false,
      prelude: item.cwd,
      text,
    }
  }

  if (item.type === "plan") {
    return createSystemMessageView(
      item.contentText ?? "Planning...",
      true,
      item.contentText === undefined ? "Plan" : undefined
    )
  }

  if (item.type === "reasoning") {
    return createSystemMessageView(
      item.summaryText ?? "Thinking...",
      true,
      item.summaryText === undefined ? "Reasoning" : undefined
    )
  }

  if (item.type === "fileChange") {
    return createSystemMessageView(
      item.summaryText ?? "Editing files",
      true,
      item.summaryText === undefined ? "File changes" : undefined
    )
  }

  if (item.type === "webSearch") {
    return createSystemMessageView(
      item.query ?? "Search request",
      false,
      item.query === undefined ? "Web search" : undefined
    )
  }

  if (
    item.type === "mcpToolCall" ||
    item.type === "dynamicToolCall" ||
    item.type === "collabToolCall"
  ) {
    const text =
      item.resultText ??
      item.argumentsText ??
      item.server ??
      "Tool call in progress"
    const fallbackName =
      item.type === "mcpToolCall"
        ? "MCP tool call"
        : item.type === "dynamicToolCall"
          ? "Dynamic tool call"
          : "Collab tool call"

    return createSystemMessageView(
      text,
      true,
      item.resultText === undefined &&
        item.argumentsText === undefined &&
        item.server === undefined
        ? fallbackName
        : undefined
    )
  }

  const text =
    item.contentText ??
    item.summaryText ??
    item.resultText ??
    item.status ??
    "No content."

  return createSystemMessageView(
    text,
    true,
    item.contentText === undefined &&
      item.summaryText === undefined &&
      item.resultText === undefined &&
      item.status === undefined
      ? "No content"
      : undefined
  )
}

function createSystemMessageView(
  text: string,
  markdown: boolean,
  fallbackName?: string
): TranscriptMessageView {
  return {
    align: "left" as const,
    fallbackName,
    isFallback: fallbackName !== undefined,
    kind: "system" as const,
    markdown,
    text,
  }
}
