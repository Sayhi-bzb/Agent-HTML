import {
  CardContent,
  Card,
} from "@/components/ui/card"
import type { AgentShellMessage } from "@/lib/types"

import {
  ShellCardHeader,
  ShellStatusBadge,
} from "@/features/app-shell/components/shell-content"

type MessageCardProps = {
  message: AgentShellMessage
}

export function MessageCard({ message }: MessageCardProps) {
  return (
    <Card size="sm">
      <ShellCardHeader
        action={<ShellStatusBadge label={message.role} variant="outline" />}
        title={message.kind}
        titleClassName="app-shell-card-heading"
      />
      <CardContent>
        <p className="app-shell-body-copy">{message.text}</p>
      </CardContent>
    </Card>
  )
}
