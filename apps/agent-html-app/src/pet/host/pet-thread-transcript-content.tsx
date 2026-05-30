import { ActivityIcon, RefreshCwIcon } from "lucide-react"

import { PetMarkdownText } from "@/app/pet/ghost/pet-markdown-text"
import { Badge } from "@/app/shared/ui/badge"
import { Button } from "@/app/shared/ui/button"
import { ScrollArea } from "@/app/shared/ui/scroll-area"
import type {
  ThreadTranscriptItem,
  ThreadTranscriptState,
  ThreadTranscriptTurn,
} from "@/app/workspace/thread-transcript"

export function PetThreadTranscriptContent({
  error,
  isLoading,
  onReload,
  threadId,
  turns,
}: Pick<
  ThreadTranscriptState,
  "error" | "isLoading" | "threadId" | "turns"
> & {
  onReload?: () => void
}) {
  return (
    <section className="flex h-[min(34rem,calc(100vh-5rem))] min-h-80 w-[34rem] flex-col overflow-hidden rounded-md border border-border/70 bg-popover text-popover-foreground shadow-2xl shadow-black/20">
      <header
        className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 px-4 py-3"
        data-popover-no-drag
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ActivityIcon className="size-4 text-primary" aria-hidden="true" />
            <h2 className="truncate text-sm font-semibold">Thread transcript</h2>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {threadId ? threadId : "No thread selected"}
          </p>
        </div>
        <Button
          aria-label="Refresh transcript"
          data-popover-no-drag
          disabled={!threadId || isLoading}
          onClick={onReload}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <RefreshCwIcon
            className={["size-4", isLoading ? "animate-spin" : ""].join(" ")}
            aria-hidden="true"
          />
        </Button>
      </header>

      <ScrollArea
        className="min-h-0 flex-1"
        data-popover-no-drag
        viewportClassName="p-3"
      >
        <div className="space-y-3" data-popover-no-drag>
          {!threadId ? <TranscriptEmptyState text="No thread selected." /> : null}
          {threadId && error ? (
            <TranscriptEmptyState text={`Unable to load transcript: ${error}`} />
          ) : null}
          {threadId && !error && isLoading && turns.length === 0 ? (
            <TranscriptEmptyState text="Loading transcript..." />
          ) : null}
          {threadId && !error && !isLoading && turns.length === 0 ? (
            <TranscriptEmptyState text="No turns in this thread yet." />
          ) : null}
          {turns.map((turn, index) => (
            <TranscriptTurnView
              index={index}
              key={turn.id}
              turn={turn}
            />
          ))}
        </div>
      </ScrollArea>
    </section>
  )
}

function TranscriptEmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-border/80 bg-muted/30 px-3 py-8 text-center text-xs text-muted-foreground">
      {text}
    </div>
  )
}

function TranscriptTurnView({
  index,
  turn,
}: {
  index: number
  turn: ThreadTranscriptTurn
}) {
  return (
    <article className="rounded-md border border-border/70 bg-background/70">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
        <div className="text-xs font-medium text-foreground">Turn {index + 1}</div>
        {turn.status ? (
          <Badge variant="outline" className="h-5 text-[10px]">
            {turn.status}
          </Badge>
        ) : null}
      </div>
      <div className="space-y-2 p-2">
        {turn.items.length > 0 ? (
          turn.items.map((item) => (
            <TranscriptItemView item={item} key={item.id} />
          ))
        ) : (
          <div className="px-2 py-3 text-xs text-muted-foreground">
            No items reported.
          </div>
        )}
      </div>
    </article>
  )
}

function TranscriptItemView({ item }: { item: ThreadTranscriptItem }) {
  if (item.type === "userMessage") {
    return (
      <TranscriptBubble align="right" label="You">
        <TranscriptText text={item.contentText ?? "User message"} />
      </TranscriptBubble>
    )
  }

  if (item.type === "agentMessage") {
    return (
      <TranscriptBubble align="left" label={item.phase ?? "Codex"}>
        <TranscriptText text={item.contentText ?? "Writing response..."} />
      </TranscriptBubble>
    )
  }

  if (item.type === "plan") {
    return (
      <TranscriptSystemCard item={item} label="Plan">
        <TranscriptText text={item.contentText ?? "Planning..."} />
      </TranscriptSystemCard>
    )
  }

  if (item.type === "commandExecution") {
    return (
      <TranscriptSystemCard item={item} label={item.command ?? "Command"}>
        {item.cwd ? (
          <p className="mb-1 text-[10px] text-muted-foreground">{item.cwd}</p>
        ) : null}
        {item.aggregatedOutput ? (
          <pre className="max-h-36 overflow-auto rounded bg-muted/70 p-2 font-mono text-[10px] whitespace-pre-wrap text-foreground">
            {item.aggregatedOutput}
          </pre>
        ) : null}
      </TranscriptSystemCard>
    )
  }

  if (item.type === "reasoning") {
    return (
      <TranscriptSystemCard item={item} label="Reasoning">
        <TranscriptText text={item.summaryText ?? "Thinking..."} />
      </TranscriptSystemCard>
    )
  }

  if (item.type === "fileChange") {
    return (
      <TranscriptSystemCard item={item} label="File changes">
        <TranscriptText text={item.summaryText ?? "Editing files"} />
      </TranscriptSystemCard>
    )
  }

  if (item.type === "webSearch") {
    return (
      <TranscriptSystemCard item={item} label="Web search">
        <TranscriptText text={item.query ?? "Search request"} />
      </TranscriptSystemCard>
    )
  }

  if (
    item.type === "mcpToolCall" ||
    item.type === "dynamicToolCall" ||
    item.type === "collabToolCall"
  ) {
    return (
      <TranscriptSystemCard item={item} label={item.tool ?? "Tool call"}>
        <TranscriptText
          text={
            item.resultText ??
            item.argumentsText ??
            item.server ??
            "Tool call in progress"
          }
        />
      </TranscriptSystemCard>
    )
  }

  return (
    <TranscriptSystemCard item={item} label={item.type}>
      <TranscriptText
        text={item.contentText ?? item.summaryText ?? item.resultText ?? item.status ?? ""}
      />
    </TranscriptSystemCard>
  )
}

function TranscriptBubble({
  align,
  children,
  label,
}: {
  align: "left" | "right"
  children: React.ReactNode
  label: string
}) {
  return (
    <div className={align === "right" ? "flex justify-end" : "flex justify-start"}>
      <div
        className={[
          "max-w-[88%] rounded-md px-3 py-2 text-xs leading-5",
          align === "right"
            ? "bg-primary text-primary-foreground"
            : "border border-border/70 bg-muted/50 text-foreground",
        ].join(" ")}
      >
        <div className="mb-1 text-[10px] font-medium opacity-70">{label}</div>
        {children}
      </div>
    </div>
  )
}

function TranscriptSystemCard({
  children,
  item,
  label,
}: {
  children: React.ReactNode
  item: ThreadTranscriptItem
  label: string
}) {
  return (
    <div className="rounded-md border border-border/70 bg-muted/25 px-3 py-2 text-xs">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="truncate font-medium text-foreground">{label}</div>
        {item.status ? (
          <Badge variant="outline" className="h-5 text-[10px]">
            {item.status}
          </Badge>
        ) : null}
      </div>
      <div className="text-muted-foreground">{children}</div>
    </div>
  )
}

function TranscriptText({ text }: { text: string }) {
  if (!text.trim()) {
    return <span className="text-muted-foreground">No content.</span>
  }

  return <PetMarkdownText text={text} />
}
