import { BotIcon, UserIcon } from "lucide-react"

import type { AgentShellMessage } from "@/lib/types"

import {
  ShellSectionLabel,
} from "@/features/app-shell/components/shell-content"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { MessageBody } from "./message-body"

function getMessageLines(message: AgentShellMessage): string[] {
  return message.text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function getMessageTone(message: AgentShellMessage): "default" | "secondary" {
  return message.role === "user" ? "secondary" : "default"
}

function getMessageTitle(message: AgentShellMessage): string | undefined {
  if (message.proposalSnapshot) {
    return getMessageLines(message)[0] ?? "Proposal"
  }

  if (message.kind === "context-card") {
    return "Context"
  }

  return undefined
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
  const title = getMessageTitle(message)
  const genericMessage = !proposal && !title
  const markerIcon = message.role === "user"
    ? <UserIcon className="app-shell-inline-icon" />
    : <BotIcon className="app-shell-inline-icon" />
  const markerLabel = message.role === "user" ? "Your note" : "Review note"

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
      {!genericMessage ? (
        <div className="app-shell-split-row">
          <p className="app-shell-message-heading">{title}</p>
          {proposal ? <ShellSectionLabel>Proposal</ShellSectionLabel> : null}
        </div>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <div aria-label={markerLabel} className="app-shell-message-marker">
              {markerIcon}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">{markerLabel}</TooltipContent>
        </Tooltip>
      )}
      <MessageBody
        items={getMessageItems(message)}
        text={getMessageText(message)}
      />
    </section>
  )
}
