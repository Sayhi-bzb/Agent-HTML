import { useMemo, useState } from "react"

import type { SessionSummary } from "@/lib/types"

import {
  ShellEmptyCard,
  ShellLoadingRow,
  ShellPaneScaffold,
  ShellScrollSurface,
} from "@/features/app-shell/components/shell-content"
import { filterSessions } from "../lib/filter-sessions"
import { SessionCard } from "./session-card"
import { SessionRailHeader } from "./session-rail-header"

type SessionRailProps = {
  sessions: SessionSummary[]
  activeSessionId: string
  loading: boolean
  disabled: boolean
  onCreateSession: () => void
  onDeleteSession: (sessionId: string) => void
  onOpenSession: (sessionId: string) => void
  onRenameSession: (sessionId: string, name: string) => void
}

export function SessionRail({
  sessions,
  activeSessionId,
  loading,
  disabled,
  onCreateSession,
  onDeleteSession,
  onOpenSession,
  onRenameSession,
}: SessionRailProps) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => filterSessions(sessions, query), [query, sessions])

  return (
    <ShellPaneScaffold
      header={
        <SessionRailHeader
          disabled={disabled}
          onCreateSession={onCreateSession}
          onQueryChange={setQuery}
          query={query}
        />
      }
      content={
        <ShellScrollSurface>
          <div className="app-shell-divider-list">
            {filtered.map((session) => (
              <SessionCard
                active={session.id === activeSessionId}
                disabled={disabled}
                key={session.id}
                onDelete={onDeleteSession}
                onOpen={onOpenSession}
                onRename={onRenameSession}
                session={session}
              />
            ))}
          </div>
          {filtered.length === 0 ? <ShellEmptyCard className="app-shell-flat-card">Empty</ShellEmptyCard> : null}
          {loading ? <ShellLoadingRow>Load</ShellLoadingRow> : null}
        </ShellScrollSurface>
      }
    />
  )
}
