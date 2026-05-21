import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { AgentShellMessage } from "@/lib/types"

type MessageCardProps = {
  message: AgentShellMessage
}

export function MessageCard({ message }: MessageCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">{message.kind}</CardTitle>
          <Badge variant="outline">{message.role}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
      </CardContent>
    </Card>
  )
}
