import { BotIcon, SparklesIcon, TerminalSquareIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import type { AgentShellMessage, RuntimeReport } from "@/lib/types"

import { MessageCard } from "./message-card"
import { RuntimeReportCard } from "./runtime-report-card"

export type ShellPaneProps = {
  messages: AgentShellMessage[]
  messageDraft: string
  runtimeReport?: RuntimeReport
  sending: boolean
  drafting: boolean
  checking: boolean
  onDraftChange: (value: string) => void
  onSend: () => void
  onDraftProposal: () => void
  onRuntimeCheck: () => void
}

function getShellStatusLabel(
  sending: boolean,
  drafting: boolean,
  checking: boolean,
): string {
  if (sending) {
    return "Sending"
  }

  if (drafting) {
    return "Drafting"
  }

  if (checking) {
    return "Checking"
  }

  return ""
}

export function ShellPane({
  messages,
  messageDraft,
  runtimeReport,
  sending,
  drafting,
  checking,
  onDraftChange,
  onSend,
  onDraftProposal,
  onRuntimeCheck,
}: ShellPaneProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BotIcon className="size-4" />
            <span className="text-sm font-medium">Shell</span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onDraftProposal} size="sm" type="button" variant="outline">
              <SparklesIcon data-icon="inline-start" />
              Proposal
            </Button>
            <Button onClick={onRuntimeCheck} size="sm" type="button" variant="outline">
              <TerminalSquareIcon data-icon="inline-start" />
              Doctor
            </Button>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="grid gap-3 p-3">
          {runtimeReport ? <RuntimeReportCard runtimeReport={runtimeReport} /> : null}

          {messages.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))}

          {messages.length === 0 ? (
            <Card size="sm">
              <CardContent className="py-6 text-sm text-muted-foreground">
                Empty
              </CardContent>
            </Card>
          ) : null}
        </div>
      </ScrollArea>
      <div className="border-t p-3">
        <div className="grid gap-2">
          <Textarea
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="..."
            value={messageDraft}
          />
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">
              {getShellStatusLabel(sending, drafting, checking)}
            </div>
            <Button disabled={!messageDraft.trim() || sending} onClick={onSend} type="button">
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
