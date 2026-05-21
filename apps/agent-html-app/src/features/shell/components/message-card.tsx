import type { AgentShellMessage } from "@/lib/types"

import {
  ShellSectionLabel,
  ShellStatusBadge,
} from "@/features/app-shell/components/shell-content"
import { cn } from "@/lib/utils"
import { MessageBody } from "./message-body"

function getMessageLines(message: AgentShellMessage): string[] {
  return message.text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function getMessageLabel(message: AgentShellMessage): string {
  if (message.role === "user") {
    return "You"
  }

  if (message.proposalSnapshot) {
    return "Proposal"
  }

  return "Review"
}

function getMessageTone(message: AgentShellMessage): "default" | "secondary" {
  return message.role === "user" ? "secondary" : "default"
}

function getMessageTitle(message: AgentShellMessage): string {
  if (message.proposalSnapshot) {
    return getMessageLines(message)[0] ?? "Proposal"
  }

  if (message.kind === "context-card") {
    return "Context"
  }

  return "Note"
}

function getMessageItems(message: AgentShellMessage): string[] {
  if (!message.proposalSnapshot) {
    return []
  }

  return getMessageLines(message).slice(1)
}

function getMessageText(message: AgentShellMessage): string {
  if (message.proposalSnapshot) {
    return ""
  }

  return message.text
}

type MessageCardProps = {
  message: AgentShellMessage
}

export function MessageCard({ message }: MessageCardProps) {
  const proposal = Boolean(message.proposalSnapshot)

  return (
    <section
      className={cn(
        "app-shell-message-section",
        proposal
          ? "app-shell-proposal-card"
          : getMessageTone(message) === "secondary"
            ? "app-shell-message-card app-shell-message-card-user"
            : "app-shell-message-card app-shell-message-card-agent",
      )}
    >
      <div className="app-shell-split-row">
        <p className="app-shell-message-heading">{getMessageTitle(message)}</p>
        {proposal ? (
          <ShellSectionLabel>Proposal</ShellSectionLabel>
        ) : (
          <ShellStatusBadge label={getMessageLabel(message)} variant="outline" />
        )}
      </div>
      <MessageBody
        items={getMessageItems(message)}
        text={getMessageText(message)}
      />
    </section>
  )
}
