import { EllipsisIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ShellMetaRow,
  ShellSessionStatusBadge,
  ShellSplitRow,
} from "@/features/app-shell/components/shell-content"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  formatSessionTimestampLabel,
  formatTimestampLabel,
} from "@/lib/time"
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
  const shortTimestamp = formatSessionTimestampLabel(session.updatedAt)
  const fullTimestamp = formatTimestampLabel(session.updatedAt)

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
            !active ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label="Session actions"
                    className="app-shell-session-card-action"
                    disabled={disabled}
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <EllipsisIcon data-icon="inline-start" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onDelete(session.id)}>
                    <Trash2Icon />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null
          }
          copy={
            <Tooltip>
              <TooltipTrigger asChild>
                <span>{shortTimestamp}</span>
              </TooltipTrigger>
              <TooltipContent side="bottom">{fullTimestamp}</TooltipContent>
            </Tooltip>
          }
        />
      </div>
    </section>
  )
}
