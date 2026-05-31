import type { ReactNode } from "react"
import { ActivityIcon, RefreshCwIcon } from "lucide-react"

import { Message, MessageContent } from "@/app/prompt-kit/message"
import { cn } from "@/app/shared/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/shared/ui/accordion"
import { Badge } from "@/app/shared/ui/badge"
import { Button } from "@/app/shared/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/shared/ui/card"
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
    <Card className="h-[min(34rem,calc(100vh-5rem))] min-h-80 w-[34rem] gap-0 py-0">
      <CardHeader
        className="cursor-grab px-4 py-3 active:cursor-grabbing"
        data-selection="none"
      >
        <div className="flex min-w-0 items-center gap-2">
          <ActivityIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <CardTitle className="truncate text-sm">Thread transcript</CardTitle>
        </div>
        <CardDescription className="truncate text-xs">
          {threadId ? threadId : "No thread selected"}
        </CardDescription>
        <CardAction>
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
        </CardAction>
      </CardHeader>
      <Separator />

      <CardContent className="min-h-0 flex-1 px-0">
        <ScrollArea
          className="h-full"
          data-popover-no-drag
          data-selection="text"
          viewportClassName="p-3"
        >
          <div
            className="flex flex-col gap-4"
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
            {turns.map((turn, index) => (
              <TranscriptTurnView index={index} key={turn.id} turn={turn} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
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
  index,
  turn,
}: {
  index: number
  turn: ThreadTranscriptTurn
}) {
  return (
    <div className="flex flex-col gap-2">
      <TurnDivider index={index} status={turn.status} />
      {turn.items.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {turn.items.map((item) => (
            <TranscriptItemView item={item} key={item.id} />
          ))}
        </div>
      ) : (
        <p className="px-1 text-xs text-muted-foreground" data-cursor="text">
          No items reported.
        </p>
      )}
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

function TranscriptItemView({ item }: { item: ThreadTranscriptItem }) {
  const view = getTranscriptMessageView(item)
  const isUser = view.align === "right"

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
      className={isUser ? "justify-end" : "justify-start"}
      data-popover-no-drag
    >
      <div
        className={[
          "flex max-w-[88%] flex-col gap-1.5",
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
        <MessageContent
          className={cn(
            "max-w-full text-xs leading-5",
            isUser ? "bg-primary text-primary-foreground" : "bg-transparent p-0"
          )}
          data-cursor="text"
          markdown={view.markdown}
        >
          {view.text}
        </MessageContent>
      </div>
    </Message>
  )
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
