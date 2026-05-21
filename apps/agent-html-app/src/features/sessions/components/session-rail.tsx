import { useMemo, useState } from "react"
import {
  PlusIcon,
  SearchIcon,
  Settings2Icon,
  Trash2Icon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { formatTimestampLabel } from "@/lib/time"
import type { SessionSummary } from "@/lib/types"

import {
  ShellEmptyCard,
  ShellCardHeader,
  ShellLoadingRow,
  ShellMetaRow,
  ShellPaneScaffold,
  ShellSessionStatusBadge,
} from "@/features/app-shell/components/shell-content"
import { filterSessions } from "../lib/filter-sessions"

export type SessionRailProps = {
  sessions: SessionSummary[]
  activeSessionId: string
  loading: boolean
  disabled: boolean
  onCreateSession: () => void
  onDeleteSession: (sessionId: string) => void
  onOpenSession: (sessionId: string) => void
}

export function SessionRail({
  sessions,
  activeSessionId,
  loading,
  disabled,
  onCreateSession,
  onDeleteSession,
  onOpenSession,
}: SessionRailProps) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => filterSessions(sessions, query), [query, sessions])

  return (
    <ShellPaneScaffold
      header={
        <div className="app-shell-stack-compact">
          <div className="app-shell-search-field">
            <SearchIcon className="app-shell-search-icon" />
            <Input
              className="app-shell-search-input"
              disabled={disabled}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              value={query}
            />
          </div>
          <Button
            aria-label="Create session"
            disabled={disabled}
            onClick={onCreateSession}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <PlusIcon data-icon="inline-start" />
          </Button>
        </div>
      }
      content={
        <ScrollArea className="app-shell-scroll-pane">
          <div className="app-shell-surface-grid app-shell-card-inset">
            {filtered.map((session) => {
              const isActive = session.id === activeSessionId
              return (
                <Card
                  className={cn("app-shell-session-card", isActive && "app-shell-card-active")}
                  key={session.id}
                  size="sm"
                >
                  <button
                    aria-label={`Open session ${session.name}`}
                    className="app-shell-session-card-trigger"
                    disabled={disabled}
                    onClick={() => onOpenSession(session.id)}
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
                          onClick={() => onDeleteSession(session.id)}
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
            })}
            {filtered.length === 0 ? <ShellEmptyCard>No sessions</ShellEmptyCard> : null}
            {loading ? <ShellLoadingRow>Loading</ShellLoadingRow> : null}
          </div>
        </ScrollArea>
      }
      footer={
        <Button
          aria-label="Session settings"
          disabled={disabled}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <Settings2Icon data-icon="inline-start" />
        </Button>
      }
    />
  )
}
