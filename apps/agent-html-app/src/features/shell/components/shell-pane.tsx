import type { AgentShellMessage, RuntimeReport } from "@/lib/types"

import {
  ShellEmptyCard,
  ShellLoadingRow,
  ShellPaneScaffold,
  ShellScrollSurface,
} from "@/features/app-shell/components/shell-content"
import { MessageCard } from "./message-card"
import { ShellComposer } from "./shell-composer"
import { ShellHeader } from "./shell-header"
import { RuntimeReportCard } from "./runtime-report-card"

type ShellPaneProps = {
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
    return "send"
  }

  if (drafting) {
    return "draft"
  }

  if (checking) {
    return "check"
  }

  return ""
}

function sortShellMessages(messages: AgentShellMessage[]): AgentShellMessage[] {
  const reviewCards = messages.filter(
    (message) => message.proposalSnapshot || message.kind === "context-card",
  )
  const timeline = messages.filter(
    (message) => !message.proposalSnapshot && message.kind !== "context-card",
  )

  return [...reviewCards, ...timeline]
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
  const orderedMessages = sortShellMessages(messages)

  return (
    <ShellPaneScaffold
      footerClassName="app-shell-pane-footer-review"
      header={
        <ShellHeader
          onDraftProposal={onDraftProposal}
          onRuntimeCheck={onRuntimeCheck}
          proposalLocked={proposalLocked}
          runtimeCheckLocked={runtimeCheckLocked}
        />
      }
      content={
        <ShellScrollSurface className="app-shell-structure-list" density="roomy">
          {drafting ? <ShellLoadingRow>Draft</ShellLoadingRow> : null}

          {checking ? <ShellLoadingRow>Check</ShellLoadingRow> : null}

          {orderedMessages.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))}

          {runtimeReport && !checking && orderedMessages.length > 0 ? (
            <RuntimeReportCard runtimeReport={runtimeReport} />
          ) : null}

          {messages.length === 0 ? <ShellEmptyCard className="app-shell-flat-card">Empty</ShellEmptyCard> : null}
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
