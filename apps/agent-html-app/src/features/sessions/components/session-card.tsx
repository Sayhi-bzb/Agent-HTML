import { Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import {
  ShellCardHeader,
  ShellMetaRow,
  ShellSessionStatusBadge,
} from "@/features/app-shell/components/shell-content"
import { formatTimestampLabel } from "@/lib/time"
import type { SessionSummary } from "@/lib/types"
import { cn } from "@/lib/utils"

type SessionCardProps = {
  session: SessionSummary
  active: boolean
  disabled: boolean
  onDelete: (sessionId: string) => void
  onOpen: (sessionId: string) => void
}

export function SessionCard({
  session,
  active,
  disabled,
  onDelete,
  onOpen,
}: SessionCardProps) {
  return (
    <Card
      className={cn("app-shell-session-card", active && "app-shell-card-active")}
      size="sm"
    >
      <button
        aria-label={`Open session ${session.name}`}
        className="app-shell-session-card-trigger"
        disabled={disabled}
        onClick={() => onOpen(session.id)}
        type="button"
      />
      <ShellCardHeader
        action={<ShellSessionStatusBadge status={session.status} />}
        title={session.name}
        truncateTitle
      />
      <CardFooter>
        <ShellMetaRow
          action={
            <Button
              aria-label="Delete session"
              className="app-shell-session-card-action"
              disabled={disabled}
              onClick={() => onDelete(session.id)}
              size="icon-xs"
              type="button"
              variant="ghost"
            >
              <Trash2Icon data-icon="inline-start" />
            </Button>
          }
          copy={formatTimestampLabel(session.updatedAt)}
        />
      </CardFooter>
    </Card>
  )
}
