import { Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  ShellActionGroup,
  ShellIconButton,
  ShellMetaRow,
  ShellSessionStatusBadge,
  ShellSplitRow,
} from "@/features/app-shell/components/shell-content"
import { formatSessionTimestampLabel } from "@/lib/time"
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
    <section
      className={cn(
        "group/session app-shell-session-card",
        active && "app-shell-session-card-active",
      )}
    >
      <Button
        aria-label={`Open session ${session.name}`}
        className="app-shell-session-card-trigger"
        disabled={disabled}
        onClick={() => onOpen(session.id)}
        type="button"
        variant="ghost"
      />
      <div className="app-shell-session-card-body">
        <ShellSplitRow className="w-full">
          <p
            className={cn(
              "app-shell-session-card-title",
              active && "text-foreground",
            )}
          >
            {session.name}
          </p>
          <ShellSessionStatusBadge status={session.status} />
        </ShellSplitRow>
        <ShellMetaRow
          action={
            <ShellActionGroup>
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
          copy={formatSessionTimestampLabel(session.updatedAt)}
        />
      </div>
    </section>
  )
}
