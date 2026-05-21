import { useMemo, useState } from "react"
import { Settings2Icon } from "lucide-react"

import type { SessionSummary } from "@/lib/types"

import {
  ShellEmptyCard,
  ShellIconButton,
  ShellLoadingRow,
  ShellSectionLabel,
  ShellPaneScaffold,
  ShellScrollSurface,
} from "@/features/app-shell/components/shell-content"
import { filterSessions } from "../lib/filter-sessions"
import { SessionCard } from "./session-card"
import { SessionRailHeader } from "./session-rail-header"

type SessionGroup = {
  key: string
  label: string
  sessions: SessionSummary[]
}

function createSessionGroups(
  sessions: SessionSummary[],
  activeSessionId: string,
): SessionGroup[] {
  const current = sessions.filter((session) => session.id === activeSessionId)
  const pinned = sessions.filter((session) => session.id !== activeSessionId && session.pinned)
  const needsAttention = sessions.filter(
    (session) => session.id !== activeSessionId && !session.pinned && session.status === "error",
  )
  const recent = sessions.filter(
    (session) =>
      session.id !== activeSessionId &&
      !session.pinned &&
      session.status !== "error",
  )

  return [
    { key: "current", label: "Current", sessions: current },
    { key: "pinned", label: "Pinned", sessions: pinned },
    { key: "needs-attention", label: "Needs attention", sessions: needsAttention },
    { key: "recent", label: "Recent", sessions: recent },
  ].filter((group) => group.sessions.length > 0)
}

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
  const grouped = useMemo(
    () => createSessionGroups(filtered, activeSessionId),
    [activeSessionId, filtered],
  )

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
          {grouped.map((group) => (
            <section className="app-shell-session-group" key={group.key}>
              <ShellSectionLabel>{group.label}</ShellSectionLabel>
              <div className="app-shell-divider-list">
                {group.sessions.map((session) => (
                  <SessionCard
                    active={session.id === activeSessionId}
                    disabled={disabled}
                    key={session.id}
                    onDelete={onDeleteSession}
                    onOpen={onOpenSession}
                    session={session}
                  />
                ))}
              </div>
            </section>
          ))}
          {filtered.length === 0 ? <ShellEmptyCard className="app-shell-flat-card">None</ShellEmptyCard> : null}
          {loading ? <ShellLoadingRow>Load</ShellLoadingRow> : null}
        </ShellScrollSurface>
      }
      footer={
        <ShellIconButton
          ariaLabel="Session settings"
          disabled={disabled}
          variant="ghost"
        >
          <Settings2Icon data-icon="inline-start" />
        </ShellIconButton>
      }
    />
  )
}
