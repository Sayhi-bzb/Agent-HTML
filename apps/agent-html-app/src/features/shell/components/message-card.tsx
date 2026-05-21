import {
  CardContent,
} from "@/components/ui/card"
import type { AgentShellMessage } from "@/lib/types"

import {
  ShellCardHeader,
  ShellStatusBadge,
} from "@/features/app-shell/components/shell-content"
import { MessageBody } from "./message-body"
import { ShellCardFrame } from "./shell-card-frame"

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
  return (
    <ShellCardFrame
      className={
        getMessageTone(message) === "secondary"
          ? "app-shell-message-card app-shell-message-card-user"
          : "app-shell-message-card app-shell-message-card-agent"
      }
    >
      <ShellCardHeader
        action={<ShellStatusBadge label={getMessageLabel(message)} variant="outline" />}
        title={getMessageTitle(message)}
        titleSize="sm"
      />
      <CardContent>
        <MessageBody items={getMessageItems(message)} text={getMessageText(message)} />
      </CardContent>
    </ShellCardFrame>
  )
}
