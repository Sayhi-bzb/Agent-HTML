import { useMemo, useState } from "react"
import { Settings2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
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
        <SessionRailHeader
          disabled={disabled}
          onCreateSession={onCreateSession}
          onQueryChange={setQuery}
          query={query}
        />
      }
      content={
        <ShellScrollSurface>
          {filtered.map((session) => {
            return (
              <SessionCard
                active={session.id === activeSessionId}
                disabled={disabled}
                key={session.id}
                onDelete={onDeleteSession}
                onOpen={onOpenSession}
                session={session}
              />
            )
          })}
          {filtered.length === 0 ? <ShellEmptyCard>No sessions</ShellEmptyCard> : null}
          {loading ? <ShellLoadingRow>Loading</ShellLoadingRow> : null}
        </ShellScrollSurface>
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
