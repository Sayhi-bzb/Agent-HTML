import { CheckIcon, EllipsisIcon, PinIcon, SquarePenIcon, Trash2Icon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuDivider,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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
  onRename: (sessionId: string, name: string) => void
  onTogglePinned: (sessionId: string, pinned: boolean) => void
}

export function SessionCard({
  session,
  active,
  disabled,
  onDelete,
  onOpen,
  onRename,
  onTogglePinned,
}: SessionCardProps) {
  const [renaming, setRenaming] = useState(false)
  const [draftName, setDraftName] = useState(session.name)
  const inputRef = useRef<HTMLInputElement>(null)
  const shortTimestamp = formatSessionTimestampLabel(session.updatedAt)
  const fullTimestamp = formatTimestampLabel(session.updatedAt)

  useEffect(() => {
    setDraftName(session.name)
  }, [session.name])

  useEffect(() => {
    if (!renaming) {
      return
    }

    inputRef.current?.focus()
    inputRef.current?.select()
  }, [renaming])

  function submitRename(): void {
    const trimmed = draftName.trim()
    if (!trimmed || trimmed === session.name) {
      setDraftName(session.name)
      setRenaming(false)
      return
    }

    onRename(session.id, trimmed)
    setRenaming(false)
  }

  function cancelRename(): void {
    setDraftName(session.name)
    setRenaming(false)
  }

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
          {renaming ? (
            <Input
              aria-label={`Rename session ${session.name}`}
              className="app-shell-session-rename-input"
              disabled={disabled}
              onBlur={submitRename}
              onChange={(event) => setDraftName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  submitRename()
                }

                if (event.key === "Escape") {
                  event.preventDefault()
                  cancelRename()
                }
              }}
              ref={inputRef}
              value={draftName}
            />
          ) : (
            <p
              className={cn(
                "app-shell-session-card-title",
                active && "text-foreground",
              )}
            >
              {session.name}
            </p>
          )}
          <ShellSessionStatusBadge status={session.status} />
        </ShellSplitRow>
        <ShellMetaRow
          action={
            !renaming ? (
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
                  <DropdownMenuItem
                    disabled={disabled}
                    onClick={() => {
                      setDraftName(session.name)
                      setRenaming(true)
                    }}
                  >
                    <SquarePenIcon />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={disabled}
                    onClick={() => onTogglePinned(session.id, !session.pinned)}
                  >
                    <PinIcon />
                    {session.pinned ? "Unpin" : "Pin"}
                  </DropdownMenuItem>
                  <DropdownMenuDivider />
                  <DropdownMenuItem onClick={() => onDelete(session.id)}>
                    <Trash2Icon />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                aria-label="Confirm rename"
                className="app-shell-session-card-action"
                disabled={disabled}
                onClick={submitRename}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <CheckIcon data-icon="inline-start" />
              </Button>
            )
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
