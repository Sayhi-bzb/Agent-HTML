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
        <ShellHeader
          onDraftProposal={onDraftProposal}
          onRuntimeCheck={onRuntimeCheck}
          proposalLocked={proposalLocked}
          runtimeCheckLocked={runtimeCheckLocked}
        />
      }
      content={
        <ShellScrollSurface className="app-shell-section-stack" density="roomy">
          {drafting ? <ShellLoadingRow>Draft</ShellLoadingRow> : null}

          {checking ? <ShellLoadingRow>Check</ShellLoadingRow> : null}

          {messages.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))}

          {runtimeReport && !checking ? (
            <RuntimeReportCard runtimeReport={runtimeReport} />
          ) : null}

          {messages.length === 0 ? <ShellEmptyCard>Idle</ShellEmptyCard> : null}
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
