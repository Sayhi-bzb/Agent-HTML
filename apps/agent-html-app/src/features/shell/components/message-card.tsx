import {
  CardContent,
  Card,
} from "@/components/ui/card"
import type { AgentShellMessage } from "@/lib/types"

import {
  ShellCardHeader,
  ShellStatusBadge,
} from "@/features/app-shell/components/shell-content"
import { MessageBody } from "./message-body"

type MessageCardProps = {
  message: AgentShellMessage
}

export function MessageCard({ message }: MessageCardProps) {
  return (
    <Card size="sm">
      <ShellCardHeader
        action={<ShellStatusBadge label={message.role} variant="outline" />}
        title={message.kind}
        titleSize="sm"
      />
      <CardContent>
        <MessageBody>{message.text}</MessageBody>
      </CardContent>
    </Card>
  )
}
