import { BotIcon, SparklesIcon, TerminalSquareIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { AgentShellMessage, RuntimeReport } from "@/lib/types"

import {
  ShellEmptyCard,
  ShellLoadingRow,
  ShellPaneHeader,
  ShellPaneScaffold,
  ShellPaneLabel,
  ShellScrollSurface,
} from "@/features/app-shell/components/shell-content"
import { MessageCard } from "./message-card"
import { ShellComposer } from "./shell-composer"
import { RuntimeReportCard } from "./runtime-report-card"

export type ShellPaneProps = {
  messages: AgentShellMessage[]
  messageDraft: string
  runtimeReport?: RuntimeReport
  sending: boolean
  drafting: boolean
  checking: boolean
  interactionLocked: boolean
  proposalLocked: boolean
  runtimeCheckLocked: boolean
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
  interactionLocked,
  proposalLocked,
  runtimeCheckLocked,
  onDraftChange,
  onSend,
  onDraftProposal,
  onRuntimeCheck,
}: ShellPaneProps) {
  return (
    <ShellPaneScaffold
      header={
        <ShellPaneHeader
          leading={
            <ShellPaneLabel
              icon={<BotIcon className="app-shell-inline-icon" />}
              title="Shell"
            />
          }
          trailing={
            <>
              <Button
                disabled={proposalLocked}
                onClick={onDraftProposal}
                size="sm"
                type="button"
                variant="outline"
              >
                <SparklesIcon data-icon="inline-start" />
                Proposal
              </Button>
              <Button
                disabled={runtimeCheckLocked}
                onClick={onRuntimeCheck}
                size="sm"
                type="button"
                variant="outline"
              >
                <TerminalSquareIcon data-icon="inline-start" />
                Doctor
              </Button>
            </>
          }
        />
      }
      content={
        <ShellScrollSurface density="roomy">
          {drafting ? <ShellLoadingRow>Drafting proposal</ShellLoadingRow> : null}

          {checking ? <ShellLoadingRow>Running doctor</ShellLoadingRow> : null}

          {runtimeReport ? <RuntimeReportCard runtimeReport={runtimeReport} /> : null}

          {messages.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))}

          {messages.length === 0 ? <ShellEmptyCard>Empty</ShellEmptyCard> : null}
        </ShellScrollSurface>
      }
      footer={
        <ShellComposer
          draft={messageDraft}
          interactionLocked={interactionLocked}
          onDraftChange={onDraftChange}
          onSend={onSend}
          statusLabel={getShellStatusLabel(sending, drafting, checking)}
        />
      }
    />
  )
}
