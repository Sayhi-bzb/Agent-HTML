import { PinIcon, SquarePenIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardFooter } from "@/components/ui/card"
import {
  ShellActionGroup,
  ShellCardHeader,
  ShellIconButton,
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
      <Button
        aria-label={`Open session ${session.name}`}
        className="app-shell-session-card-trigger"
        disabled={disabled}
        onClick={() => onOpen(session.id)}
        type="button"
        variant="ghost"
      />
      <ShellCardHeader
        action={<ShellSessionStatusBadge status={session.status} />}
        className="border-b-0 pb-2"
        title={session.name}
        titleClassName={cn(active && "text-foreground")}
        truncateTitle
      />
      <CardFooter>
        <ShellMetaRow
          action={
            <ShellActionGroup>
              <ShellIconButton
                ariaLabel="Rename session"
                className="app-shell-session-card-action"
                disabled
                size="icon-xs"
                variant="ghost"
              >
                <SquarePenIcon data-icon="inline-start" />
              </ShellIconButton>
              <ShellIconButton
                ariaLabel="Pin session"
                className="app-shell-session-card-action"
                disabled
                size="icon-xs"
                variant="ghost"
              >
                <PinIcon data-icon="inline-start" />
              </ShellIconButton>
              {!active ? (
                <ShellIconButton
                  ariaLabel="Delete session"
                  className="app-shell-session-card-action"
                  disabled={disabled}
                  onClick={() => onDelete(session.id)}
                  size="icon-xs"
                  variant="ghost"
                >
                  <Trash2Icon data-icon="inline-start" />
                </ShellIconButton>
              ) : null}
            </ShellActionGroup>
          }
          copy={formatTimestampLabel(session.updatedAt)}
        />
      </CardFooter>
    </Card>
  )
}
