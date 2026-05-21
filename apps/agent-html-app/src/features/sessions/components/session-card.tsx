import { CheckIcon, EllipsisIcon, SquarePenIcon, Trash2Icon } from "lucide-react"
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
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { SessionSummary } from "@/lib/types"
import { cn } from "@/lib/utils"

type SessionCardProps = {
  session: SessionSummary
  active: boolean
  disabled: boolean
  onDelete: (sessionId: string) => void
  onOpen: (sessionId: string) => void
  onRename: (sessionId: string, name: string) => void
}

export function SessionCard({
  session,
  active,
  disabled,
  onDelete,
  onOpen,
  onRename,
}: SessionCardProps) {
  const [renaming, setRenaming] = useState(false)
  const [draftName, setDraftName] = useState(session.name)
  const inputRef = useRef<HTMLInputElement>(null)

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
    <SidebarMenuItem
      className={cn(
        "group/session app-shell-session-card",
        active && "app-shell-session-card-active",
      )}
    >
      <div className="app-shell-session-card-body">
        <SidebarMenuButton
          aria-label={`Open session ${session.name}`}
          className="app-shell-session-card-row"
          disabled={disabled}
          isActive={active}
          onClick={() => onOpen(session.id)}
          type="button"
        >
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
                active && "text-shell-text-primary",
              )}
            >
              {session.name}
            </p>
          )}
        </SidebarMenuButton>
        {!renaming ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction
                aria-label="Session actions"
                className="app-shell-session-card-action"
                disabled={disabled}
                showOnHover
                type="button"
              >
                <EllipsisIcon data-icon="inline-start" />
              </SidebarMenuAction>
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
            className="app-shell-session-card-action app-shell-session-card-action-static"
            disabled={disabled}
            onClick={submitRename}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <CheckIcon data-icon="inline-start" />
          </Button>
        )}
      </div>
    </SidebarMenuItem>
  )
}
